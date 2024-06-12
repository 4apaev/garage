/* eslint-disable max-lines-per-function */

import { it, describe } from 'node:test'
import { strictEqual as equal } from 'assert'
import Is                       from '../src/util/is.aint.js'

describe('Is', () => {
    describe('Is.function', () => {
        function  Fx() {}
        async function aFx() {}

        function*  FxGen() {}
        async function* aFxGen() {}

        it('ok: Is async Function', () => equal(true, Is.f.async(aFx)))
        it('ok: Is async Generator Function', () => equal(true, Is.f.async(aFxGen)))

        it('nope: Is async Function', () => equal(false, Is.f.async(Fx)))
        it('nope: Is async Generator Function', () => equal(false, Is.f.async(FxGen)))

        it('ok: Is Generator Function  FxGen', () => equal(true, Is.f.gen(FxGen)))
        it('ok: Is Generator Function aFxGen', () => equal(true, Is.f.gen(aFxGen)))

        it('nope: Is Generator Function aFx', () => equal(false, Is.f.gen(aFx)))
        it('nope: Is Generator Function Fx', () => equal(false, Is.f.gen(Fx)))
    })

    describe('Is.equal', () => {
        describe('primitives', () => {
            it('        1 === 1         ', () => equal(true, Is.equal(1, 1)))
            it('      NaN !== NaN       ', () => equal(false, Is.equal(NaN, NaN)))
            it('     null === null      ', () => equal(true, Is.equal(null, null)))
            it('     true === true      ', () => equal(true, Is.equal(true, true)))
            it('    false === false     ', () => equal(true, Is.equal(false, false)))
            it(' "string" === "string"  ', () => equal(true, Is.equal('string', 'string')))
            it('undefined === undefined ', () => equal(true, Is.equal(undefined, undefined)))

            it('        1 !== "1"       ', () => equal(false, Is.equal(1, '1')))
            it('      NaN !== 3         ', () => equal(false, Is.equal(NaN, 3)))
            it('     null !== undefined ', () => equal(false, Is.equal(null, undefined)))
            it('     true !== false     ', () => equal(false, Is.equal(true, false)))
            it('    false !== true      ', () => equal(false, Is.equal(false, true)))
            it(' "string" !== 1         ', () => equal(false, Is.equal('string', 1)))
            it('undefined !== null      ', () => equal(false, Is.equal(undefined, null)))
        })
        describe('complexes', () => {
            let arr = [ 1 ]
            let rx = /^.*/gm
            let d = new Date(2010, 9, 8, 7, 6)

            it('[...] === [...]', () => equal(true, Is.equal(arr, [ 1 ])))
            it('regex === regex', () => equal(true, Is.equal(rx, /^.*/gm)))
            it(' date === date ', () => equal(true, Is.equal(d, new Date(+d))))
            it('{...} === {...}', () => equal(true, Is.equal(
                create(d, Is, rx, arr, { id: 'xxx' }, { id: 'yyy' }),
                create(new Date(+d), Is, /^.*/gm, [ 1 ], { id: 'xxx' }, { id: 'yyy' }),
            )))

            it('[...] !== [...]', () => equal(false, Is.equal(arr, [ 0 ])))
            it('regex !== regex', () => equal(false, Is.equal(rx, /^.*/id)))
            it(' date !== date ', () => equal(false, Is.equal(d, new Date)))
            it('{...} !== {...}', () => equal(false, Is.equal(
                create(new Date, Is, /^.*/gm, d, arr),
                create(new Date, Is, /^.*/id, d, arr),
            )))
        })
    })

    describe('Is.not.equal', () => {
        describe('primitives', () => {
            it('        1 === 1         ', () => equal(false, Is.not.equal(1, 1)))
            it('      NaN !== NaN       ', () => equal(true, Is.not.equal(NaN, NaN)))
            it('     null === null      ', () => equal(false, Is.not.equal(null, null)))
            it('     true === true      ', () => equal(false, Is.not.equal(true, true)))
            it('    false === false     ', () => equal(false, Is.not.equal(false, false)))
            it(' "string" === "string"  ', () => equal(false, Is.not.equal('string', 'string')))
            it('undefined === undefined ', () => equal(false, Is.not.equal(undefined, undefined)))

            it('        1 !== "1"       ', () => equal(true, Is.not.equal(1, '1')))
            it('      NaN !== 3         ', () => equal(true, Is.not.equal(NaN, 3)))
            it('     null !== undefined ', () => equal(true, Is.not.equal(null, undefined)))
            it('     true !== false     ', () => equal(true, Is.not.equal(true, false)))
            it('    false !== true      ', () => equal(true, Is.not.equal(false, true)))
            it(' "string" !== 1         ', () => equal(true, Is.not.equal('string', 1)))
            it('undefined !== null      ', () => equal(true, Is.not.equal(undefined, null)))
        })
        describe('complexes', () => {
            let arr = [ 1 ]
            let rx = /^.*/gm
            let d = new Date(2010, 9, 8, 7, 6)

            it('[...] === [...]', () => equal(false, Is.not.equal(arr, [ 1 ])))
            it('regex === regex', () => equal(false, Is.not.equal(rx, /^.*/gm)))
            it(' date === date ', () => equal(false, Is.not.equal(d, new Date(+d))))
            it('{...} === {...}', () => equal(false, Is.not.equal(
                create(d, Is, rx, arr, { id: 'xxx' }, { id: 'yyy' }),
                create(new Date(+d), Is, /^.*/gm, [ 1 ], { id: 'xxx' }, { id: 'yyy' }),
            )))

            it('[...] !== [...]', () => equal(true, Is.not.equal(arr, [ 0 ])))
            it('regex !== regex', () => equal(true, Is.not.equal(rx, /^.*/id)))
            it(' date !== date ', () => equal(true, Is.not.equal(d, new Date)))
            it('{...} !== {...}', () => equal(true, Is.not.equal(
                create(new Date, Is, /^.*/gm, d, arr),
                create(new Date, Is, /^.*/id, d, arr),
            )))
        })
    })

    describe('Is.any', () => {
        const args = [ 'String', 'Array', 'Number' ]
        const strings = args.join(' ')
        const b = false
        const n = 42
        const s = `${ n }`
        const a =   [ n ]
        const f = x => x
        const o = { b, n, s, a, f }

        describe('single string as arguments', () => {
            it('  ok:  42  === "S A N"', () => equal(true, Is.any(n, strings)))
            it('  ok: [42] === "S A N"', () => equal(true, Is.any(a, strings)))
            it('  ok: "42" === "S A N"', () => equal(true, Is.any(s, strings)))

            it('nope: x => x !== "S A N"', () => equal(false, Is.any(f, strings)))
            it('nope: {}     !== "S A N"', () => equal(false, Is.any(o, strings)))
            it('nope: true   !== "S A N"', () => equal(false, Is.any(b, strings)))
        })

        describe('multiple string as arguments', () => {
            it('  ok:  42  === [ "S", "A", "N" ]', () => equal(true, Is.any(n, ...args)))
            it('  ok: [42] === [ "S", "A", "N" ]', () => equal(true, Is.any(a, ...args)))
            it('  ok: "42" === [ "S", "A", "N" ]', () => equal(true, Is.any(s, ...args)))

            it('nope: x => x !== [ "S", "A", "N" ]', () => equal(false, Is.any(f, ...args)))
            it('nope: {   }  !== [ "S", "A", "N" ]', () => equal(false, Is.any(o, ...args)))
            it('nope: false  !== [ "S", "A", "N" ]', () => equal(false, Is.any(b, ...args)))
        })

        describe('constractors as arguments', () => {
            it('  ok:  42  === [ S, A, N ]', () => equal(true, Is.any(n, String, Array, Number)))
            it('  ok: [42] === [ S, A, N ]', () => equal(true, Is.any(a, String, Array, Number)))
            it('  ok: "42" === [ S, A, N ]', () => equal(true, Is.any(s, String, Array, Number)))

            it('nope: fnx  !== [ S, A, N ]', () => equal(false, Is.any(f, String, Array, Number)))
            it('nope: obj  !== [ S, A, N ]', () => equal(false, Is.any(o, String, Array, Number)))
            it('nope: bool !== [ S, A, N ]', () => equal(false, Is.any(b, String, Array, Number)))
        })

        describe('mixed constractors and strings as arguments', () => {
            it('  ok:  42  ===   S "A,  N" ', () => equal(true, Is.any(n, String, 'Array Number')))
            it('  ok: [42] === [ S, A,  N ]', () => equal(true, Is.any(a, String, Array, Number)))
            it('  ok: "42" ===  "S  A", N  ', () => equal(true, Is.any(s, 'String, Array', Number)))

            it('nope: fnx  !==   S "A,  N" ', () => equal(false, Is.any(f, String, 'Array Number')))
            it('nope: obj  !== [ S, A,  N ]', () => equal(false, Is.any(o, String, Array, Number)))
            it('nope: bool !==  "S  A", N  ', () => equal(false, Is.any(b, 'String, Array', Number)))
        })
    })

    describe('Is.not.any', () => {
        const args = [ 'String', 'Array', 'Number' ], strings = args.join(' ')
        const b = false, n = 42, s = `${ n }`
        const a = [ n ], f = x => x, o = { b, n, s, a, f }

        describe('single string as arguments', () => {
            it('  ok:  42  === "S A N"', () => equal(true, Is.not.any(f, strings)))
            it('  ok: [42] === "S A N"', () => equal(true, Is.not.any(o, strings)))
            it('  ok: "42" === "S A N"', () => equal(true, Is.not.any(b, strings)))

            it('nope: x => x !== "S A N"', () => equal(false, Is.not.any(n, strings)))
            it('nope: {}     !== "S A N"', () => equal(false, Is.not.any(a, strings)))
            it('nope: true   !== "S A N"', () => equal(false, Is.not.any(s, strings)))
        })

        describe('multiple string as arguments', () => {
            it('  ok:  42  === [ "S", "A", "N" ]', () => equal(true, Is.not.any(f, ...args)))
            it('  ok: [42] === [ "S", "A", "N" ]', () => equal(true, Is.not.any(o, ...args)))
            it('  ok: "42" === [ "S", "A", "N" ]', () => equal(true, Is.not.any(b, ...args)))

            it('nope: x => x !== [ "S", "A", "N" ]', () => equal(false, Is.not.any(n, ...args)))
            it('nope: {   }  !== [ "S", "A", "N" ]', () => equal(false, Is.not.any(a, ...args)))
            it('nope: false  !== [ "S", "A", "N" ]', () => equal(false, Is.not.any(s, ...args)))
        })

        describe('constractors as arguments', () => {
            it('  ok:  42  === [ S, A, N ]', () => equal(true, Is.not.any(f, String, Array, Number)))
            it('  ok: [42] === [ S, A, N ]', () => equal(true, Is.not.any(o, String, Array, Number)))
            it('  ok: "42" === [ S, A, N ]', () => equal(true, Is.not.any(b, String, Array, Number)))

            it('nope: fnx  !== [ S, A, N ]', () => equal(false, Is.not.any(n, String, Array, Number)))
            it('nope: obj  !== [ S, A, N ]', () => equal(false, Is.not.any(a, String, Array, Number)))
            it('nope: bool !== [ S, A, N ]', () => equal(false, Is.not.any(s, String, Array, Number)))
        })

        describe('mixed constractors and strings as arguments', () => {
            it('  ok:  42  ===   S "A,  N" ', () => equal(true, Is.not.any(f, String, 'Array Number')))
            it('  ok: [42] === [ S, A,  N ]', () => equal(true, Is.not.any(o, String, Array, Number)))
            it('  ok: "42" ===  "S  A", N  ', () => equal(true, Is.not.any(b, 'String, Array', Number)))

            it('nope: fnx  !==   S "A,  N" ', () => equal(false, Is.not.any(n, String, 'Array Number')))
            it('nope: obj  !== [ S, A,  N ]', () => equal(false, Is.not.any(a, String, Array, Number)))
            it('nope: bool !==  "S  A", N  ', () => equal(false, Is.not.any(s, 'String, Array', Number)))
        })
    })

    function create(d, f, r, ...a) {
        const m = new Map([[ 'y', Math.PI ], [ 'x', Math.E ]])
        return { a: { d, f, b: { r, c: { m, d: { a, s: new Set(a) }}}}}
    }

})
