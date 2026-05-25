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

    static of(code: number, msg: unknown, cause?: unknown): Fail
    static deny(code: number, msg: unknown, cause?: unknown): Promise<never>
    static raise(code: number, msg: unknown, cause?: unknown): never

    static ok(x: unknown, code: number, msg: unknown, cause?: unknown): true | never
    static no(x: unknown, code: number, msg: unknown, cause?: unknown): true | never
}
