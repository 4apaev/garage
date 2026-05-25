export type Ctor<T = unknown> = abstract new (...a: any[]) => T
export type Pair<K = unknown, V = unknown> = [ K, V ]

export function each<K, V, C>(
    x: Iterable<Pair<K, V>>,
    fx: (this: C, k: K, v: V, i: number) => unknown,
    ctx: C,
): C

export function each<T extends object, C>(
    x: T,
    fx: (this: C, k: keyof T, v: T[keyof T], i: number) => unknown,
    ctx: C,
): C

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

    constructor(code: number, msg: unknown, cause?: unknown)

    static error: Fail

    static of(code: number, msg: unknown, cause?: unknown): Fail
    static deny(code: number, msg: unknown, cause?: unknown): Promise<never>
    static raise(code: number, msg: unknown, cause?: unknown): never

    static ok(x: unknown, code: number, msg: unknown, cause?: unknown): true | never
    static no(x: unknown, code: number, msg: unknown, cause?: unknown): true | never

    static get [ 400 ](): Fail
    static get [ 401 ](): Fail
    static get [ 402 ](): Fail
    static get [ 403 ](): Fail
    static get [ 404 ](): Fail
    static get [ 405 ](): Fail
    static get [ 406 ](): Fail
    static get [ 407 ](): Fail
    static get [ 408 ](): Fail
    static get [ 409 ](): Fail
    static get [ 410 ](): Fail
    static get [ 411 ](): Fail
    static get [ 412 ](): Fail
    static get [ 413 ](): Fail
    static get [ 414 ](): Fail
    static get [ 415 ](): Fail
    static get [ 416 ](): Fail
    static get [ 417 ](): Fail
    static get [ 418 ](): Fail
    static get [ 421 ](): Fail
    static get [ 422 ](): Fail
    static get [ 423 ](): Fail
    static get [ 424 ](): Fail
    static get [ 425 ](): Fail
    static get [ 426 ](): Fail
    static get [ 428 ](): Fail
    static get [ 429 ](): Fail
    static get [ 431 ](): Fail
    static get [ 451 ](): Fail
    static get [ 500 ](): Fail
    static get [ 501 ](): Fail
    static get [ 502 ](): Fail
    static get [ 503 ](): Fail
    static get [ 504 ](): Fail
    static get [ 505 ](): Fail
    static get [ 506 ](): Fail
    static get [ 507 ](): Fail
    static get [ 508 ](): Fail
    static get [ 509 ](): Fail
    static get [ 510 ](): Fail
    static get [ 511 ](): Fail
}
