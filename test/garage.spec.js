import Fs   from 'node:fs/promises'
import Http from 'node:http'
import Os   from 'node:os'
import Path from 'node:path'

import { once } from 'node:events'

import { describe, it } from 'node:test'
import { deepEqual, equal, ok, throws } from 'node:assert/strict'

import {
    Req,
    Res,
    Garage,
} from '../src/index.js'
import { Fail } from '../src/util.js'

describe('garage', () => {
    it('creates a node http server with garage request and response classes', () => {
        const server = Garage.create(() => {})

        ok(server instanceof Http.Server)
        equal(server[ Symbol.asyncDispose ] instanceof Function, true)
        server.close()
    })

    it('extends node request and response classes', () => {
        ok(Req.prototype instanceof Http.IncomingMessage)
        ok(Res.prototype instanceof Http.ServerResponse)
        equal(typeof Res.prototype.json, 'function')
    })

    it('constructs garage apps with options and helper factories', () => {
        const app = Garage.of({ name: 'shop', port: 0 })

        ok(app instanceof Garage)
        equal(app.options.name, 'shop')
        equal(app.options.port, 0)

        const server = app.init()

        ok(server instanceof Http.Server)
        equal(app.server, server)
        server.close()
    })

    it('listens on the configured port and reports options', async () => {
        const app = Garage.of({ name: 'shop', port: 0 })
        const table = console.table
        let reported

        console.table = x => { reported = x }

        try {
            app.listen()
            await once(app.server, 'listening')
        }
        finally {
            console.table = table
        }

        try {
            ok(app.server.listening)
            ok(app.server.address().port > 0)
            equal(reported, app.options)
        }
        finally {
            await stop(app)
        }
    })

    it('listens on the configured port and reports options', async t => {
        const app = Garage.of({ name: 'shop', port: 0 })

        t.mock.method(console, 'table')

        app.listen()
        await once(app.server, 'listening')

        try {
            equal(console.table.mock.callCount(), 1)

            const [ call ] = console.table.mock.calls

            equal(call.this, console)
            equal(call.arguments.length, 1)

            const [ argv ] = call.arguments

            equal(argv.port, 0)
            equal(argv.name, 'shop')
            deepEqual(argv, app.options)
        }
        finally {
            t.mock.reset()
            await stop(app)
        }
    })

    it('routes by method and url pattern', async () => {
        const app = new Garage
        app.get('/items/:id', (rq, rs) => rs.json(200, { id: rq.params.id }))

        const url = await start(app)
        try {
            const res = await fetch(url + '/items/a%20b')

            equal(res.status, 200)
            deepEqual(await res.json(), { id: 'a b' })
        }
        finally {
            await stop(app)
        }
    })

    it('freezes garage middleware after initialization', async () => {
        const app = new Garage

        app.get('/first', (rq, rs, next) => next())
        app.get('/second', (rq, rs) => rs.send(201, 'second'))
        app.use((rq, rs) => rs.send(404, 'not found'))

        const url = await start(app)
        try {
            throws(() => app.get('/late', () => {}), /garage already initialized/)

            const first  = await fetch(url + '/first')
            const second = await fetch(url + '/second')

            equal(first.status, 404)
            equal(await first.text(), 'not found')
            equal(second.status, 201)
            equal(await second.text(), 'second')
        }
        finally {
            await stop(app)
        }
    })

    it('handles errors through the default onerror hook', async () => {
        const app = new Garage
        let event

        app.get('/missing', () => Fail.raise(404, 'missing'))
        app.on('error', (e, rq, rs) => {
            event = { e, rq, rs }
        })

        const url = await start(app)
        try {
            const res = await fetch(url + '/missing')

            equal(res.status, 404)
            equal(res.headers.get('content-type'), 'text/plain')
            equal(await res.text(), 'missing')

            equal(event.e.code, 404)
            equal(event.e.message, 'missing')

            ok(event.rq instanceof Req)
            ok(event.rs instanceof Res)
        }
        finally {
            await stop(app)
        }
    })

    it('passes request failures to onerror', async () => {
        const app = new Garage
        const root = new Error('boom')
        let seen

        app.use(() => { throw root })
        app.onerror = (e, rq, rs, ctx) => {
            seen = { e, rq, rs, ctx }
            return rs.send(200, 'handled')
        }

        const url = await start(app)
        try {
            const res = await fetch(url + '/boom')

            equal(await res.text(), 'handled')
            equal(seen.e.code, 500)
            equal(seen.e.message, 'boom')
            equal(seen.e.cause, root)
            ok(seen.rq instanceof Req)
            ok(seen.rs instanceof Res)
            equal(seen.ctx, app)
        }
        finally {
            await stop(app)
        }
    })

    it('routes through verb helpers', async () => {
        const app = new Garage
        const seen = []
        const record = (rq, rs) => {
            seen.push([ rq.method, rq.params.id ])
            rs.send(200, rq.params.id)
        }

        app.put('/items/:id', record)
        app.post('/items/:id', record)
        app.patch('/items/:id', record)
        app.del('/items/:id', record)

        const url = await start(app)
        try {
            for (const [ method, id ] of [[ 'PUT', 'a' ], [ 'POST', 'b' ], [ 'PATCH', 'c' ], [ 'DELETE', 'd' ]])
                await (await fetch(url + '/items/' + id, { method })).text()

            deepEqual(seen, [
                [ 'PUT', 'a' ],
                [ 'POST', 'b' ],
                [ 'PATCH', 'c' ],
                [ 'DELETE', 'd' ],
            ])
        }
        finally {
            await stop(app)
        }
    })

    it('parses request urls, query, headers, and json bodies', async () => {
        const app = new Garage
        const body = JSON.stringify({ ok: true })

        app.post('/hello', async (rq, rs) => {
            await rq.reader()
            rs.json(200, {
                body : rq.body,
                path : rq.path,
                query: rq.query,
                size : rq.size,
                type : rq.get('Content-Type'),
                has  : rq.has('Content-Type'),
            })
        })

        const url = await start(app)
        try {
            const res = await fetch(url + '/hello?x=1&y=two', {
                method : 'POST',
                headers: { 'content-type': 'application/json' },
                body,
            })

            deepEqual(await res.json(), {
                body : { ok: true },
                path : '/hello',
                query: { x: '1', y: 'two' },
                size : body.length,
                type : 'application/json',
                has  : true,
            })
        }
        finally {
            await stop(app)
        }
    })

    it('records malformed json as a fail without throwing out of the reader', async () => {
        const app = new Garage

        app.post('/echo', async (rq, rs) => {
            await rq.reader()
            rs.json(200, { errorCode: rq.error?.code, body: rq.body })
        })

        const url = await start(app)
        try {
            const res = await fetch(url + '/echo', {
                method : 'POST',
                headers: { 'content-type': 'application/json' },
                body   : '{',
            })
            const json = await res.json()

            equal(json.errorCode, 400)
            equal(json.body, void 0)
        }
        finally {
            await stop(app)
        }
    })

    it('reads empty json, text, and binary request bodies', async () => {
        const app = new Garage

        app.post('/echo', async (rq, rs) => {
            await rq.reader()
            Buffer.isBuffer(rq.body)
                ? rs.send(200, rq.body)
                : rs.json(200, { body: rq.body })
        })

        const url = await start(app)
        try {
            const json = await fetch(url + '/echo', {
                method : 'POST',
                headers: { 'content-type': 'application/json' },
            })
            equal((await json.json()).body, void 0)

            const text = await fetch(url + '/echo', {
                method : 'POST',
                headers: { 'content-type': 'text/plain; charset=utf-8' },
                body   : 'hello',
            })
            equal((await text.json()).body, 'hello')

            const bin = await fetch(url + '/echo', {
                method : 'POST',
                headers: { 'content-type': 'application/octet-stream' },
                body   : Buffer.from([ 1, 2, 3 ]),
            })
            deepEqual(Buffer.from(await bin.arrayBuffer()), Buffer.from([ 1, 2, 3 ]))
        }
        finally {
            await stop(app)
        }
    })

    it('sends json, text, buffers, empty responses, and files', async () => {
        const app = new Garage
        const dir = await Fs.mkdtemp(Path.join(Os.tmpdir(), 'garage-'))
        const file = Path.join(dir, 'note.txt')

        await Fs.writeFile(file, 'file body')

        app.get('/json', (rq, rs) => rs.json(202, { ok: true }))
        app.get('/text', (rq, rs) => rs.send(203, 'plain'))
        app.get('/buffer', (rq, rs) => rs.send(200, Buffer.from('bytes')))
        app.get('/empty', (rq, rs) => rs.send(204))
        app.get('/file', (rq, rs) => rs.file(file))

        const url = await start(app)
        try {
            const json = await fetch(url + '/json')
            equal(json.status, 202)
            equal(json.headers.get('content-type'), 'application/json')
            equal(json.headers.get('content-length'), '11')
            equal(await json.text(), '{"ok":true}')

            const text = await fetch(url + '/text')
            equal(text.status, 203)
            equal(text.headers.get('content-type'), 'text/plain')
            equal(await text.text(), 'plain')

            const buffer = await fetch(url + '/buffer')
            equal(buffer.headers.get('content-type'), 'application/octet-stream')
            equal(await buffer.text(), 'bytes')

            const empty = await fetch(url + '/empty')
            equal(empty.status, 204)
            equal(await empty.text(), '')

            const filed = await fetch(url + '/file')
            equal(filed.headers.get('content-type'), 'text/plain')
            equal(filed.headers.get('content-length'), '9')
            equal(await filed.text(), 'file body')
        }
        finally {
            await Fs.rm(dir, { force: true, recursive: true })
            await stop(app)
        }
    })

    it('sends plain objects as json and preserves explicit response types', async () => {
        const app = new Garage

        app.get('/object', (rq, rs) => rs.send(200, { ok: true }))
        app.get('/html', (rq, rs) => {
            rs.type = 'html'
            rs.send(200, '<p>hi</p>')
        })

        const url = await start(app)
        try {
            const object = await fetch(url + '/object')
            equal(object.headers.get('content-type'), 'application/json')
            equal(await object.text(), '{"ok":true}')

            const html = await fetch(url + '/html')
            equal(html.headers.get('content-type'), 'text/html')
            equal(await html.text(), '<p>hi</p>')
        }
        finally {
            await stop(app)
        }
    })

    it('sets, appends, and removes response headers', async () => {
        const app = new Garage

        app.get('/headers', (rq, rs) => {
            rs.set('x-one', '1')
            rs.set({ 'x-two': '2' })
            rs.append('x-one', '3')

            const before = { has: rs.has('x-one'), get: rs.get('x-one') }
            rs.rm('x-one')
            const after = { has: rs.has('x-one'), get: rs.get('x-one') }

            rs.json(200, { before, after })
        })

        const url = await start(app)
        try {
            const res  = await fetch(url + '/headers')
            const body = await res.json()

            deepEqual(body.before, { has: true, get: [ '1', '3' ]})
            deepEqual(body.after, { has: false, get: '' })
            equal(res.headers.get('x-one'), null)
            equal(res.headers.get('x-two'), '2')
        }
        finally {
            await stop(app)
        }
    })

    it('turns missing files into 404 responses', async () => {
        const app = new Garage
        const error = console.error
        let captured

        console.error = () => {}

        app.get('/missing-file', async (rq, rs) => {
            await rs.file('/definitely/not/here.txt')
            captured = rs.error
        })

        const url = await start(app)
        try {
            const res = await fetch(url + '/missing-file')

            equal(res.status, 404)
            equal(await res.text(), '')
            equal(captured.code, 404)
        }
        finally {
            console.error = error
            await stop(app)
        }
    })
})

// starts a real garage server on an ephemeral port and returns its base url.
async function start(app) {
    const table = console.table
    console.table = () => {}

    app.listen(0)
    await once(app.server, 'listening')

    console.table = table
    return `http://127.0.0.1:${ app.server.address().port }`
}

// closes the server and drops any idle keep-alive sockets fetch left open.
function stop(app) {
    return new Promise(ok => {
        app.server.close(ok)
        app.server.closeAllConnections()
    })
}
