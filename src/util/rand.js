import O, { Fail } from './use.js'

const crypto = globalThis.crypto
const Buffers = O.of({
    [ Int8Array ]: 1,
    [ Int16Array ]: 1,
    [ Int32Array ]: 1,
    [ Uint8Array ]: 1,
    [ Uint16Array ]: 1,
    [ Uint32Array ]: 1,
    [ BigInt64Array ]: 1,
    [ BigUint64Array ]: 1,
})

let BFF = new Uint32Array(1)

export function random() {
    return +('0.' + crypto.getRandomValues(BFF)[ 0 ])
}

export function rand(min, max) {
    const r = +random
    return min == null
        ? r
        : Math.round(max == null
            ? r * min
            : r * (max - min) + min)
}

rand.valueOf = random.valueOf = random

export function compare(_) {
    return rand(-1, 1)
}

export function sort(it) {
    return it.sort(compare)
}

export function sample(it) {
    return it[ 0 | random * it.length ]
}

export function values(size, arr) {
    const Ctor = arr in Buffers
        ? arr
        : Int8Array
    return crypto.getRandomValues(new Ctor(size ?? 1))
}

export function value(ctor) {
    return values(1, ctor)[ 0 ]
}

export function string(size = 16) {
    let s = ''
    while (size--)
        s += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[ 0 | rand * 62 ]
    return s
}

export default O.use(rand, {
    sort,
    sample,
    values,
    value,
    string,

    get bool() { return this > .5 },
    get bin()  { return +this.bool },
    get uuid() { return crypto.randomUUID() },
    get buffer() { return BFF },
    set buffer(arr) {
        BFF = new arr(Buffers[ arr ] || Fail.raise('expected an Buffer constructor'))
    },
})
