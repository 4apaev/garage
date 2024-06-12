import Fail from './fail.js'

const {
    iterator: ITR,
    asyncIterator: ITA,
    hasInstance: HAS,
} = Symbol

export { Fail }

export default function Is() {
    return Is[ 'UUFI'[ arguments.length ] ?? 'I' ].apply(Is, arguments)
}

Is.U = x => x != null
Is.u = x => x == null
Is.i = x => ITR in Object(x)

Is.I = (a, b) => a[ HAS ](b)
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
Is.B = Buffer.isBuffer               // ArrayBuffer[ HAS ](x?.buffer)
Is.own = Object.hasOwn

Is.cmplx = x => Object(x) === x
Is.prmtv = x => Object(x) !== x

Is.f.gen   = x =>          /GeneratorFunction$/.test(T(x))
Is.f.async = x => /^Async(Generator)?Function$/.test(T(x))
Is.i.async = x => ITA in Object(x)

Is.any = (x, ...types) => {
    let Sx = Is.T(x)
    let Fx = x?.constructor
    return types.some(t => typeof t == 'string'
        ? t.match(/\w+/g)?.some?.(s => Sx == s)
        : Fx === t)
}

Is.empty = x => { // eslint-disable-next-line no-unreachable-loop
    for (let _ in x)
        return false
    return !x || typeof x == 'object'
}

export function equal(a, b) {
    let t = Is.T(a)

    if (a === b)
        return true

    if (t != Is.T(b))
        return false

    if (/Function|Date|RegExp|URL/.test(t))
        return String(a) === String(b)

    if (t == 'Object')
        t = 'Array', a = Object.entries(a), b = Object.entries(b)

    else if (/Set|Map|Headers/.test(t))
        t = 'Array', a = Array.from(a), b = Array.from(b)

    return t == 'Array'
        ? a.length === b.length && a.every((x, i) => equal(x, b[ i ]))
        : false
}

export function T(x) {
    return toString.call(x).slice(8, -1)
}

export function use(label, fx) {

    let [ m ] = label.match(/(?<name>\w+) +(\[(?<mok>.+?)\]) +(\[(?<mnot>.+?)\])/)
}

Is.eq = Is.eql = equal

Is.t     = Is.T        =
Is.type  = Is.Type     =
Is.tos   = Is.toString = T
