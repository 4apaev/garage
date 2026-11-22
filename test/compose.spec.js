import { describe, it } from 'node:test'
import { deepEqual, equal } from 'node:assert/strict'

import compose from '../src/compose.js'

describe('compose', () => {
    it('runs middleware in onion order with the caller context', async () => {
        const calls = []
        const ctx   = { name: 'ctx' }
        const rq    = {}
        const rs    = {}
        const fn    = compose([
            async function (req, res, next) {
                equal(this, ctx)
                equal(req, rq)
                equal(res, rs)
                calls.push('a in')
                await next()
                calls.push('a out')
            },
            async function (req, res, next) {
                calls.push('b in')
                await next()
                calls.push('b out')
            },
        ])

        await fn.call(ctx, rq, rs, async () => {
            calls.push('next')
        })

        deepEqual(calls, [ 'a in', 'b in', 'next', 'b out', 'a out' ])
    })

    it('takes rest args and arrays, flat', async () => {
        const calls = []
        const a = (rq, rs, next) => (calls.push('a'), next())
        const b = (rq, rs, next) => (calls.push('b'), next())
        const c = (rq, rs, next) => (calls.push('c'), next())

        await compose(a, [ b, c ])({}, {}, async () => calls.push('next'))
        deepEqual(calls, [ 'a', 'b', 'c', 'next' ])
    })

    it('resolves when the chain ends without a final next', async () => {
        const calls = []
        const fn = compose((rq, rs, next) => (calls.push('a'), next()))

        equal(await fn({}, {}), undefined)
        deepEqual(calls, [ 'a' ])
    })

    it('has no guard: a second next() runs downstream again', async () => {
        let n = 0
        const fn = compose(
            async (rq, rs, next) => { await next(); await next() },
            () => n++,
        )

        await fn({}, {})
        equal(n, 2)
    })
})
