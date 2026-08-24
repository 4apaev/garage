import Http from 'node:http'
import { setTimeout } from 'node:timers/promises'

import { describe, it, before, after } from 'node:test'
import { deepEqual, equal, ok } from 'node:assert/strict'

import Garage from '../src/index.js'
import { start, stop } from './server.js'
import createWss, {
    OP,
    acceptKey,
    encodeFrame,
    createFrameParser,
} from '../src/mw/ws.js'

describe('ws', () => {

    // ── frame codec ──────────────────────────────────────────

    // known-answer test: the worked example published in rfc 6455 §1.3 -
    // key base64("the sample nonce") must hash to exactly this accept.
    // pins the sha1 + MAGIC + base64 chain: wrong digest, swapped
    // concatenation or a typo'd guid fails here, no sockets involved
    it('acceptKey matches the rfc 6455 sample', () => {
        equal(acceptKey('dGhlIHNhbXBsZSBub25jZQ=='), 's3pPLMBiTxaQ9kYGzzhZRbK+xOo=')
    })

    it('frame codec roundtrips short, medium and long payloads', () => {
        for (const n of [ 5, 300, 70000 ]) {
            const payload = 'x'.repeat(n)
            const frames  = []
            createFrameParser(f => frames.push(f)).push(encodeFrame(payload))

            equal(frames.length, 1)
            equal(frames[ 0 ].opcode, OP.text)
            equal(frames[ 0 ].payload.toString(), payload)
            ok(frames[ 0 ].fin)
        }
    })

    it('frame parser unmasks client frames', () => {
        const frames = []
        createFrameParser(f => frames.push(f)).push(encodeFrame('hello', { mask: true }))

        equal(frames[ 0 ].masked, true)
        equal(frames[ 0 ].payload.toString(), 'hello')
    })

    it('frame parser survives byte-at-a-time delivery', () => {
        const frames = []
        const parser = createFrameParser(f => frames.push(f))
        const wire   = encodeFrame('sliced', { mask: true })

        for (const byte of wire)
            parser.push(Buffer.from([ byte ]))

        equal(frames.length, 1)
        equal(frames[ 0 ].payload.toString(), 'sliced')
    })

    it('frame parser emits multiple frames from one chunk', () => {
        const frames = []
        createFrameParser(f => frames.push(f)).push(Buffer.concat([
            encodeFrame('one'),
            encodeFrame('two'),
        ]))

        deepEqual(frames.map(f => f.payload.toString()), [ 'one', 'two' ])
    })

    // ── createWss, wired onto a real garage app ─────────────────

    let app, wss, anonApp, anon

    before(async () => {
        wss = createWss({ authenticate: rq => ({ token: new URL(rq.url, 'http://x').searchParams.get('token') }) })
        app = await serve(wss)

        anon    = createWss()                  // no authenticate - default anonymous path
        anonApp = await serve(anon)
    })

    after(() => Promise.all([ stop(app), stop(anonApp) ]))

    it('upgrades without an authenticate hook (anonymous by default)', async () => {
        const { rs, socket } = await wsConnect(anonApp.server.address().port)
        equal(rs.statusCode, 101)

        let meta
        anon.each(m => meta = m)
        equal(meta, undefined)
        socket.destroy()
    })

    it('rejects the upgrade with 401 when authenticate throws', async () => {
        const guarded = createWss({ authenticate() { throw new Error('nope') } })
        const guardedApp = await serve(guarded)

        try {
            const { rs, socket } = await wsConnect(guardedApp.server.address().port)
            equal(rs.statusCode, 401)
            socket?.destroy()
        }
        finally {
            await stop(guardedApp)
        }
    })

    it('rejects with 400 on a malformed upgrade request', async () => {
        const { rs, socket } = await wsConnect(app.server.address().port, '', { upgrade: 'chat' })
        equal(rs.statusCode, 400)
        socket?.destroy()
    })

    it('each() exposes the authenticate() result per connection', async () => {
        const { socket } = await wsConnect(app.server.address().port, '?token=abc')

        const metas = []
        wss.each(m => metas.push(m))

        deepEqual(metas.at(-1), { token: 'abc' })
        socket.destroy()
    })

    it('answers ping with pong and close with close', async () => {
        const { socket } = await wsConnect(app.server.address().port)

        let resolvePong, resolveClosed
        const pong   = new Promise(ok => resolvePong   = ok)
        const closed = new Promise(ok => resolveClosed = ok)

        const parser = createFrameParser(f => {
            if (f.opcode === OP.pong)  resolvePong(f)
            if (f.opcode === OP.close) resolveClosed(f)
        })
        socket.on('data', chunk => parser.push(chunk))

        socket.write(encodeFrame('marco', { opcode: OP.ping, mask: true }))
        const pongFrame = await pong

        equal(pongFrame.opcode, OP.pong)
        equal(pongFrame.payload.toString(), 'marco')

        socket.write(encodeFrame(Buffer.alloc(0), { opcode: OP.close, mask: true }))
        await closed
    })

    it('closes the connection on an unmasked client frame', async () => {
        const { socket } = await wsConnect(app.server.address().port)
        const closed = new Promise(ok => socket.on('close', ok))

        socket.resume()                        // paused upgrade socket never sees the fin
        socket.write(encodeFrame('cheat', { mask: false }))
        await closed
    })

    it('heartbeat drops a silent connection', async () => {
        const beat    = createWss({ ping: 40 })
        const beatApp = await serve(beat)

        try {
            const { socket } = await wsConnect(beatApp.server.address().port)

            // registration is synchronous inside handleUpgrade, strictly
            // before the 101 write's network round-trip completes - no
            // race, no need to wait for it
            equal(beat.stats().sockets, 1)

            const closed = new Promise(ok => socket.on('close', ok))
            socket.resume()

            await closed                        // no pong sent -> heartbeat drops it after 2 intervals (~80ms)
            await setTimeout(20)                // small margin, not a poll - see plan notes
            equal(beat.stats().sockets, 0)
        }
        finally {
            beat.close()
            await stop(beatApp)
        }
    })
})

// wires a fresh wss onto a real garage app's 'upgrade' event - the exact
// manual-wiring pattern documented for consumers, exercised against a real
// Garage instance (not a bare http.Server) to prove the integration works
async function serve(wss) {
    const app = new Garage
    await start(app)
    app.server.on('upgrade', (rq, socket) => wss.handleUpgrade(rq, socket))
    return app
}

// raw upgrade client for testing anything wired to `server.on('upgrade')` -
// a real websocket handshake, no ws library. `path` is appended to '/'
// (pass a full query string like '?token=...' or a path like '/foo').
// resolves { rs, socket } on 101, { rs } (no socket) on a plain http
// refusal (400/401/...). the caller owns the socket - write frames, read
// with `socket.on('data', ...)`, remember to `socket.destroy()` when done
function wsConnect(port, path = '', headers = {}) {
    return new Promise((resolve, reject) => {
        const rq = Http.request({
            port,
            path   : `/${ path }`,
            headers: {
                connection         : 'Upgrade',
                upgrade            : 'websocket',
                'sec-websocket-key': 'dGhlIHNhbXBsZSBub25jZQ==',
                ...headers,
            },
        })
        rq.on('upgrade', (rs, socket) => {
            socket.on('error', () => {})
            resolve({ rs, socket })
        })
        rq.on('response', rs => resolve({ rs }))
        rq.on('error', reject)
        rq.end()
    })
}
