import { STATUS } from './constants.js'

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

//──────────────────────────────────────────────────────────────────────────────

export class A extends Array {
    get head() { return this[ 0 ]   }
    get tail() { return this.at(-1) }

    set head(x) { this[ 0 ] = x }
    set tail(x) { this[ Math.max(0, this.size - 1) ] = x }

    get size() { return this.length }
    set size(x) { this.length = x }

    has(x)                 { return this.includes(x) }
    each(fx, ctx)          { return this.forEach(fx, ctx ??= this), ctx }
    where(query, ctx, sym) { return A.where(this, query, ctx, sym) }
    rm(query, ctx, sym)    { return A.rm(this, query, ctx, sym) }

    static of()               { return Reflect.construct(this, arguments) }
    static uniq(a)            { return A.from(new Set(a)) }
    static fill(n, fx = echo) { return A.from({ length: n }, (_, i) => fx(i)) }
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

        const rs = new A
        for (let fx = A.pre(query, sym), i = 0; i < it.length; i++)
            fx.call(ctx, it[ i ], i) && rs.push(it[ i ])
        return rs
    }

    static rm(it, query, ctx, sym)  {
        if (Is.S(it)) [ it, query, ctx, sym ] = [ query, ctx, sym, it ]
        else if (Is.S(ctx))      [ ctx, sym ] = [ sym, ctx ]

        let j = 0, rs = new A
        for (let i = 0, fx = A.pre(query, sym); i < it.length; i++) {
            fx.call(ctx,      it[ i ], i)
                ? rs.push(/**/it[ i ])
                : it[ j++ ] = it[ i ]
        }
        it.length = j
        return rs
    }
}

//──────────────────────────────────────────────────────────────────────────────

export function random(a, b) {
    return a == null
        ? +random
        : 0 | (b == null
            ? random * a
            : random * (b - a) + a)
}
random.valueOf = Math.random

//──────────────────────────────────────────────────────────────────────────────

export function Is(...a) {
    return Is[ 'uuI'[ a.length ] ?? 'any' ](...a)
}

{
    const T = Is.t = x => toString.call(x).slice(8, -1)

    Is.n = Number.isFinite
    Is.N = Number.isInteger
    Is.a = Array.isArray
    Is.B = globalThis.Buffer?.isBuffer ?? globalThis.ArrayBuffer.isView
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
    Is.T = (y, x) => RegExp(y).test(T(x))
    Is.any = (x, ...y) => y.includes(x?.constructor)
    Is.not = new Proxy(Is, {
        get  : (f, k)    => (...a) => !f[ k ](...a),
        apply: (f, o, a) => !f.apply(o, a),
    })
}

//──────────────────────────────────────────────────────────────────────────────

export class Fail extends Error {
    name = 'Fail'

    constructor() {
        let [ code, mssg, cause, start ] = new.target.parse(arguments)

        super(mssg, cause?.cause ? cause : { cause })

        this.code = code
        new.target.captureStackTrace(this, start ?? new.target)
    }

    static is(x)         { return this[ Symbol.hasInstance ](x) }
    static from(e, code) { return this.of(code ?? e.code ?? e.status ?? 500, e.message, e, this.from) }
    static raise(...a)   { throw  this.of(...a.concat(this.raise)) }
    static deny(...a)    { return Promise.reject(this.of(...a.concat(this.deny))) }
    static ok(x, ...a)   { return Boolean(x) || this.raise(...a.concat(this.ok)) }
    static no(x, ...a)   { return Boolean(x) && this.raise(...a.concat(this.no)) }
    static of(...a)      { return Reflect.construct(this, a.concat(this.of)) }

    static parse(argv) {
        let code, mssg, cause, start
        for (const a of argv) {
            switch (typeof a) {
                case 'number': code ? cause ??= a : code = a; break
                case 'string': mssg ? cause ??= a : mssg = a; break
                case 'function': start ??= a; break // take first funtion from arguments, ignore rest
                default: a == null || (cause = a); break
            }
        }

        code  ??= 500
        mssg  ??= STATUS[ code ] ?? String(code)
        cause ??= code
        return [ +code, mssg, cause, start ]
    }
}

//──────────────────────────────────────────────────────────────────────────────

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

            tail = this.assign(...tail.map(this.descriptors))

            if (cew.length) {
                const val = this.from(cew)
                const get = this.from(cew.slice(0, 2))
                for (a of this.names(tail).concat(this.symbols(tail)))
                    this.assign(tail[ a ], tail[ a ].get ? get : val)
            }
            for (a of head)
                this.defines(a, tail)
            return a
        }

        this.alias = (src, alias, ...trg) => {
            let key; [ key, ...alias ] = Is(alias, Array, Symbol)
                ? concat(alias)
                : alias.match(/\S+/g)

            const dsc = this.descriptor(src, key)
            dsc          || Fail.raise(`invalid alias: [${ key } ${ alias }]`)
            trg.length   || trg.push(src)
            alias.length || alias.push(key)

            for (src of trg) {
                for (key of alias)
                    this.define(src, key, dsc)
            }
            return src
        }
    }
}

//──────────────────────────────────────────────────────────────────────────────

// export function each(x, fx, ctx) {
//     let i = 0, brk = Symbol.for('break')
//     for (const [ k, v ] of O.tuple(x)) {
//         if (brk === fx.call(ctx, k, v, i++, brk))
//             break
//     }
//     return ctx
// }
// each.kv = each
// each.vk = (x, fx, ctx) => {
//     let i = 0, brk = Symbol.for('break')
//     for (const [ k, v ] of O.tuple(x)) {
//         if (brk === fx.call(ctx, v, k, i++, brk))
//             break
//     }
//     return ctx
// }

// export function raw(s, a) {
//     return (a => s?.raw
//         ? String.raw(s, ...a)
//         : ''.concat(s, ...a))(concat(a ?? []).map(String))
// }

// export function Rx(s, ...a) {
//     let flag = ''
//     let pttr = s?.raw
//         ?       raw(s, ...a.map(Rx.frmt))
//         : pttr.concat(s, ...a.map(Rx.frmt))

//     return new Rx(pttr
//         .replace(/ +# +.*/g, '')
//         .replace(/ *\n+ *(?![+*])/g, '')
//         .replace(/ *\/ *([idgmsyuv]+) *\/?$/, (_, f) => (flag += f, '')), flag)
// }
// Rx.frmt = x => concat(x).map(x => Is(RegExp, x) ? x.source : String(x)).join('')
