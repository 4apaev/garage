import { describe, it } from 'node:test'
import * as assrt       from 'node:assert/strict'

import Sync from '../src/sync.js'

describe('sync', () => {
    it('builds urls, headers, query params, and request bodies', () => {

        const rq = Sync.get('/items?tag=old', { q: 'tea', tag: [ 'a', 'b' ]})
            .query('page', 2)
            .query(new URLSearchParams('sort=asc'))

        const post = Sync.post('http://example.test/api', { ok: true })

        assrt.equal(rq.method, 'GET')
        assrt.equal(rq.url.href, 'http://localhost/items?tag=old&q=tea&tag=a&tag=b&page=2&sort=asc')
        assrt.deepEqual(rq.params, {
            __proto__: null,
            page     : '2',
            q        : 'tea',
            sort     : 'asc',
            tag      : 'b',
        })

        assrt.equal(post.method, 'POST')
        assrt.equal(post.body, '{"ok":true}')
        assrt.equal(post.type(), 'application/json')
        assrt.equal(post.size(11), post)
        assrt.equal(post.size(), 11)

        post.append('x-many', 'a')
        post.append('x-many', 'b')

        assrt.equal(post.set({ 'x-one': '1' }), post)
        assrt.equal(post.set(new Headers({ 'x-two': '2' })), post)
        assrt.equal(post.has('x-one'), true)
        assrt.equal(post.get('x-one'), '1')
        assrt.equal(post.get('x-two'), '2')
        assrt.equal(post.get('x-many'), 'a, b')
    })

    it('passes fetch options and parses json and text responses', async t => {
        const calls = []
        const responses = [
            new Response(JSON.stringify({ ok: true }), {
                headers: { 'content-type': 'application/json' },
                status : 201,
            }),
            new Response('plain', {
                headers: { 'content-type': 'text/plain' },
                status : 200,
            }),
        ]

        t.mock.method(globalThis, 'fetch', async (url, opt) => {
            calls.push({ opt, url })
            return responses.shift()
        })

        const json = await Sync.post('/items', { ok: true })
            .set('x-one', '1')
            .end()
        const text = await Sync.get('/plain').abort('old signal').end()

        assrt.equal(String(calls[ 0 ].url), 'http://localhost/items')
        assrt.equal(calls[ 0 ].opt.method, 'POST')
        assrt.equal(calls[ 0 ].opt.body, '{"ok":true}')
        assrt.equal(calls[ 0 ].opt.headers.get('x-one'), '1')
        assrt.ok(calls[ 0 ].opt.signal instanceof AbortSignal)

        assrt.equal(calls[ 1 ].opt.signal.aborted, false)
        assrt.equal(json.status, 201)
        assrt.deepEqual(json.body, { ok: true })
        assrt.equal(text.status, 200)
        assrt.equal(text.body, 'plain')
    })

    it('rejects failed and malformed responses as payloads', async () => {
        const nope = new Sync('get', '/nope')
        const bad = new Sync('get', '/bad')

        await assrt.rejects(
            () => nope.parse(new Response('missing', {
                headers: { 'content-type': 'text/plain' },
                status : 404,
            })),
            pay => {
                assrt.equal(pay, nope.payload)
                assrt.equal(pay.status, 404)
                assrt.equal(pay.body, 'missing')
                return true
            },
        )

        await assrt.rejects(
            () => bad.parse(new Response('{', {
                headers: { 'content-type': 'application/json' },
                status : 200,
            })),
            pay => {
                assrt.equal(pay, bad.payload)
                assrt.equal(pay.status, 200)
                assrt.equal(pay.code, 400)
                assrt.equal(pay.error.code, 400)
                return true
            },
        )
    })

    it('covers the remaining request builder branches', () => {
        const µ = void 0

        const empty = new Sync('', µ, µ)
        const head = new Sync('head', '/head', { q: 'x' })
        const put = Sync.put('/body', 'plain')
        const del = Sync.del('/gone')

        assrt.equal(empty.method, 'GET')
        assrt.equal(empty.url.href, 'http://localhost/')
        assrt.equal(empty.send(), empty)
        assrt.equal(empty.query(), empty)
        assrt.equal(empty.type('wat'), empty)
        assrt.equal(empty.type(), 'wat')

        assrt.equal(head.method, 'HEAD')
        assrt.equal(head.url.href, 'http://localhost/head?q=x')
        assrt.equal(head.body, µ)

        assrt.equal(put.method, 'PUT')
        assrt.equal(put.body, 'plain')
        assrt.equal(put.type(), '')

        assrt.equal(del.method, 'DELETE')
        assrt.equal(del.body, µ)
    })

    it('uses callbacks, thenables, and default fetch rejection handling', async t => {
        t.mock.method(console, 'error', () => {})
        t.mock.method(globalThis, 'fetch', async url => {
            if (String(url).endsWith('/fail')) {
                const e = new Error('fail')
                e.code = 503
                throw e
            }
            return new Response('ok', {
                headers: { 'content-type': 'text/plain' },
            })
        })

        const ended = await Sync.get('/ok').end(pay => pay.body.toUpperCase())
        const thened = await Sync.get('/ok').then(pay => pay.status)

        await assrt.rejects(
            () => Sync.get('/fail').end(),
            e => {
                assrt.equal(e.code, 503)
                assrt.equal(e.message, 'fail')
                assrt.equal(console.error.mock.callCount(), 1)
                return true
            },
        )

        assrt.equal(ended, 'OK')
        assrt.equal(thened, 200)
    })
})
