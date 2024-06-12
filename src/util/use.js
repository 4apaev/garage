import Fail from './fail.js'

export default class O extends Object {

    static get o() {
        return this.create(null)
    }

    static own = this.hasOwn
    static define = this.defineProperty
    static defines = this.defineProperties
    static descriptor = this.getOwnPropertyDescriptor
    static descriptors = this.getOwnPropertyDescriptors
    static from = this.fromEntries

    static is(x) {
        return 'object' == typeof x && !!x
    }

    static cmplx(x) {
        return x === Object(x)
    }

    static use() {
        let k, dsc
        let head = [], tail = []
        let cewVal = [], cewGet = [ 'configurable', 'enumerable', 'writable' ]

        for (k of arguments) {
            this.cmplx(k)
                ? [ head, tail ][ +!!cewVal.length ].push(k)
                : cewVal.push([ cewGet[ cewVal.length ], !!k ])
        }

        tail.length || tail.push(head.pop())
        tail.length || Fail.raise('Invalid use: missing source')
        head.length || Fail.raise('Invalid use: missing target')

        cewGet = this.from(cewVal.slice(0, 2))
        cewVal = this.from(cewVal)

        dsc = this.assign(...tail.map(this.descriptors, this))

        for (k in dsc)
            this.assign(dsc[ k ], dsc[ k ].get ? cewGet : cewVal)

        for (k of head)
            this.defines(k, dsc)

        return k
    }

    static alias(src, props, ...trg) {
        let [ next, ...als ] = props.match(/\S+/g)
        let dsc = this.descriptor(src, next)

        dsc || Fail.raise('Invalid alias for ' + props, { src, props, trg })

        trg.length || trg.push(src)
        als.length || als.push(next)

        for (next of trg) {
            if (next === 1)
                next = src

            for (let a of als)
                this.define(next, a, dsc)
        }
        return next
    }

    static of = (...a) => a.reduce(this.set, this.o)
    static set = (a, b) => this.defines(a, this.descriptors(b))

    static each = (it, fx, ctx) => {
        const BRK = Symbol.for('BREAK')
        for (let [ k, v ] of it?.entries?.() ?? this.entries(it)) {
            if (BRK === fx.call(ctx, k, v))
                break
        }
        return ctx
    }

    static reduce = (it, fx, prev, ctx) =>
        this.each(it, (k, v) =>
            prev = fx.call(ctx, prev, k, v), prev)

    static group = (k, it) => it
        ? this.groupBy(it, o => o[ k ])
        : this.group.bind(this, k)

    static pro = (a, b) => b
        ? this.setPrototypeOf(a, b)
        : this.getPrototypeOf(a)

    static dig(src, path, fallback) {
        return path.split('.').every(k => (src = src[ k ]) != null)
            ? src
            : fallback
    }

    static dump(o, tab = 4) {
        if (tab === +tab)
            tab = ' '.repeat(tab)

        return (function inner(prev, next, path, key = '') {
            let line = tab.repeat(path.length) + key

            if (O.cmplx(next)) {
                prev.push(line)
                O.each(next, Array.isArray(next) || Set[ Symbol.hasInstance ](next)
                    ? (k, v) => inner(prev, v, path.concat(k), '- ')
                    : (k, v) => inner(prev, v, path.concat(k), k + ': '))
            }
            else {
                prev.push(line + next)
            }
            return prev
        })([], o, []).join('\n')
    }
}

O.alias(O, 'reduce map')

export { Fail }
export const {
    own,
    define,
    defines,
    descriptor,
    descriptors,
    from,
    is,
    of,
    set,
    cmplx,
    use,
    alias,
    each,
    reduce, map,
    group,
    dig,
    pro,
} = O
