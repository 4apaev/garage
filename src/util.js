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
    return ctx ?? x
}

//──────────────────────────────────────────────────────────────────────────────

export class A extends Array {
    get head() { return this[ 0 ]   }
    get tail() { return this.at(-1) }

    set head(x) { this[ 0 ] = x }
    set tail(x) { this[ Math.max(0, this.size - 1) ] = x }

    get size()  { return this.length }
    set size(x) { this.length = x }

    has(x)                 { return this.includes(x) }
    each(fx, ctx)          { return this.forEach(fx, ctx ??= this), ctx }

    where(query, ctx)      { return A.where(this, query, ctx) }
    get(query, ctx)        { return A.get(this, query, ctx) }
    rm(query, ctx)         { return A.rm(this, query, ctx) }

    static of()               { return Reflect.construct(this, arguments) }
    static uniq(a)            { return A.from(new Set(a)) }
    static fill(n, fx = echo) { return A.from({ length: n }, (_, i) => fx(i)) }
    static prop(k)            { return x => x[ k ] }

    static pre(query) {
        if (Is.f(query))          return query
        if (Is.f(query.has))      return x => query.has(x)       // Map | Set
        if (Is.f(query.includes)) return x => query.includes(x)  // Array | String
        if (Is(RegExp, query))    return x => query.test(x)
        if (Is.not.x(query))      return x => x === query

        const keys = O.keys(query)
        return x => keys.every(k => query[ k ] === x[ k ])
    }

    static where(it, query, ctx) {
        const rs = new A
        for (let fx = A.pre(query), i = 0; i < it.length; i++)
            fx.call(ctx, it[ i ], i) && rs.push(it[ i ])
        return rs
    }

    static get(it, query, ctx) {
        for (let fx = A.pre(query), i = 0; i < it.length; i++) {
            if (fx.call(ctx, it[ i ], i))
                return it[ i ]
        }
    }

    static rm(it, query, ctx)  {
        let j = 0, rs = new A
        for (let i = 0, fx = A.pre(query); i < it.length; i++) {
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
    Is.O = x => T(x) === 'Object'
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

    static maybe(fn, ctx) {
        let re, er
        return O.use(async function maybe() {
            re = er = void 0
            try {
                re = await fn.apply(ctx ?? this, arguments)
                return 1
            }
            catch (e) {
                er = new Fail(`[maybe] ${ e.message }`, e, maybe)
                return 0
            }
        }, {
            get error() { return er },
            get result() { return re } })
    }

    static parse(argv) {
        let code, mssg, cause, start
        for (const a of argv) {
            switch (typeof a) {
                case 'number': code ? cause ??= a : code = a; break
                case 'string': mssg ? cause ??= a : mssg = a; break
                case 'function': start ??= a; break // take first funtion from arguments, ignore the rest
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

    static define = this.defineProperty
    static defines = this.defineProperties
    static descriptor = this.getOwnPropertyDescriptor
    static descriptors = this.getOwnPropertyDescriptors
    static symbols = this.getOwnPropertySymbols
    static names = this.getOwnPropertyNames
    static from = this.fromEntries
    static own = this.hasOwn

    static set = (a, b) => this.defines(a, this.descriptors(b))
    static get = (a, b) => b ? this.descriptor(a, b) : this.descriptors(a)

    static pro = (...a) => a.length > 1 ? this.setPrototypeOf(...a) : this.getPrototypeOf(...a)

    static copy = x => this.create(this.pro(x), this.descriptors(x))
    static props = x => this.names(x).concat(this.symbols(x))
    static tuple = x => Is.f(x?.entries) ? x.entries() : this.entries(x)

    static pick = (o, ...a) => ((r, a) => each(o, (k, v) => a.has(k) && (r[ k ] = v), r))(this.o, new Set(a.flat()))
    static omit = (o, ...a) => ((r, a) => each(o, (k, v) => a.has(k) || (r[ k ] = v), r))(this.o, new Set(a.flat()))

    static of = x => this.ƒ(Is.O(x) ? x : this.from(x))
    static ƒ = (...a) => a.reduce(this.set, this.o)

    static use() {
        let cew = [], head = [], tail = []
        for (let a of arguments) {
            Is.x(a)
                ? cew.length
                    ? tail.push(a)
                    : head.push(a)
                : cew.push([ [ 'configurable', 'enumerable', 'writable' ][ cew.length ], !!a ])
        }

        tail.length || tail.push(head.pop())
        tail.length || Fail.raise('Invalid use: missing source')
        head.length || Fail.raise('Invalid use: missing target')

        tail = O.assign(...tail.map(O.descriptors))

        if (cew.length) {
            const val = O.from(cew)
            const get = O.from(cew.slice(0, 2))
            for (let a of O.props(tail))
                O.assign(tail[ a ], tail[ a ].get ? get : val)
        }

        for (let a of head)
            O.defines(a, tail)

        return head.at(-1)
    }

    static alias(src, alias, trg = src) {
        const [ key, ...props ] = Is(alias, A, Array, Symbol)
            ? concat(alias)
            : alias.match(/\S+/g)

        const dsc = O.descriptor(src, key)
        dsc || Fail.raise(`invalid alias: [${ key } ${ alias }]`, alias, O.alias)

        for (let prop of props)
            O.define(trg, prop, dsc)

        return trg
    }

    static nil(x, cb = echo) {
        if (Is.not.x(x)) return x

        for (const [ , v ] of O.tuple(x))
            O.nil(v, cb)

        Is.O(x) && cb(O.pro(x, null))
        return x
    }

}

export const {
    ƒ,
    nil,
    use,
    alias,
    copy,
    pick,
    omit, // set, get, pro, props, tuple, of,
} = O

//──────────────────────────────────────────────────────────────────────────────

export const BRK = Symbol('break')

export function eachExit(it, fn, ctx) {
    let i = 0
    for (const [ k, v ] of O.tuple(it)) {
        if (BRK === fn.call(ctx, k, v, i++, BRK))
            break
    }
    return ctx
}
each.brk = BRK
each.exit = eachExit
each.reduce = reduce

export function reduce(it, fn, acc, ctx) {
    let i = 0
    for (const [ k, v ] of O.tuple(it))
        acc = fn.call(ctx, acc, k, v, i++)
    return acc
}

export function dig(ctx, path, flbck) {
    let re = ctx
    return path.split('.').every(k => Is(re = re?.[ k ]))
        ? re
        : flbck
}
