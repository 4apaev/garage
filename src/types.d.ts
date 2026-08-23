declare module 'garage' {
    import { EventEmitter } from 'node:events'
    import {
        IncomingMessage,
        Server,
        ServerResponse,
    } from 'node:http'
    import { Readable } from 'node:stream'
    import { Fail } from 'garage/util'

    export type Next      = () => Promise<unknown>
    export type MWare     = (rq: Req, rs: Res, next?: Next) => Promise<unknown> | unknown
    export type Validator = (rq: Req) => boolean

    export interface GarageOptions {
        cwd? : string
        pid? : number
        port?: string | number
        name?: string
        onerror?: (this: Garage, e: Fail, rq: Req, rs: Res, app: Garage) => unknown
    }

    export class Garage extends EventEmitter {
        middleware?: MWare
        mware: MWare[]
        options: GarageOptions
        server?: Server

        constructor(opt?: GarageOptions)
        use(...args: Array<string | MWare>): this
        onerror(e: Fail, rq: Req, rs: Res, app: Garage): unknown
        request(rq: Req, rs: Res): Promise<unknown>
        init(): Server
        listen(port?: string | number): void
        get(...args: Array<string | MWare>): this
        put(...args: Array<string | MWare>): this
        post(...args: Array<string | MWare>): this
        del(...args: Array<string | MWare>): this
        patch(...args: Array<string | MWare>): this

        static of(opt?: GarageOptions): Garage
        static create(listener?: (rq: Req, rs: Res) => unknown): Server
    }

    export default Garage

    export class Req extends IncomingMessage {
        body?: unknown
        error?: Error
        params: Record<string, string>

        get URL(): URL
        get path(): string
        get query(): Record<string, string>
        get type(): string
        get size(): number

        has(k: string): boolean
        get(k: string): string
        reader(): Promise<void>
    }

    export class Res extends ServerResponse {
        body?: unknown
        error?: Error

        get rq(): Req
        get status(): number
        set status(x: number)
        get size(): number
        set size(x: number)
        get type(): string | number | string[] | undefined
        set type(x: string)

        has(k: string): boolean
        get(k: string): string | number | string[]
        rm(k: string): void
        set(k: string | Record<string, string | number | readonly string[]>, v?: string | number | readonly string[]): this
        append(k: string | Record<string, string | number | readonly string[]>, v?: string | number | readonly string[]): this
        json(code: number, data: unknown): this
        send(code: number, data?: unknown): this
        file(path: string): Promise<this>
        resolve(data?: unknown | Buffer | Readable): this
    }

    export { default as use } from 'garage/use'

    export {
        default as compose,
    } from 'garage/compose'
}

declare module 'garage/garage' {
    export {
        Garage,
        Req,
        Res,
        default,
    } from 'garage'
    export type {
        GarageOptions,
    } from 'garage'
}

declare module 'garage/compose' {
    import type { MWare } from 'garage'

    export function composeProd(mware: MWare[]): MWare
    export function composeDev(...middleware: Array<MWare | MWare[]>): MWare

    export default composeDev
}

declare module 'garage/use' {
    import type { MWare } from 'garage'

    export type Method =
        | 'GET'
        | 'COPY'
        | 'PUT'
        | 'PATCH'
        | 'UPDATE'
        | 'POST'
        | 'MERGE'
        | 'DELETE'
        | 'MOVE'
        | 'HEAD'
        | 'OPTIONS'
        | 'TRACE'
        | 'SEARCH'
        | 'BIND'
        | 'UNBIND'
        | 'LINK'
        | 'UNLINK'

    export type MethodName = Method | Uppercase<Method>
    export type Pattern = string
    export type Filter = MethodName | Pattern
    export type UseArg = Filter | MWare
    export type ArgsWithHandler<T extends readonly UseArg[]> =
        T extends readonly [ infer Head, ...infer Tail ]
            ? Head extends MWare
                ? T
                : Head extends Filter
                    ? readonly [ Head, ...ArgsWithHandler<Extract<Tail, readonly UseArg[]>> ]
                    : never
            : never

    export function use(...f: MWare[]): MWare
    export function use(method: MethodName, ...f: MWare[]): MWare
    export function use(method: MethodName, pattern: string, ...f: MWare[]): MWare
    export function use(pattern: string, ...f: MWare[]): MWare

    export default function use<const T extends readonly UseArg[]>(
        ...args: T & ArgsWithHandler<T>
    ): MWare
}

declare module 'garage/mime' {
    import type { Mime } from 'garage/constants'

    export type THead =
        | { get(k: string): string | null | undefined }
        | { 'content-type'?: string | null | undefined }

    export const MIME: Mime

    export function get(s: string): string | undefined
    export function get(s: string, fallback: string): string

    export function fromHead(ctx?: THead | null): string | undefined
    export function fromHead(ctx: THead | null | undefined, fallback: string): string

    export function fromPath(s: string | URL): string | undefined
    export function fromPath(s: string | URL, fallback: string): string

    export function extname(file: string | URL): string
    export function is(expected: string, actual?: string | THead | null): boolean
}

declare module 'garage/sync' {
    import { Fail } from 'garage/util'

    export type Prmtv = string | number | boolean
    export type Query = | URLSearchParams
                        | Iterable<[ string, Prmtv | readonly Prmtv[]]>
                        |     Record<string, Prmtv | readonly Prmtv[]>

    export interface Payload<T = unknown> {
        rs    : Response
        ok    : boolean
        code  : number
        status: number
        error?: Fail
        head  : Headers
        body? : T
    }

    export default class Sync<T = unknown> implements PromiseLike<Payload<T>> {
        static base: string
        static head: Headers

        name    : 'Sync'
        url     : URL
        head    : Headers
        aborter : AbortController
        method  : string
        body?   : string
        payload?: Payload<T>

        constructor(method?: string, url?: string | URL, data?: unknown)

        get params(): Record<PropertyKey, string>
        get signal(): AbortSignal

        type(): string
        type(x: string): this

        size(): number
        size(x: string | number): this

        has(k: string): boolean
        get(k: string): string
        append(k: string, v: string): void

        set(k: HeadersInit, v?: never): this
        set(k: string, v: string): this

        query(k?: null): this
        query(k: Query): this
        query(k: string, v: Prmtv | readonly Prmtv[]): this

        json(x: unknown): this
        send(x?: unknown): this
        abort(cause?: unknown): this

        then<TRok = Payload<T>, TRno = never>(
            ok?:   ((x: Payload<T>) => TRok | PromiseLike<TRok>) | null,
            nope?: ((e: unknown)    => TRno | PromiseLike<TRno>) | null,
        ): Promise<TRok | TRno>

        end<TRok = Payload<T>, TRno = never>(
            ok?:   ((x: Payload<T>) => TRok | PromiseLike<TRok>) | null,
            nope?: ((e: unknown)    => TRno | PromiseLike<TRno>) | null,
        ): Promise<TRok | TRno>

        parse(rs: Response): Promise<Payload<T>>

        static get<T  = unknown>(u?: string | URL, x?: unknown): Sync<T>
        static put<T  = unknown>(u?: string | URL, x?: unknown): Sync<T>
        static post<T = unknown>(u?: string | URL, x?: unknown): Sync<T>
        static del<T  = unknown>(u?: string | URL, x?: unknown): Sync<T>
    }
}

declare module 'garage/util' {
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
}

declare module 'garage/constants' {
    export type Method =
        | 'ACL'
        | 'BASELINE-CONTROL'
        | 'BIND'
        | 'CHECKIN'
        | 'CHECKOUT'
        | 'CONNECT'
        | 'COPY'
        | 'DELETE'
        | 'GET'
        | 'HEAD'
        | 'LABEL'
        | 'LINK'
        | 'LOCK'
        | 'MERGE'
        | 'MKACTIVITY'
        | 'MKCALENDAR'
        | 'MKCOL'
        | 'MKREDIRECTREF'
        | 'MKWORKSPACE'
        | 'MOVE'
        | 'OPTIONS'
        | 'ORDERPATCH'
        | 'PATCH'
        | 'POST'
        | 'PRI'
        | 'PROPFIND'
        | 'PROPPATCH'
        | 'PUT'
        | 'REBIND'
        | 'REPORT'
        | 'SEARCH'
        | 'TRACE'
        | 'UNBIND'
        | 'UNCHECKOUT'
        | 'UNLINK'
        | 'UNLOCK'
        | 'UPDATE'
        | 'UPDATEREDIRECTREF'
        | 'VERSION-CONTROL'

    export interface MethodList {
        readonly length: number
        readonly [key: number]: Method
        readonly has: (method: string) => boolean
    }

    export type HeaderValue = string | HeaderBag

    export interface HeaderBag {
        readonly [key: string]: HeaderValue
    }

    export interface Header extends HeaderBag {
        readonly PATH: ':path'
        readonly METHOD: ':method'
        readonly STATUS: ':status'
        readonly SCHEME: ':scheme'
        readonly PROTOCOL: ':protocol'
        readonly AUTHORITY: ':authority'

        readonly UPGRADE: {
            readonly UPGRADE: 'upgrade'
            readonly INSECURE: { readonly REQUESTS: 'upgrade-insecure-requests' }
        }
        readonly upgrade: 'upgrade'

        readonly accept: 'accept'
        readonly ACCEPT: {
            readonly ACCEPT: 'accept'
            readonly ENCODING: 'accept-encoding'
            readonly LANGUAGE: 'accept-language'
            readonly RANGES: 'accept-ranges'
            readonly CHARSET: 'accept-charset'
        }

        readonly ACCESS: {
            readonly CONTROL: {
                readonly ALLOW: {
                    readonly ORIGIN: 'access-control-allow-origin'
                    readonly HEADERS: 'access-control-allow-headers'
                    readonly METHODS: 'access-control-allow-methods'
                    readonly CREDENTIALS: 'access-control-allow-credentials'
                }
                readonly REQUEST: {
                    readonly METHOD: 'access-control-request-method'
                    readonly HEADERS: 'access-control-request-headers'
                }
                readonly EXPOSE: { readonly HEADERS: 'access-control-expose-headers' }
                readonly MAX: { readonly AGE: 'access-control-max-age' }
            }
        }

        readonly CONTENT: {
            readonly MD5: 'content-md5'
            readonly TYPE: 'content-type'
            readonly RANGE: 'content-range'
            readonly LENGTH: 'content-length'
            readonly ENCODING: 'content-encoding'
            readonly LANGUAGE: 'content-language'
            readonly LOCATION: 'content-location'
            readonly DISPOSITION: 'content-disposition'
            readonly SECURITY: { readonly POLICY: 'content-security-policy' }
        }

        readonly PROXY: {
            readonly AUTHENTICATE: 'proxy-authenticate'
            readonly AUTHORIZATION: 'proxy-authorization'
            readonly CONNECTION: 'proxy-connection'
        }

        readonly IF: {
            readonly UNMODIFIED: { readonly SINCE: 'if-unmodified-since' }
            readonly MODIFIED: { readonly SINCE: 'if-modified-since' }
            readonly NONE: { readonly MATCH: 'if-none-match' }
            readonly RANGE: 'if-range'
            readonly MATCH: 'if-match'
        }

        readonly X: {
            readonly CONTENT_TYPE_OPTIONS: 'x-content-type-options'
            readonly FRAME_OPTIONS: 'x-frame-options'
            readonly XSS_PROTECTION: 'x-xss-protection'
            readonly FORWARDED_FOR: 'x-forwarded-for'
        }

        readonly CACHE: { readonly CONTROL: 'cache-control' }
        readonly ALT: { readonly SVC: 'alt-svc' }
        readonly KEEP: { readonly ALIVE: 'keep-alive' }
        readonly LAST: { readonly MODIFIED: 'last-modified' }
        readonly MAX: { readonly FORWARDS: 'max-forwards' }
        readonly RETRY: { readonly AFTER: 'retry-after' }
        readonly SET: { readonly COOKIE: 'set-cookie' }
        readonly USER: { readonly AGENT: 'user-agent' }
        readonly TRANSFER: { readonly ENCODING: 'transfer-encoding' }
        readonly STRICT: { readonly TRANSPORT: { readonly SECURITY: 'strict-transport-security' }}
        readonly TIMING: { readonly ALLOW: { readonly ORIGIN: 'timing-allow-origin' }}

        readonly AGE: 'age'
        readonly ALLOW: 'allow'
        readonly AUTHORIZATION: 'authorization'
        readonly CONNECTION: 'connection'
        readonly COOKIE: 'cookie'
        readonly DATE: 'date'
        readonly DNT: 'dnt'
        readonly EARLY_DATA: 'early-data'
        readonly ETAG: 'etag'
        readonly EXPECT: 'expect'
        readonly EXPECT_CT: 'expect-ct'
        readonly EXPIRES: 'expires'
        readonly FORWARDED: 'forwarded'
        readonly FROM: 'from'
        readonly HOST: 'host'
        readonly HTTP2_SETTINGS: 'http2-settings'
        readonly LINK: 'link'
        readonly LOCATION: 'location'
        readonly ORIGIN: 'origin'
        readonly PREFER: 'prefer'
        readonly PRIORITY: 'priority'
        readonly PURPOSE: 'purpose'
        readonly RANGE: 'range'
        readonly REFERER: 'referer'
        readonly REFRESH: 'refresh'
        readonly SERVER: 'server'
        readonly TE: 'te'
        readonly TK: 'tk'
        readonly TRAILER: 'trailer'
        readonly VARY: 'vary'
        readonly VIA: 'via'
        readonly WARNING: 'warning'
        readonly WWW_AUTHENTICATE: 'www-authenticate'
    }

    export type StatusCode =
        | 100 | 101 | 102 | 103
        | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226
        | 300 | 301 | 302 | 303 | 304 | 305 | 307 | 308
        | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409
        | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 421
        | 422 | 423 | 424 | 425 | 426 | 428 | 429 | 431 | 451
        | 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 509 | 510 | 511

    export type ErrorStatusCode =
        | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409
        | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 421
        | 422 | 423 | 424 | 425 | 426 | 428 | 429 | 431 | 451
        | 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 509 | 510 | 511

    export type StatusName =
        | 'CONTINUE'
        | 'SWITCHING_PROTOCOLS'
        | 'PROCESSING'
        | 'EARLY_HINTS'
        | 'OK'
        | 'CREATED'
        | 'ACCEPTED'
        | 'NON_AUTHORITATIVE_INFORMATION'
        | 'NO_CONTENT'
        | 'RESET_CONTENT'
        | 'PARTIAL_CONTENT'
        | 'MULTI_STATUS'
        | 'ALREADY_REPORTED'
        | 'IM_USED'
        | 'MULTIPLE_CHOICES'
        | 'MOVED_PERMANENTLY'
        | 'FOUND'
        | 'SEE_OTHER'
        | 'NOT_MODIFIED'
        | 'USE_PROXY'
        | 'TEMPORARY_REDIRECT'
        | 'PERMANENT_REDIRECT'
        | 'BAD_REQUEST'
        | 'UNAUTHORIZED'
        | 'PAYMENT_REQUIRED'
        | 'FORBIDDEN'
        | 'NOT_FOUND'
        | 'METHOD_NOT_ALLOWED'
        | 'NOT_ACCEPTABLE'
        | 'PROXY_AUTHENTICATION_REQUIRED'
        | 'REQUEST_TIMEOUT'
        | 'CONFLICT'
        | 'GONE'
        | 'LENGTH_REQUIRED'
        | 'PRECONDITION_FAILED'
        | 'PAYLOAD_TOO_LARGE'
        | 'URI_TOO_LONG'
        | 'UNSUPPORTED_MEDIA_TYPE'
        | 'RANGE_NOT_SATISFIABLE'
        | 'EXPECTATION_FAILED'
        | 'TEAPOT'
        | 'MISDIRECTED_REQUEST'
        | 'UNPROCESSABLE_ENTITY'
        | 'LOCKED'
        | 'FAILED_DEPENDENCY'
        | 'TOO_EARLY'
        | 'UPGRADE_REQUIRED'
        | 'PRECONDITION_REQUIRED'
        | 'TOO_MANY_REQUESTS'
        | 'REQUEST_HEADER_FIELDS_TOO_LARGE'
        | 'UNAVAILABLE_FOR_LEGAL_REASONS'
        | 'INTERNAL_SERVER_ERROR'
        | 'NOT_IMPLEMENTED'
        | 'BAD_GATEWAY'
        | 'SERVICE_UNAVAILABLE'
        | 'GATEWAY_TIMEOUT'
        | 'HTTP_VERSION_NOT_SUPPORTED'
        | 'VARIANT_ALSO_NEGOTIATES'
        | 'INSUFFICIENT_STORAGE'
        | 'LOOP_DETECTED'
        | 'BANDWIDTH_LIMIT_EXCEEDED'
        | 'NOT_EXTENDED'
        | 'NETWORK_AUTHENTICATION_REQUIRED'

    export interface Status {
        readonly [key: string]: string | number
        readonly [key: number]: string

        readonly CONTINUE: 100
        readonly 100: 'continue'
        readonly SWITCHING_PROTOCOLS: 101
        readonly 101: 'switching protocols'
        readonly PROCESSING: 102
        readonly 102: 'processing'
        readonly EARLY_HINTS: 103
        readonly 103: 'early hints'
        readonly OK: 200
        readonly 200: 'ok'
        readonly CREATED: 201
        readonly 201: 'created'
        readonly ACCEPTED: 202
        readonly 202: 'accepted'
        readonly NON_AUTHORITATIVE_INFORMATION: 203
        readonly 203: 'non authoritative information'
        readonly NO_CONTENT: 204
        readonly 204: 'no content'
        readonly RESET_CONTENT: 205
        readonly 205: 'reset content'
        readonly PARTIAL_CONTENT: 206
        readonly 206: 'partial content'
        readonly MULTI_STATUS: 207
        readonly 207: 'multi status'
        readonly ALREADY_REPORTED: 208
        readonly 208: 'already reported'
        readonly IM_USED: 226
        readonly 226: 'im used'
        readonly MULTIPLE_CHOICES: 300
        readonly 300: 'multiple choices'
        readonly MOVED_PERMANENTLY: 301
        readonly 301: 'moved permanently'
        readonly FOUND: 302
        readonly 302: 'found'
        readonly SEE_OTHER: 303
        readonly 303: 'see other'
        readonly NOT_MODIFIED: 304
        readonly 304: 'not modified'
        readonly USE_PROXY: 305
        readonly 305: 'use proxy'
        readonly TEMPORARY_REDIRECT: 307
        readonly 307: 'temporary redirect'
        readonly PERMANENT_REDIRECT: 308
        readonly 308: 'permanent redirect'
        readonly BAD_REQUEST: 400
        readonly 400: 'bad request'
        readonly UNAUTHORIZED: 401
        readonly 401: 'unauthorized'
        readonly PAYMENT_REQUIRED: 402
        readonly 402: 'payment required'
        readonly FORBIDDEN: 403
        readonly 403: 'forbidden'
        readonly NOT_FOUND: 404
        readonly 404: 'not found'
        readonly METHOD_NOT_ALLOWED: 405
        readonly 405: 'method not allowed'
        readonly NOT_ACCEPTABLE: 406
        readonly 406: 'not acceptable'
        readonly PROXY_AUTHENTICATION_REQUIRED: 407
        readonly 407: 'proxy authentication required'
        readonly REQUEST_TIMEOUT: 408
        readonly 408: 'request timeout'
        readonly CONFLICT: 409
        readonly 409: 'conflict'
        readonly GONE: 410
        readonly 410: 'gone'
        readonly LENGTH_REQUIRED: 411
        readonly 411: 'length required'
        readonly PRECONDITION_FAILED: 412
        readonly 412: 'precondition failed'
        readonly PAYLOAD_TOO_LARGE: 413
        readonly 413: 'payload too large'
        readonly URI_TOO_LONG: 414
        readonly 414: 'uri too long'
        readonly UNSUPPORTED_MEDIA_TYPE: 415
        readonly 415: 'unsupported media type'
        readonly RANGE_NOT_SATISFIABLE: 416
        readonly 416: 'range not satisfiable'
        readonly EXPECTATION_FAILED: 417
        readonly 417: 'expectation failed'
        readonly TEAPOT: 418
        readonly 418: 'teapot'
        readonly MISDIRECTED_REQUEST: 421
        readonly 421: 'misdirected request'
        readonly UNPROCESSABLE_ENTITY: 422
        readonly 422: 'unprocessable entity'
        readonly LOCKED: 423
        readonly 423: 'locked'
        readonly FAILED_DEPENDENCY: 424
        readonly 424: 'failed dependency'
        readonly TOO_EARLY: 425
        readonly 425: 'too early'
        readonly UPGRADE_REQUIRED: 426
        readonly 426: 'upgrade required'
        readonly PRECONDITION_REQUIRED: 428
        readonly 428: 'precondition required'
        readonly TOO_MANY_REQUESTS: 429
        readonly 429: 'too many requests'
        readonly REQUEST_HEADER_FIELDS_TOO_LARGE: 431
        readonly 431: 'request header fields too large'
        readonly UNAVAILABLE_FOR_LEGAL_REASONS: 451
        readonly 451: 'unavailable for legal reasons'
        readonly INTERNAL_SERVER_ERROR: 500
        readonly 500: 'internal server error'
        readonly NOT_IMPLEMENTED: 501
        readonly 501: 'not implemented'
        readonly BAD_GATEWAY: 502
        readonly 502: 'bad gateway'
        readonly SERVICE_UNAVAILABLE: 503
        readonly 503: 'service unavailable'
        readonly GATEWAY_TIMEOUT: 504
        readonly 504: 'gateway timeout'
        readonly HTTP_VERSION_NOT_SUPPORTED: 505
        readonly 505: 'http version not supported'
        readonly VARIANT_ALSO_NEGOTIATES: 506
        readonly 506: 'variant also negotiates'
        readonly INSUFFICIENT_STORAGE: 507
        readonly 507: 'insufficient storage'
        readonly LOOP_DETECTED: 508
        readonly 508: 'loop detected'
        readonly BANDWIDTH_LIMIT_EXCEEDED: 509
        readonly 509: 'bandwidth limit exceeded'
        readonly NOT_EXTENDED: 510
        readonly 510: 'not extended'
        readonly NETWORK_AUTHENTICATION_REQUIRED: 511
        readonly 511: 'network authentication required'
    }

    export type StatusErr = Pick<Status, ErrorStatusCode>

    export type SysErrKey =
        | 'E2BIG'
        | 'EACCES'
        | 'EADDRINUSE'
        | 'EADDRNOTAVAIL'
        | 'EAFNOSUPPORT'
        | 'EAGAIN'
        | 'EAI_ADDRFAMILY'
        | 'EAI_AGAIN'
        | 'EAI_BADFLAGS'
        | 'EAI_BADHINTS'
        | 'EAI_CANCELED'
        | 'EAI_FAIL'
        | 'EAI_FAMILY'
        | 'EAI_MEMORY'
        | 'EAI_NODATA'
        | 'EAI_NONAME'
        | 'EAI_OVERFLOW'
        | 'EAI_PROTOCOL'
        | 'EAI_SERVICE'
        | 'EAI_SOCKTYPE'
        | 'EALREADY'
        | 'EBADF'
        | 'EBUSY'
        | 'ECANCELED'
        | 'ECHARSET'
        | 'ECONNABORTED'
        | 'ECONNREFUSED'
        | 'ECONNRESET'
        | 'EDESTADDRREQ'
        | 'EEXIST'
        | 'EFAULT'
        | 'EFBIG'
        | 'EHOSTUNREACH'
        | 'EINTR'
        | 'EINVAL'
        | 'EIO'
        | 'EISCONN'
        | 'EISDIR'
        | 'ELOOP'
        | 'EMFILE'
        | 'EMSGSIZE'
        | 'ENAMETOOLONG'
        | 'ENETDOWN'
        | 'ENETUNREACH'
        | 'ENFILE'
        | 'ENOBUFS'
        | 'ENODEV'
        | 'ENOENT'
        | 'ENOMEM'
        | 'ENONET'
        | 'ENOPROTOOPT'
        | 'ENOSPC'
        | 'ENOSYS'
        | 'ENOTCONN'
        | 'ENOTDIR'
        | 'ENOTEMPTY'
        | 'ENOTSOCK'
        | 'ENOTSUP'
        | 'EOVERFLOW'
        | 'EPERM'
        | 'EPIPE'
        | 'EPROTO'
        | 'EPROTONOSUPPORT'
        | 'EPROTOTYPE'
        | 'ERANGE'
        | 'EROFS'
        | 'ESHUTDOWN'
        | 'ESPIPE'
        | 'ESRCH'
        | 'ETIMEDOUT'
        | 'ETXTBSY'
        | 'EXDEV'
        | 'UNKNOWN'
        | 'EOF'
        | 'ENXIO'
        | 'EMLINK'
        | 'EHOSTDOWN'
        | 'EREMOTEIO'
        | 'ENOTTY'
        | 'EFTYPE'
        | 'EILSEQ'
        | 'ESOCKTNOSUPPORT'
        | 'ENODATA'
        | 'EUNATCH'
        | 'ENOEXEC'

    export interface SysErr<K extends SysErrKey = SysErrKey> {
        readonly errno: number
        readonly key: K
        readonly msg: string
    }

    export type SysErrMap =
        & { readonly [key: number]: SysErr }
        & { readonly [key in SysErrKey]: SysErr<key> }

    export type MimeType =
        | 'application/font-woff'
        | 'application/font-woff2'
        | 'application/javascript'
        | 'application/json'
        | 'application/octet-stream'
        | 'application/x-font-bdf'
        | 'application/x-font-otf'
        | 'application/x-font-pcf'
        | 'application/x-font-snf'
        | 'application/x-font-ttf'
        | 'application/x-www-form-urlencoded'
        | 'application/zip'
        | 'image/gif'
        | 'image/jpeg'
        | 'image/png'
        | 'image/svg+xml'
        | 'image/webp'
        | 'image/x-icon'
        | 'multipart/form-data'
        | 'text/css'
        | 'text/csv'
        | 'text/event-stream'
        | 'text/html'
        | 'text/plain'
        | 'text/x-markdown'
        | 'text/xml'

    export type Mime = Record<string, string> & {
        readonly 'application/font-woff': 'application/font-woff'
        readonly 'application/font-woff2': 'application/font-woff2'
        readonly 'application/javascript': 'application/javascript'
        readonly 'application/json': 'application/json'
        readonly 'application/octet-stream': 'application/octet-stream'
        readonly 'application/x-font-bdf': 'application/x-font-bdf'
        readonly 'application/x-font-otf': 'application/x-font-otf'
        readonly 'application/x-font-pcf': 'application/x-font-pcf'
        readonly 'application/x-font-snf': 'application/x-font-snf'
        readonly 'application/x-font-ttf': 'application/x-font-ttf'
        readonly 'application/x-www-form-urlencoded': 'application/x-www-form-urlencoded'
        readonly 'application/zip': 'application/zip'
        readonly bdf: 'application/x-font-bdf'
        readonly bin: 'application/octet-stream'
        readonly buffer: 'application/octet-stream'
        readonly css: 'text/css'
        readonly csv: 'text/csv'
        readonly dmg: 'application/octet-stream'
        readonly form: 'multipart/form-data'
        readonly gif: 'image/gif'
        readonly html: 'text/html'
        readonly ico: 'image/x-icon'
        readonly 'image/gif': 'image/gif'
        readonly 'image/jpeg': 'image/jpeg'
        readonly 'image/png': 'image/png'
        readonly 'image/svg+xml': 'image/svg+xml'
        readonly 'image/webp': 'image/webp'
        readonly 'image/x-icon': 'image/x-icon'
        readonly img: 'application/octet-stream'
        readonly iso: 'application/octet-stream'
        readonly jpeg: 'image/jpeg'
        readonly jpg: 'image/jpeg'
        readonly js: 'application/javascript'
        readonly json: 'application/json'
        readonly map: 'application/json'
        readonly md: 'text/x-markdown'
        readonly mjs: 'application/javascript'
        readonly multipart: 'multipart/form-data'
        readonly 'multipart/form-data': 'multipart/form-data'
        readonly otf: 'application/x-font-otf'
        readonly pcf: 'application/x-font-pcf'
        readonly png: 'image/png'
        readonly query: 'application/x-www-form-urlencoded'
        readonly snf: 'application/x-font-snf'
        readonly sse: 'text/event-stream'
        readonly svg: 'image/svg+xml'
        readonly svgz: 'image/svg+xml'
        readonly tar: 'application/zip'
        readonly text: 'text/plain'
        readonly 'text/css': 'text/css'
        readonly 'text/csv': 'text/csv'
        readonly 'text/event-stream': 'text/event-stream'
        readonly 'text/html': 'text/html'
        readonly 'text/plain': 'text/plain'
        readonly 'text/x-markdown': 'text/x-markdown'
        readonly 'text/xml': 'text/xml'
        readonly ttc: 'application/x-font-ttf'
        readonly ttf: 'application/x-font-ttf'
        readonly txt: 'text/plain'
        readonly url: 'application/x-www-form-urlencoded'
        readonly webp: 'image/webp'
        readonly woff: 'application/font-woff'
        readonly woff2: 'application/font-woff2'
        readonly xml: 'text/xml'
        readonly zip: 'application/zip'
    }

    export const METHOD: MethodList
    export const HEADER: Header
    export const SYSERR: SysErrMap
    export const STATUS: Status
    export const STATUS_ERR: StatusErr
    export const MIME: Mime
}
