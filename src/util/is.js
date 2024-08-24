import Fail from './fail.js'

export { Fail }

export default function Is(...a) {
    return Is[ 'UUFI'[ a.length ] ?? 'I' ](...a)
}

Is.T = x => toString.call(x).slice(8, -1)

Is.U = x => x != null
Is.u = x => x == null
Is.i = x => Symbol.iterator in Object(x)

Is.I = (a, b) => a[ Symbol.hasInstance ](b)
Is.F = (a, b) => a === b?.constructor
Is.f = x => typeof x == 'function'
Is.S = x => typeof x == 'symbol'
Is.s = x => typeof x == 'string'
Is.b = x => typeof x == 'boolean'
Is.o = x => typeof x == 'object' && !!x
Is.O = x => Is.T(x) == 'Object'
Is.A = x => Is.T(x) == 'Arguments'
Is.a = Array.isArray
Is.N = Number.isInteger
Is.n = Number.isFinite
Is.B = Buffer.isBuffer
Is.own = Object.hasOwn

Is.x = Is.cmplx = x => Object(x) === x
Is.X = Is.prmtv = x => Object(x) !== x

Is.any = (x, ...types) => {
    let Sx = Is.T(x)
    let Fx = x?.constructor
    return types.some(t => typeof t == 'string'
        ? t.match(/\w+/g)?.some?.(s => Sx == s)
        : Fx === t)
}
