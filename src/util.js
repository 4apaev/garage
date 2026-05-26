import { STATUS_CODES } from 'node:http'

export function echo(x) {
    return x
}
echo.nil = () => {}
echo.ok = () => true
echo.no = () => false

export function concat() {
    return [].concat(...arguments)
}

export function each(x, fx, ctx) {
    let i = 0
    for (const [ k, v ] of O.tuple(x))
        fx.call(ctx, k, v, i++)
    return ctx
}

//──────────────────────────────────────────────────────────────────────────────────────────

export class A extends Array {
    get head() { return this[ 0 ]   }
    get tail() { return this.at(-1) }

    set head(x) { this[ 0 ] = x }
    set tail(x) { this[ Math.max(0, this.length - 1) ] = x }

    get size() { return this.length }
    set size(x) { this.length = x }

    has(x)                 { return this.includes(x) }
    each(fx, ctx)          { return this.forEach(fx, ctx ??= this), ctx }
    where(query, ctx, sym) { return A.where(this, query, ctx, sym) }
    rm(query, ctx, sym)    { return A.rm(this, query, ctx, sym) }

    static of()               { return Reflect.construct(this, arguments) }
    static uniq(a)            { return Array.from(new Set(a)) }
    static fill(n, fx = echo) { return Array.from({ length: n }, (_, i) => fx(i)) }
    static prop(k)            { return x => x[ k ] }

    static pre(query, any) {
        if (Is.f(query))          return query
        if (Is.f(query.has))      return x => query.has(x)       // Map | Set
        if (Is.f(query.includes)) return x => query.includes(x)  // Array | String
        if (Is(RegExp, query))    return x => query.test(x)
        if (Is.not.x(query))      return x => x === query
        const keys = O.keys(query)
        const method = any === Symbol.for('any')
            ? 'some'
            : 'every'
        return x => keys[ method ](k => query[ k ] === x[ k ])
    }

    static where(it, query, ctx, sym) {
        /**/ if (Is.S(it))  [ it, query, ctx, sym ] = [ query, ctx, sym, it ]
        else if (Is.S(ctx))            [ ctx, sym ] = [        sym, ctx ]

        const rs = []
        for (let fx = A.pre(query, sym), i = 0; i < it.length; i++)
            fx.call(ctx, it[ i ], i) && rs.push(it[ i ])
        return rs
    }

    static rm(it, query, ctx, sym)  {
        if (Is.S(it)) [ it, query, ctx, sym ] = [ query, ctx, sym, it ]
        else if (Is.S(ctx))      [ ctx, sym ] = [ sym, ctx ]

        let j = 0, rs = []
        for (let i = 0, fx = A.pre(query, sym); i < it.length; i++) {
            fx.call(ctx,      it[ i ], i)
                ? rs.push(/**/it[ i ])
                : it[ j++ ] = it[ i ]
        }
        it.length = j
        return rs
    }
}

//──────────────────────────────────────────────────────────────────────────────────────────

export function random(a, b) {
    return a == null
        ? +random
        : 0 | (b == null
            ? random * a
            : random * (b - a) + a)
}
random.valueOf = Math.random

//──────────────────────────────────────────────────────────────────────────────────────────

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
        get  : (f, k)    => (...a) => !f[ k ](...a),
        apply: (f, o, a) => !f.apply(o, a),
    })
}

export class Fail extends Error {
    name = 'Fail'
    code = 500

    constructor(code, msg, cause = code) {
        code in STATUS_CODES || ([ code, msg ] = [ msg, code ])
        code ??= 500
        msg  ??= STATUS_CODES[ code ]

        super(msg, cause?.cause ? cause : { cause })

        this.code = code
        new.target.error = this
        new.target.captureStackTrace(this, new.target)
    }

    static of() { return Reflect.construct(this, arguments) }
    static deny(...a) { return Promise.reject(this.of(...a)) }
    static raise(...a) { throw this.of(...a) }

    static ok(x, ...a) { return !!x || this.raise(...a) }
    static no(x, ...a) { return !!x && this.raise(...a) }
}

export class O extends Object {

    static get o() { return this.create(null) }

    static {
        this.define = this.defineProperty
        this.defines = this.defineProperties
        this.descriptor = this.getOwnPropertyDescriptor
        this.descriptors = this.getOwnPropertyDescriptors
        this.symbols = this.getOwnPropertySymbols
        this.names = this.getOwnPropertyNames
        this.from = this.fromEntries
        this.own = this.hasOwn

        this.tuple = x => Is.f(x?.entries) ? x.entries() : this.entries(x)
        this.of    = x => this.ƒ(this.from(x))
        this.ƒ     = (...a) => a.reduce((x, y) => this.use(x, y), this.o)

        const CEW = [ 'configurable', 'enumerable', 'writable' ]

        /**
         * @example
         *  O.use(trg, src)                            - same as `Object.defineProperties(trg, Object.getOwnPropertyDescriptors(src))`
         *  O.use(trg_a, trg_b, 1,       src_a, src_b) - set `configurable` to true. multiple sources & targets
         *  O.use(trg_a, trg_b, 1, 0,    src_a, src_b) - set `configurable: true, enumerable: false` multiple sources & targets
         *  O.use(trg_a, trg_b, 1, 0, 1, src_a, src_b) - set `configurable: true, enumerable: false, writable: true` multiple sources & targets
         */
        this.use = (...argv) => {
            let a, cew = [], head = [], tail = []
            for (a of argv) {
                Is.x(a)
                    ? cew.length
                        ? tail.push(a)
                        : head.push(a)
                    : cew.push([ CEW[ cew.length ], !!a ])
            }

            tail.length || tail.push(head.pop())
            tail.length || Fail.raise('Invalid use: missing source')
            head.length || Fail.raise('Invalid use: missing target')

            tail = this.assign(...tail.map(this.getOwnPropertyDescriptors))

            if (cew.length) {
                cew = [ cew, cew.slice(0, 2) ].map(this.fromEntries)
                for (a of this.names(tail).concat(this.symbols(tail)))
                    this.assign(tail[ a ], cew[ +!!tail[ a ].get ])
            }
            for (a of head)
                this.defineProperties(a, tail)
            return a
        }

        this.alias = (src, alias, ...trg) => {
            let key; [ key, ...alias ] = Is(alias, Array, Symbol)
                ? concat(alias)
                : alias.match(/\S+/g)

            const dsc = this.descriptor(src, key)
            dsc         || Fail.raise(`invalid alias: [${ key } ${ alias }]`)
            trg.length  || trg.push(src)
            alias.length || alias.push(key)

            for (src of trg) {
                for (key of alias)
                    this.define(src, key, dsc)
            }
            return src
        }
    }
}

each(STATUS_CODES, (k, m) => (k = +k) < 400
    || O.use(Fail, {
        get [ k ]() { return this.of(k, m.toLowerCase()) } }))
