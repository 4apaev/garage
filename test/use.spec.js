import { describe, it } from 'node:test'
import { deepEqual, equal, throws } from 'node:assert/strict'

import use from '../src/use.js'

describe('use', () => {
    it('matches methods and paths, then decodes params', async () => {
        const rs = {}
        const mw = use('get', '/items/:id', (rq, res) => {
            res.id = rq.params.id
        })

        await mw(request('/items/a%20b'), rs, fail)

        equal(rs.id, 'a b')
    })

    it('passes to next when a method or path validator misses', async () => {
        const calls = []
        const mw = use('POST', '/items/:id', () => {
            calls.push('hit')
        })

        await mw(request('/items/1', 'GET'), {}, () => {
            calls.push('method miss')
        })
        await mw(request('/other', 'POST'), {}, () => {
            calls.push('path miss')
        })

        deepEqual(calls, [ 'method miss', 'path miss' ])
    })

    it('matches any provided method and any provided path', async () => {
        const calls = []
        const mw = use('GET', 'POST', '/a', '/b', rq => {
            calls.push(`${ rq.method } ${ rq.path }`)
        })

        await mw(request('/a'), {}, fail)
        await mw(request('/b', 'POST'), {}, fail)

        deepEqual(calls, [ 'GET /a', 'POST /b' ])
    })

    it('composes multiple handlers for a route', async () => {
        const calls = []
        const mw = use('/x',
            async (rq, rs, next) => {
                calls.push('a in')
                await next()
                calls.push('a out')
            },
            (rq, rs) => {
                calls.push('b')
                rs.done = true
            },
        )
        const rs = {}

        await mw(request('/x'), rs, fail)

        deepEqual(calls, [ 'a in', 'b', 'a out' ])
        equal(rs.done, true)
    })

    it('rejects invalid middleware definitions', () => {
        throws(() => use('/x'), /missing handler/)
        throws(() => use('/x', 1, () => {}), /invalid argument type/)
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

function fail() {
    throw new Error('next should not be called')
}
