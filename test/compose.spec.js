import { describe, it } from 'node:test'
import { deepEqual, equal, rejects } from 'node:assert/strict'

import {
    composeDev,
    composeProd,
} from '../src/compose.js'

describe('compose', () => {
    it('runs dev middleware in onion order with the caller context', async () => {
        const calls = []
        const ctx   = { name: 'ctx' }
        const rq    = {}
        const rs    = {}
        const fn    = composeDev([
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

    it('rejects multiple next calls in dev mode', async () => {
        const fn = composeDev(async (rq, rs, next) => {
            await next()
            await next()
        })

        await rejects(
            () => fn({}, {}, async () => {}),
            /next called multiple times/,
        )
    })

    it('rejects middleware that resolves before downstream in dev mode', async () => {
        const fn = composeDev(
            (rq, rs, next) => {
                next()
            },
            async () => new Promise(ok => setTimeout(ok, 5)),
        )

        await rejects(
            () => fn({}, {}),
            /mware resolved before downstream/,
        )
    })

    it('runs prod middleware and final next without dev guards', async () => {
        const calls = []
        const fn = composeProd([
            async (rq, rs, next) => {
                calls.push('a')
                await next()
            },
            (rq, rs, next) => {
                calls.push('b')
                return next()
            },
        ])

        await fn({}, {}, async () => {
            calls.push('next')
        })

        deepEqual(calls, [ 'a', 'b', 'next' ])
    })
})
