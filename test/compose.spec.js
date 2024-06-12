import { test } from 'node:test'

import {
    strictEqual as eq,
    deepStrictEqual as equal,
} from 'assert'

// abcdefghijklmnopqrstuvwxyz

import rand from '../src/util/rand.js'
import compose from '../src/core/compose.js'

function sleep(ms, x) {
    return new Promise(ok => setTimeout(ok, ms, x))
}

function sleeps(x, ms = rand(10)) {
    return async (ctx, next) => {
        await sleep(ms)
        ctx.push(x)
        await next()
    }
}

test('Compose', async t => {

    await t.test('single', (t, done) => {
        const abc = compose([
            sleeps('a'),
            sleeps('b'),
            sleeps('c'),
        ])

        const ctx = []
        abc(ctx, x => {
            eq(x, ctx)
            equal(x, [ 'a', 'b', 'c' ])
            done()
        })
    })

    await t.test('multiple', (t, done) => {
        const ctx = []
        const abcdef = compose(
            compose(
                sleeps('a', rand(25, 50)),
                sleeps('b', rand(25, 50)),
                sleeps('c', rand(25, 50)),
            ),
            compose(
                sleeps('d', rand(75, 100)),
                sleeps('e', rand(75, 100)),
                sleeps('f', rand(75, 100)),
            ),
        )

        abcdef(ctx, x => {
            eq(x, ctx)
            equal(x, [ 'a', 'b', 'c', 'd', 'e', 'f' ])
            done()
        })
    })

    await t.test('single with stop', {  skip: true }, (t, done) => {
        const abcd = compose(
            sleeps('a'),
            sleeps('b'),
            ctx => {
                ctx.push('c')
                console.log('>', 'c')
            },
            sleeps('d'),
        )

        const ctx = []
        abcd(ctx, x => {
            eq(x, ctx)
            equal(x, [ 'a', 'b', 'c' ])
            done()
        })
    })
})
