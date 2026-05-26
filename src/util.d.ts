export type Ctor<T = unknown> = abstract new (...a: any[]) => T
export type Tuple<K = unknown, V = unknown> = [ K, V ]
export type FQuery<T = unknown> = (this: unknown, x: T, i: number) => unknown

export type AQuery<T = unknown> =
    | FQuery<T>
    | { has(x: T): boolean }
    | { includes(x: T): boolean }
    | RegExp
    | Partial<T>
    | T

export function echo<T>(x: T): T

export namespace echo {
    export function nil(): void
    export function ok(): true
    export function no(): false
}

export function concat<T>(...a: Array<T | readonly T[]>): T[]
export function concat(...a: unknown[]): unknown[]

export function each<K, V, C = undefined>(
    x: Iterable<Tuple<K, V>>,
    fx: (this: C, k: K, v: V, i: number) => unknown,
    ctx?: C,
): C

export function each<T extends object, C = undefined>(
    x: T,
    fx: (this: C, k: keyof T, v: T[keyof T], i: number) => unknown,
    ctx?: C,
): C

export class A<T = unknown> extends Array<T> {
    constructor(...items: T[])

    head: T | undefined
    tail: T | undefined
    size: number

    has(x: T): boolean
    each<C = this>(
        fx: (this: C, value: T, index: number, array: this) => unknown,
        ctx?: C,
    ): C
    where(query: AQuery<T>, ctx?: unknown, sym?: symbol): T[]
    rm(query: AQuery<T>, ctx?: unknown, sym?: symbol): T[]

    static of<T>(...items: T[]): A<T>
    static uniq<T>(a: Iterable<T>): T[]
    static fill<T = number>(n: number, fx?: (i: number) => T): T[]
    static prop<K extends PropertyKey>(k: K): <T extends Record<K, unknown>>(x: T) => T[K]

    static pre<T>(query: AQuery<T>, any?: symbol): FQuery<T>

    static where<T>(
        it: ArrayLike<T>,
        query: AQuery<T>,
        ctx?: unknown,
        sym?: symbol
    ): T[]

    static where<T>(
        sym: symbol,
        it: ArrayLike<T>,
        query: AQuery<T>,
        ctx?: unknown
    ): T[]

    static rm<T>(it: T[], query: AQuery<T>, ctx?: unknown, sym?: symbol): T[]
    static rm<T>(sym: symbol, it: T[], query: AQuery<T>, ctx?: unknown): T[]
}

export function random(): number
export function random(max: number): number
export function random(min: number, max: number): number

export function Is(x: unknown): boolean
export function Is<T>(y: Ctor<T>, x: unknown): x is T
export function Is(x: unknown, ...y: Array<Ctor | Function>): boolean

export namespace Is {
    export function t(x: unknown): string
    export function n(x: unknown): x is number
    export function N(x: unknown): x is number
    export function a(x: unknown): x is unknown[]
    export function B(x: unknown): x is Buffer
    export function p(x: unknown): x is PromiseLike<unknown>
    export function u<T>(x: T)   : x is NonNullable<T>
    export function x(x: unknown): x is object | Function
    export function b(x: unknown): x is boolean
    export function s(x: unknown): x is string
    export function S(x: unknown): x is symbol
    export function f(x: unknown): x is Function
    export function o(x: unknown): x is object
    export function i(x: unknown): x is Iterable<unknown>
    export function I<T>(y: Ctor<T>, x: unknown): x is T
    export function F<T>(y: Ctor<T>, x: unknown): x is T
    export function T(y: string, x: unknown): boolean
    export function any(x: unknown, ...y: Array<Ctor | Function>): boolean

    export const not: {
        (x: unknown): boolean
        <T>(y: Ctor<T>, x: unknown): x is T
        (x: unknown, ...y: Array<Ctor | Function>): boolean

        t(x: unknown): boolean
        n(x: unknown): boolean
        N(x: unknown): boolean
        a(x: unknown): boolean
        B(x: unknown): boolean
        p(x: unknown): boolean
        u(x: unknown): boolean
        x(x: unknown): boolean
        b(x: unknown): boolean
        s(x: unknown): boolean
        S(x: unknown): boolean
        f(x: unknown): boolean
        o(x: unknown): boolean
        i(x: unknown): boolean

        I<T>(y: Ctor<T>, x: unknown): boolean
        F<T>(y: Ctor<T>, x: unknown): boolean

        T(y: string, x: unknown): boolean
        any(x: unknown, ...y: Array<Ctor | Function>): boolean
    }
}

export class Fail extends Error {
    name: 'Fail'
    code: number

    constructor()
    constructor(msg: string, cause?: unknown)
    constructor(code: number, msg?: string, cause?: unknown)

    static error: Fail

    static of(): Fail
    static of(msg: string, cause?: unknown): Fail
    static of(code: number, msg?: string, cause?: unknown): Fail

    static deny(): Promise<never>
    static deny(msg: string, cause?: unknown): Promise<never>
    static deny(code: number, msg?: string, cause?: unknown): Promise<never>

    static raise(): never
    static raise(msg: string, cause?: unknown): never
    static raise(code: number, msg?: string, cause?: unknown): never

    static ok(x: unknown, msg?: string, cause?: unknown): true
    static ok(x: unknown, code: number, msg?: string, cause?: unknown): true

    static no(x: unknown, msg?: string, cause?: unknown): false
    static no(x: unknown, code: number, msg?: string, cause?: unknown): false

    static get [ 400 ](): Fail;  static get [ 423 ](): Fail
    static get [ 401 ](): Fail;  static get [ 424 ](): Fail
    static get [ 402 ](): Fail;  static get [ 425 ](): Fail
    static get [ 403 ](): Fail;  static get [ 426 ](): Fail
    static get [ 404 ](): Fail;  static get [ 428 ](): Fail
    static get [ 405 ](): Fail;  static get [ 429 ](): Fail
    static get [ 406 ](): Fail;  static get [ 431 ](): Fail
    static get [ 407 ](): Fail;  static get [ 451 ](): Fail
    static get [ 408 ](): Fail;  static get [ 500 ](): Fail
    static get [ 409 ](): Fail;  static get [ 501 ](): Fail
    static get [ 410 ](): Fail;  static get [ 502 ](): Fail
    static get [ 411 ](): Fail;  static get [ 503 ](): Fail
    static get [ 412 ](): Fail;  static get [ 504 ](): Fail
    static get [ 413 ](): Fail;  static get [ 505 ](): Fail
    static get [ 414 ](): Fail;  static get [ 506 ](): Fail
    static get [ 415 ](): Fail;  static get [ 507 ](): Fail
    static get [ 416 ](): Fail;  static get [ 508 ](): Fail
    static get [ 417 ](): Fail;  static get [ 509 ](): Fail
    static get [ 418 ](): Fail;  static get [ 510 ](): Fail
    static get [ 421 ](): Fail;  static get [ 511 ](): Fail
    static get [ 422 ](): Fail
}

export class O extends Object {
    static readonly o: Record<PropertyKey, never>

    static define: typeof Object.defineProperty
    static defines: typeof Object.defineProperties
    static descriptor: typeof Object.getOwnPropertyDescriptor
    static descriptors: typeof Object.getOwnPropertyDescriptors
    static symbols: typeof Object.getOwnPropertySymbols
    static names: typeof Object.getOwnPropertyNames
    static props: typeof Object.keys
    static from: typeof Object.fromEntries
    static own: typeof Object.hasOwn

    static tuple<K = string, V = unknown>(x: Iterable<Tuple<K, V>> | Record<string, V>): Iterable<Tuple<K, V>>

    static of<V = unknown>(x: Iterable<Tuple<PropertyKey, V>>): Record<PropertyKey, V>
    static ƒ<T extends object = Record<PropertyKey, unknown>>(...a: object[]): T
    static use<T extends object, S extends object>(target: T, source: S): T & S
    static use<T extends object>(...argv: unknown[]): T

    static alias<T extends object>(
        src: T,
        alias: string | PropertyKey | PropertyKey[],
        ...trg: object[]
    ): T | object
}
