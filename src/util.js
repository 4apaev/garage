export function each(x, fx, ctx) {
    let i = 0
    for (const [ k, v ] of Is.f(x?.entries) ? x.entries() : Object.entries(x))
        fx.call(ctx, k, v, i++)
    return ctx
}

export function Is(...a) {
    return Is[ 'uuI'[ a.length ] ?? 'any' ](...a)
}

{
    const T = Is.t = x => toString.call(x).slice(8, -1)

    //──────────────────────────────────────────────────────────────────────────────────────────

    const Buffer = globalThis.Buffer || { isBuffer: x => /\d+array$|buffer/i.test(T(x)) }

    //──────────────────────────────────────────────────────────────────────────────────────────

    Is.n = Number.isFinite
    Is.N = Number.isInteger
    Is.a = Array.isArray
    Is.B = Buffer.isBuffer
    Is.p = x => Is(Promise, x) || Is.f(x?.then)
    Is.u = x => x != null
    Is.x = x => Object(x) === x
    Is.b = x => typeof x == 'boolean'
    Is.s = x => typeof x == 'string'
    Is.S = x => typeof x == 'symbol'
    Is.f = x => typeof x == 'function'
    Is.o = x => typeof x == 'object' && !!x
    Is.i = x => Symbol.iterator in Object(x)
    Is.I = (y, x) => y[ Symbol.hasInstance ](x)
    Is.F = (y, x) => y === x?.constructor
    Is.T = (y, x) => y === T(x)
    Is.any = (x, ...y) => y.includes(x?.constructor)

    Is.not = new Proxy(Is, {
        get(tr, k) { return (...a) => !tr[ k ](...a) },
        apply(tr, ctx, a) { return !tr.apply(ctx, a) },
    })
}

export class Fail extends Error {
    name = 'Fail'
    code = 500

    constructor(code, msg, cause) {
        super(String(msg), cause?.cause ? cause : { cause })

        this.code = code
        Error.captureStackTrace?.(this, new.target)
    }

    static of() { return Reflect.construct(this, arguments) }
    static deny(...a) { return Promise.reject(this.of(...a)) }
    static raise(...a) { throw this.of(...a) }

    static ok(x, ...a) { return !!x || this.raise(...a) }
    static no(x, ...a) { return !!x && this.raise(...a) }
}
