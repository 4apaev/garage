import Is from './is.js'

export default Is

export function Aint() {
    return !Is[ 'UUFI'[ arguments.length ] ?? 'I' ].apply(Is, arguments)
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function nope(fx) { return x => !fx(x) }
nope.duo = fx => (a, b) => !fx(a, b)
nope.mult = fx => (...a) => !fx(...a)

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Is.not = Aint

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Aint.U = Is.u, Aint.cmplx = Is.prmtv
Aint.u = Is.U, Aint.prmtv = Is.cmplx

Aint.empty = nope(Is.empty)
Aint.equal = nope.duo(Is.equal)

Aint.own = nope.duo(Is.own)
Aint.i = nope.duo(Is.i)
Aint.I = nope.duo(Is.I)
Aint.F = nope.duo(Is.F)

Aint.f = nope(Is.f)
Aint.S = nope(Is.S)
Aint.s = nope(Is.s)
Aint.b = nope(Is.b)
Aint.o = nope(Is.o)
Aint.O = nope(Is.O)
Aint.A = nope(Is.A)
Aint.a = nope(Is.a)
Aint.N = nope(Is.N)
Aint.n = nope(Is.n)
Aint.B = nope(Is.B)

Aint.f.gen = nope(Is.fgen)
Aint.f.async = nope(Is.fasync)
Aint.any = nope.mult(Is.any)
