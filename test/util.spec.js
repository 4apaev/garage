import { describe, it } from 'node:test'
import {
    deepEqual,
    equal,
    ok,
    rejects,
    throws,
} from 'node:assert/strict'

import {
    Fail,
    Is,
    each,
} from '../src/util.js'

describe('util', () => {
    it('iterates objects and maps with context and indexes', () => {
        const ctx = { rows: []}

        equal(each({ a: 1, b: 2 }, collect, ctx), ctx)
        equal(each(new Map([[ 'c', 3 ]]), collect, ctx), ctx)

        deepEqual(ctx.rows, [
            [ 'a', 1, 0 ],
            [ 'b', 2, 1 ],
            [ 'c', 3, 0 ],
        ])
    })

    it('checks common predicates and their negation', () => {
        ok(Is('x'))
        ok(Is(Array, []))
        ok(Is([], Array, Object))
        ok(Is.p(Promise.resolve()))
        ok(Is.i(new Set))
        ok(Is.not.s(1))
        equal(Is(), false)
        equal(Is.not(), true)
    })

    it('creates and raises coded failures', async () => {
        const cause = new Error('root')
        const fail  = Fail.of(418, 'teapot', cause)

        equal(fail.name, 'Fail')
        equal(fail.code, 418)
        equal(fail.message, 'teapot')
        equal(fail.cause, cause)
        equal(Fail.ok(true), true)
        equal(Fail.no(false), false)

        throws(() => Fail.raise(400, 'bad'), { code: 400 })
        throws(() => Fail.ok(false, 401, 'no'), { code: 401 })
        throws(() => Fail.no(true, 409, 'conflict'), { code: 409 })
        await rejects(Fail.deny(500, 'denied'), { code: 500 })
    })
})

function collect(k, v, i) {
    this.rows.push([ k, v, i ])
}
