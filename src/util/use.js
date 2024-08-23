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
    static group = this.groupBy
    static from = this.fromEntries
    static pro = (a, b) => b ? this.setPrototypeOf(a, b) : this.getPrototypeOf(a)
    static set = (a, b) => this.defines(a, this.descriptors(b))
    static of = (...a) => a.reduce(this.set, this.o)

    static use = (...a) => {
        let k, dsc
        let head = [], tail = []
        let cewVal = [], cewGet = [ 'configurable', 'enumerable', 'writable' ]

        for (k of a) {
            let i = cewVal.length
            if (k === Object(k)) {
                i
                    ? tail.push(k)
                    : head.push(k)
            }
            else {
                cewVal[ i ] = [ cewGet[ i ], !!k ]
            }
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

    static each = (it, fx, ctx) => {
        const BRK = Symbol.for('BREAK')
        for (let [ k, v ] of it?.entries?.() ?? this.entries(it)) {
            if (BRK === fx.call(ctx, k, v))
                break
        }
        return ctx
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

}

export { Fail }
export const {
    own,
    define,
    defines,
    descriptor,
    descriptors,
    group,
    pro,
    set,
    use,
    each,
    alias,
} = O
