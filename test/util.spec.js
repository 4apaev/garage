import { describe, it } from 'node:test'
import * as assrt       from 'node:assert/strict'

import {
    STATUS,
    STATUS_ERR,
} from '../src/constants.js'
import {
    A,
    BRK,
    Is,
    O,
    Fail,
    alias,
    concat,
    copy,
    dig,
    each,
    eachExit,
    echo,
    nil,
    omit,
    pick,
    random,
    reduce,
    use,
    ƒ,
} from '../src/util.js'

describe('util', () => {

    describe('echo', () => {
        it('returns inputs and exposes tiny constant helpers', () => {
            const x = { ok: true }

            assrt.equal(echo(x), x)
            assrt.equal(echo.nil(), undefined)
            assrt.equal(echo.ok(), true)
            assrt.equal(echo.no(), false)
        })
    })

    describe('concat', () => {
        it('flattens one array level like Array#concat', () => {
            assrt.deepEqual(concat(1, [ 2, 3 ], [[ 4 ]]), [ 1, 2, 3, [ 4 ]])
        })
    })

    describe('each', () => {
        it('each: iterates objects and maps with context and indexes', () => {
            const ctx = { rows: []}
            function push(k, v, i) {
                this.rows.push([ k, v, i ])
            }
            assrt.equal(each({ a: 1, b: 2 }, push, ctx), ctx)
            assrt.equal(each(new Map([[ 'c', 3 ]]), push, ctx), ctx)
            assrt.equal(each(new URLSearchParams(`e=2.71&p=3.14`), push, ctx), ctx)
            assrt.deepEqual(ctx.rows, [
                [ 'a', 1, 0 ],
                [ 'b', 2, 1 ],
                [ 'c', 3, 0 ],
                [ 'e', '2.71', 0 ],
                [ 'p', '3.14', 1 ]])
        })

        it('returns the source itself when no context is given', () => {
            const obj = { a: 1 }
            assrt.equal(each(obj, () => {}), obj)
        })

        it('eachExit stops early on BRK, reduce folds to one value', () => {
            const seen = []
            eachExit({ a: 1, b: 2, c: 3 }, (k, v, i, brk) => {
                seen.push(k)
                return k === 'b' ? brk : undefined
            })
            assrt.deepEqual(seen, [ 'a', 'b' ])

            assrt.equal(reduce({ a: 1, b: 2, c: 3 }, (acc, k, v) => acc + v, 0), 6)
            assrt.equal(each.brk, BRK)
            assrt.equal(each.exit, eachExit)
            assrt.equal(each.reduce, reduce)
        })
    })

    describe('dig', () => {
        it('reads a dot path, or returns the fallback', () => {
            const ctx = { a: { b: { c: 1 }}}

            assrt.equal(dig(ctx, 'a.b.c'), 1)
            assrt.equal(dig(ctx, 'a.b.x'), undefined)
            assrt.equal(dig(ctx, 'a.b.x', 'none'), 'none')
            assrt.equal(dig(ctx, 'a.z.c', 'none'), 'none')
        })

        it('stops at a null or undefined link without a throw', () => {
            const ctx = { a: null, b: { c: undefined }}

            assrt.equal(dig(ctx, 'a', 'none'), 'none')
            assrt.equal(dig(ctx, 'a.b', 'none'), 'none')
            assrt.equal(dig(ctx, 'b.c', 'none'), 'none')
            assrt.equal(dig(ctx, 'b.c.d', 'none'), 'none')
        })

        it('returns the fallback for a null or undefined root', () => {
            assrt.equal(dig(null, 'a', 'none'), 'none')
            assrt.equal(dig(undefined, 'a.b', 'none'), 'none')
            assrt.equal(dig(null, 'a'), undefined)
        })

        it('keeps falsy values that are not null', () => {
            const ctx = { n: 0, s: '', b: false, x: NaN }

            assrt.equal(dig(ctx, 'n', 'none'), 0)
            assrt.equal(dig(ctx, 's', 'none'), '')
            assrt.equal(dig(ctx, 'b', 'none'), false)
            assrt.equal(dig(ctx, 'x', 'none'), NaN)
        })

        it('reads array indexes, primitive props, and getters', () => {
            const ctx = { name: 'garage', rows: A.of({ id: 1 }, { id: 2 }) }

            assrt.equal(dig(ctx, 'rows.0.id'), 1)
            assrt.equal(dig(ctx, 'rows.2.id', 'none'), 'none')
            assrt.equal(dig(ctx, 'rows.tail.id'), 2)
            assrt.equal(dig(ctx, 'name.length'), 6)
        })
    })

    describe('A', () => {
        it('adds head, tail, size, has, and each helpers', () => {
            const a = A.of('x', 'y', 'z')
            const ctx = { rows: []}

            assrt.ok(a instanceof A)
            assrt.equal(a.head, 'x')
            assrt.equal(a.tail, 'z')
            assrt.equal(a.size, 3)
            assrt.equal(a.has('y'), true)

            a.head = 'a'
            a.tail = 'c'
            a.size = 2
            a.tail = 'b'

            assrt.deepEqual(Array.from(a), [ 'a', 'b' ])
            assrt.equal(a.each(() => {}), a)
            assrt.equal(a.each(function (v, i) {
                this.rows.push([ v, i ])
            }, ctx), ctx)
            assrt.deepEqual(ctx.rows, [[ 'a', 0 ], [ 'b', 1 ]])
        })

        it('filters and removes by predicates, collections, regexps, and objects', () => {
            const rows = A.of(
                { kind: 'fruit', color: 'red' },
                { kind: 'fruit', color: 'yellow' },
                { kind: 'leaf', color: 'green' },
            )
            const nums = A.of(1, 2, 3, 4)

            assrt.deepEqual(A.uniq([ 1, 1, 2 ]), A.from([ 1, 2 ]))
            assrt.deepEqual(A.fill(3, i => i + 1), A.from([ 1, 2, 3 ]))
            assrt.equal(A.prop('id')({ id: 7 }), 7)

            assrt.deepEqual(A.where([ 1, 2, 1 ], 1), A.from([ 1, 1 ]))
            assrt.deepEqual(A.where([ 1, 2, 3 ], new Set([ 2, 3 ])), A.from([ 2, 3 ]))
            assrt.deepEqual(A.where([ 'a', 'b', 'c' ], 'cab'), A.from([ 'a', 'b', 'c' ]))
            assrt.deepEqual(A.where([ 'ant', 'bat', 'eel' ], /a/), A.from([ 'ant', 'bat' ]))
            assrt.deepEqual(A.where(rows, { kind: 'fruit' }), rows.slice(0, 2))

            assrt.deepEqual(nums.rm(x => x % 2 === 0), A.of(2, 4))
            assrt.deepEqual(Array.from(nums), [ 1, 3 ])
        })

        it('gets the first matching element, or undefined', () => {
            const rows = A.of(
                { kind: 'fruit', color: 'red' },
                { kind: 'leaf', color: 'green' },
            )

            assrt.equal(rows.get({ kind: 'leaf' }), rows[ 1 ])
            assrt.equal(rows.get({ kind: 'mineral' }), undefined)
            assrt.equal(A.get([ 1, 2, 3 ], x => x > 1), 2)
        })
    })

    describe('random', () => {
        it('uses Math.random through valueOf for floats and integer ranges', t => {
            // TODO use t.mock
            const valueOf = random.valueOf

            random.valueOf = () => 0.5
            try {
                assrt.equal(random(), 0.5)
                assrt.equal(random(10), 5)
                assrt.equal(random(10, 20), 15)
            }
            finally {
                random.valueOf = valueOf
            }
        })
    })

    describe('Is', () => {
        it('checks common predicates and their negation', () => {
            assrt.ok(Is(0))
            assrt.ok(Is(Array, []))
            assrt.ok(Is.a([]))
            assrt.ok(Is([], Array, Object))

            assrt.ok(Is.p(Promise.resolve()))
            assrt.ok(Is.p({ then() {} }))

            assrt.ok(Is.i(new Set))
            assrt.ok(Is.not.i(42))
            assrt.ok(Is.not.s(1))

            assrt.equal(Is(), false)
            assrt.equal(Is.not(), true)
        })

        it('checks the full predicate table directly', () => {
            assrt.equal(Is.t([]), 'Array')

            assrt.equal(Is.n(1.5), true)
            assrt.equal(Is.n(Infinity), false)

            assrt.equal(Is.N(1), true)
            assrt.equal(Is.N(1.5), false)

            assrt.equal(Is.a([]), true)
            assrt.equal(Is.I(Array, []), true)

            assrt.equal(Is.B(Buffer.from('x')), true)
            assrt.equal(Is.b(false), true)

            assrt.equal(Is.u(0), true)
            assrt.equal(Is.u(null), false)

            assrt.equal(Is.x({}), true)
            assrt.equal(Is.x(null), false)

            assrt.equal(Is.S(Symbol('x')), true)
            assrt.equal(Is.s(''), true)

            assrt.equal(Is.f(_ => {}), true)
            assrt.equal(Is.F(Date, new Date), true)

            assrt.equal(Is.o({}), true)
            assrt.equal(Is.o(null), false)

            assrt.equal(Is.O({}), true)
            assrt.equal(Is.O(new Date), false)
            assrt.equal(Is.O([]), false)

            assrt.equal(Is.T('Date', new Date), true)
            assrt.equal(Is.any(new Date, Date, Array), true)
            assrt.equal(Is.not.n(Number.NaN), true)
            assrt.equal(Is.not.a({}), true)
        })

        it('checks if instance is exact or inherited', () => {
            class D extends Date     {}
            class A extends Array    {}
            class F extends Function {}

            assrt.equal(1, +Is.I(Array, new A))
            assrt.equal(0, +Is.F(Array, new A))

            assrt.equal(1, +Is.I(Function, new F))
            assrt.equal(0, +Is.F(Function, new F))

            assrt.equal(1, +Is.I(Date, new D))
            assrt.equal(0, +Is.F(Date, new D))

            assrt.equal(0, +Is.not.I(Array, new A))
            assrt.equal(1, +Is.not.F(Array, new A))

            assrt.equal(0, +Is.not.I(Function, new F))
            assrt.equal(1, +Is.not.F(Function, new F))

            assrt.equal(0, +Is.not.I(Date, new D))
            assrt.equal(1, +Is.not.F(Date, new D))
        })
    })

    describe('Fail', () => {
        it('creates and raises coded failures', async () => {
            const cause = new Error('root')
            const e  = Fail.of(418, 'teapot', cause)

            assrt.equal(e.name, 'Fail')
            assrt.equal(e.code, 418)
            assrt.equal(e.message, 'teapot')
            assrt.equal(e.cause, cause)

            assrt.equal(1, +Fail.ok(1))
            assrt.equal(0, +Fail.no(0))

            assrt.throws(() => Fail.raise(400), { code: 400 })
            assrt.throws(() => Fail.ok(0, 401), { code: 401 })
            assrt.throws(() => Fail.no(1, 409), { code: 409 })
            await assrt.rejects(Fail.deny(500), { code: 500 })
        })

        it('maybe wraps a function so it never throws', async () => {
            const risky = Fail.maybe(async x => {
                if (x < 0) throw new Error('negative')
                return x * 2
            })

            assrt.equal(await risky(3), 1)
            assrt.equal(risky.result, 6)
            assrt.equal(risky.error, undefined)

            assrt.equal(await risky(-1), 0)
            assrt.equal(risky.result, undefined)
            assrt.ok(risky.error instanceof Fail)
            assrt.equal(risky.error.message, '[maybe] negative')
        })
    })

    describe('O', () => {
        it('creates null-prototype objects and copies descriptors', () => {
            const src = {}
            const trg = {}

            O.define(src, 'hidden', { value: 1 })

            const made = O.ƒ(src)
            const params = O.of(new URLSearchParams('a=1&b=2'))

            assrt.equal(Object.getPrototypeOf(O.o), null)
            assrt.equal(Object.getPrototypeOf(made), null)
            assrt.deepEqual(O.descriptor(made, 'hidden'), {
                configurable: false,
                enumerable  : false,
                value       : 1,
                writable    : false,
            })
            assrt.deepEqual(params, { a: '1', b: '2', __proto__: null })

            assrt.equal(O.use(trg, 1, 1, 1, src), trg)
            assrt.deepEqual(O.descriptor(trg, 'hidden'), {
                configurable: true,
                enumerable  : true,
                value       : 1,
                writable    : true,
            })
        })

        it('aliases descriptors onto sources or targets', () => {
            const src = { value: 7 }
            const trg = {}

            assrt.equal(O.alias(src, 'value alias'), src)
            assrt.equal(src.alias, 7)

            assrt.equal(O.alias(src, 'value copy', trg), trg)
            assrt.equal(trg.copy, 7)

            assrt.throws(() => O.alias(src, 'missing nope'), { code: 500 })
        })

        it('reads and copies descriptors, keeping the prototype', () => {
            const src = { a: 1 }
            O.define(src, 'hidden', { value: 2 })

            assrt.deepEqual(O.get(src, 'a'), {
                configurable: true,
                enumerable  : true,
                value       : 1,
                writable    : true,
            })
            assrt.equal(O.get(src).hidden.value, 2)

            const proto = { greet() { return 'hi' } }
            const clone = O.copy(O.set(O.create(proto), src))

            assrt.equal(O.pro(clone), proto)
            assrt.equal(clone.a, 1)
            assrt.equal(clone.greet(), 'hi')

            assrt.deepEqual(O.props({ a: 1, [ Symbol.for('s') ]: 2 }), [ 'a', Symbol.for('s') ])
        })

        it('picks, omits, and null-protos an object tree', () => {
            const src = { a: 1, b: 2, c: 3 }

            assrt.deepEqual(O.pick(src, 'a', [ 'b' ]), { a: 1, b: 2, __proto__: null })
            assrt.deepEqual(O.omit(src, 'a', [ 'b' ]), { c: 3, __proto__: null })

            const tree = { a: { b: { c: 1 }}}
            const seen = []
            O.nil(tree, o => seen.push(o))

            assrt.equal(Object.getPrototypeOf(tree), null)
            assrt.equal(Object.getPrototypeOf(tree.a), null)
            assrt.equal(Object.getPrototypeOf(tree.a.b), null)
            assrt.equal(seen.length, 3)
        })

        it('re-exports its helpers as bare functions', () => {
            assrt.equal(ƒ, O.ƒ)
            assrt.equal(nil, O.nil)
            assrt.equal(use, O.use)
            assrt.equal(alias, O.alias)
            assrt.equal(copy, O.copy)
            assrt.equal(pick, O.pick)
            assrt.equal(omit, O.omit)
        })
    })

})
