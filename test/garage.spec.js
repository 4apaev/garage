import Fs   from 'node:fs/promises'
import Http from 'node:http'
import Os   from 'node:os'
import Path from 'node:path'

import { once } from 'node:events'
import { PassThrough, Writable } from 'node:stream'

import { describe, it } from 'node:test'
import { deepEqual, equal, ok } from 'node:assert/strict'

import {
    Req,
    Res,
    Router,
    create,
} from '../src/index.js'

describe('garage', () => {
    it('creates a node http server with garage request and response classes', () => {
        const server = create(() => {})

        ok(server instanceof Http.Server)
        equal(server[ Symbol.asyncDispose ] instanceof Function, true)
        server.close()
    })

    it('extends node request and response classes', () => {
        ok(Req.prototype instanceof Http.IncomingMessage)
        ok(Res.prototype instanceof Http.ServerResponse)
        equal(typeof Res.prototype.json, 'function')
    })

    it('constructs routers with options and helper factories', () => {
        const app = Router.of({ name: 'shop', port: 0 })

        ok(app instanceof Router)
        equal(app.options.name, 'shop')
        equal(app.options.port, 0)

        const server = app.init()

        ok(server instanceof Http.Server)
        equal(app.server, server)
        server.close()
    })

    it('listens on the configured port and reports options', () => {
        const app = new Router({ name: 'shop', port: 1234 })
        const table = console.table
        let port, reported

        app.server = {
            listen(p, ready) {
                port = p
                ready()
            },
        }
        console.table = x => {
            reported = x
        }

        try {
            app.listen()
        }
        finally {
            console.table = table
        }

        equal(port, 1234)
        equal(reported, app.options)
    })

    it('routes by method and url pattern', async () => {
        const app = new Router
        const rs = response()
        const rq = {
            method: 'GET',
            params: Object.create(null),
            path  : '/items/a%20b',
            url   : '/items/a%20b',
        }

        app.get('/items/:id', (req, res) => res.json(200, { id: req.params.id }))

        await app.handle(rq, rs)

        equal(rs.status, 200)
        deepEqual(JSON.parse(rs.text()), { id: 'a b' })
    })

    it('recomposes router middleware when routes are added', async () => {
        const app = new Router
        const rs = response()

        app.get('/first', (req, res, next) => next())
        await app.handle(request('/first'), rs)

        app.get('/second', (req, res) => res.send(201, 'second'))
        await app.handle(request('/second'), rs)

        equal(rs.status, 201)
        equal(rs.body, 'second')
    })

    it('routes through verb helpers', async () => {
        const app = new Router
        const seen = []

        app.put('/items/:id', rq => seen.push([ rq.method, rq.params.id ]))
        app.post('/items/:id', rq => seen.push([ rq.method, rq.params.id ]))
        app.patch('/items/:id', rq => seen.push([ rq.method, rq.params.id ]))
        app.del('/items/:id', rq => seen.push([ rq.method, rq.params.id ]))

        await app.handle(request('/items/a', 'PUT'), response())
        await app.handle(request('/items/b', 'POST'), response())
        await app.handle(request('/items/c', 'PATCH'), response())
        await app.handle(request('/items/d', 'DELETE'), response())

        deepEqual(seen, [
            [ 'PUT', 'a' ],
            [ 'POST', 'b' ],
            [ 'PATCH', 'c' ],
            [ 'DELETE', 'd' ],
        ])
    })

    it('parses request urls, query, headers, and json bodies', async () => {
        const body = JSON.stringify({ ok: true })
        const rq = readableRequest({
            body,
            headers: {
                'content-length': String(body.length),
                'content-type'  : 'application/json',
            },
            method: 'POST',
            url   : '/hello?x=1&y=two',
        })

        ok(rq instanceof Req)
        await rq.reader()

        deepEqual({
            body : rq.body,
            has  : rq.has('Content-Type'),
            path : rq.path,
            query: rq.query,
            size : rq.size,
            type : rq.get('Content-Type'),
        }, {
            body : { ok: true },
            has  : true,
            path : '/hello',
            query: { x: '1', y: 'two' },
            size : body.length,
            type : 'application/json',
        })
    })

    it('records malformed json as a fail without throwing out of the reader', async () => {
        const rq = readableRequest({
            body   : '{',
            headers: { 'content-type': 'application/json' },
        })

        await rq.reader()

        equal(rq.error.code, 400)
        equal(rq.body, undefined)
    })

    it('reads empty json, text, and binary request bodies', async () => {
        const json = readableRequest({
            headers: { 'content-type': 'application/json' },
        })
        const text = readableRequest({
            body   : 'hello',
            headers: { 'content-type': 'text/plain; charset=utf-8' },
        })
        const bin = readableRequest({
            body   : Buffer.from([ 1, 2, 3 ]),
            headers: { 'content-type': 'application/octet-stream' },
        })

        await json.reader()
        await text.reader()
        await bin.reader()

        equal(json.body, void 0)
        equal(text.body, 'hello')
        deepEqual(bin.body, Buffer.from([ 1, 2, 3 ]))
    })

    it('sends json, text, buffers, empty responses, and files', async () => {
        const dir = await Fs.mkdtemp(Path.join(Os.tmpdir(), 'garage-'))
        const file = Path.join(dir, 'note.txt')

        await Fs.writeFile(file, 'file body')

        try {
            const json = response()
            json.json(202, { ok: true })
            equal(json.status, 202)
            equal(json.get('content-type'), 'application/json')
            equal(json.get('content-length'), 11)
            equal(json.text(), '{"ok":true}')

            const text = response()
            text.send(203, 'plain')
            equal(text.status, 203)
            equal(text.get('content-type'), 'text/plain')
            equal(text.text(), 'plain')

            const buffer = response()
            buffer.send(200, Buffer.from('bytes'))
            await once(buffer, 'finish')
            equal(buffer.get('content-type'), 'application/octet-stream')
            equal(buffer.text(), 'bytes')

            const empty = response()
            empty.send(204)
            equal(empty.status, 204)
            equal(empty.get('content-length'), 0)
            equal(empty.text(), '')

            const filed = response()
            await filed.file(file)
            equal(filed.get('content-type'), 'text/plain')
            equal(filed.get('content-length'), 9)
            equal(filed.text(), 'file body')
        }
        finally {
            await Fs.rm(dir, { force: true, recursive: true })
        }
    })

    it('sends plain objects as json and preserves explicit response types', () => {
        const object = response()
        object.send(200, { ok: true })
        equal(object.get('content-type'), 'application/json')
        equal(object.text(), '{"ok":true}')

        const html = response()
        html.type = 'html'
        html.send(200, '<p>hi</p>')
        equal(html.get('content-type'), 'text/html')
        equal(html.text(), '<p>hi</p>')
    })

    it('sets, appends, and removes response headers', () => {
        const rs = response()

        equal(rs.set('x-one', '1'), rs)
        equal(rs.set({ 'x-two': '2' }), rs)
        equal(rs.append('x-one', '3'), rs)
        equal(rs.has('x-one'), true)
        deepEqual(rs.get('x-one'), [ '1', '3' ])
        equal(rs.get('x-two'), '2')

        rs.rm('x-one')
        equal(rs.has('x-one'), false)
        equal(rs.get('x-one'), '')
    })

    it('turns missing files into 404 responses', async () => {
        const rs = response()
        const error = console.error

        console.error = () => {}
        try {
            equal(await rs.file('/definitely/not/here.txt'), rs)
        }
        finally {
            console.error = error
        }

        equal(rs.status, 404)
        equal(rs.error.code, 404)
        equal(rs.text(), '')
    })
})

function request(path, method = 'GET') {
    return {
        method,
        params: Object.create(null),
        path,
        url   : path,
    }
}

function readableRequest(opt) {
    const rq = new Req(new PassThrough)

    rq.headers = opt.headers ?? {}
    rq.method  = opt.method ?? 'GET'
    rq.url     = opt.url ?? '/'
    rq.push(opt.body ?? '')
    rq.push(null)

    return rq
}

function response() {
    return new MockRes
}

class MockRes extends Writable {
    chunks = []
    headers = Object.create(null)
    statusCode = 200

    _write(chunk, enc, next) {
        this.chunks.push(Buffer.from(chunk))
        next()
    }

    setHeader(k, v) {
        this.headers[ k.toLowerCase() ] = v
        return this
    }

    appendHeader(k, v) {
        const key = k.toLowerCase()
        const old = this.headers[ key ]

        this.headers[ key ] = old == null
            ? v
            : [ old, v ].flat()

        return this
    }

    getHeader(k) {
        return this.headers[ k.toLowerCase() ]
    }

    hasHeader(k) {
        return k.toLowerCase() in this.headers
    }

    removeHeader(k) {
        delete this.headers[ k.toLowerCase() ]
    }

    text() {
        return Buffer.concat(this.chunks).toString('utf8')
    }
}

Object.defineProperties(MockRes.prototype, Object.getOwnPropertyDescriptors(Res.prototype))
