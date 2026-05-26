import { describe, it } from 'node:test'
import * as assrt       from 'node:assert/strict'

import STATUS_CODES from '../src/errors.js'
import {
    A,
    Is,
    O,
    Fail,
    concat,
    echo,
    each,
    random,
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
            const any = Symbol.for('any')
            const rows = [
                { kind: 'fruit', color: 'red' },
                { kind: 'fruit', color: 'yellow' },
                { kind: 'leaf', color: 'green' },
            ]
            const nums = A.of(1, 2, 3, 4)

            assrt.deepEqual(A.uniq([ 1, 1, 2 ]), [ 1, 2 ])
            assrt.deepEqual(A.fill(3, i => i + 1), [ 1, 2, 3 ])
            assrt.equal(A.prop('id')({ id: 7 }), 7)

            assrt.deepEqual(A.where([ 1, 2, 1 ], 1), [ 1, 1 ])
            assrt.deepEqual(A.where([ 1, 2, 3 ], new Set([ 2, 3 ])), [ 2, 3 ])
            assrt.deepEqual(A.where([ 'a', 'b', 'c' ], 'cab'), [ 'a', 'b', 'c' ])
            assrt.deepEqual(A.where([ 'ant', 'bat', 'eel' ], /a/), [ 'ant', 'bat' ])
            assrt.deepEqual(A.where(rows, { kind: 'fruit' }), rows.slice(0, 2))
            assrt.deepEqual(A.where(any, rows, { kind: 'fruit', color: 'green' }), rows)

            assrt.deepEqual(nums.rm(x => x % 2 === 0), [ 2, 4 ])
            assrt.deepEqual(Array.from(nums), [ 1, 3 ])
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
        it('should save current error on the Fail constructor', async () => {
            const e  = new Fail
            assrt.equal(Fail.error, e)
        })

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

        it('creates by static getters', async () => {

            each(STATUS_CODES, (c, m) => {
                const e = Fail[ c ]
                assrt.ok(e instanceof Fail)
                assrt.equal(e.name   , 'Fail')
                assrt.equal(e.code   ,  c)
                assrt.equal(e.message,  m.toLowerCase())
            })
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
    })

})
