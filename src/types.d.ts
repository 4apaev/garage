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

declare module 'garage/mw/ws' {
    import type { IncomingMessage } from 'node:http'
    import type { Duplex } from 'node:stream'

    /** the fixed rfc 6455 handshake guid, identical on every websocket server */
    export const MAGIC: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'

    /** frame opcodes: 0x0-0x7 data, 0x8-0xf control */
    export const OP: {
        cont : 0x0
        text : 0x1
        bin  : 0x2
        close: 0x8
        ping : 0x9
        pong : 0xA
    }

    /** base64(sha1(key + MAGIC)) - the Sec-WebSocket-Accept value for a client key */
    export function acceptKey(key: string): string

    export interface FrameOptions {
        /** one of OP.* - default OP.text */
        opcode?: number
        /** true = act as a client: set the MASK bit, XOR the payload */
        mask?: boolean
    }

    /** one complete wire frame, FIN always set (no fragmentation) */
    export function encodeFrame(payload: Buffer | string, opt?: FrameOptions): Buffer

    /** a parsed frame - payload already unmasked */
    export interface Frame {
        fin: boolean
        opcode: number
        masked: boolean
        payload: Buffer
        /** total bytes this frame took on the wire - header + key + payload */
        size: number
    }

    export interface FrameParser {
        /** feed a tcp chunk; onFrame fires once per completed frame */
        push(chunk: Buffer): void
    }

    export function createFrameParser(onFrame: (frame: Frame) => unknown): FrameParser

    export interface WssOptions<Meta = unknown> {
        /** returns per-connection metadata, or throws/rejects to send a plain 401 before the 101 */
        authenticate?(rq: IncomingMessage): Meta | Promise<Meta>
        /** keepalive interval in ms - default 30000 */
        ping?: number
    }

    export interface Wss<Meta = unknown> {
        /** wire to `server.on('upgrade')` - answers 101 or a plain http refusal */
        handleUpgrade(rq: IncomingMessage, socket: Duplex): void
        /** guarded raw write of an already-encoded frame (see encodeFrame) */
        send(socket: Duplex, frame: Buffer): void
        /** iterate live connections with their authenticate() metadata */
        each(fn: (meta: Meta, socket: Duplex) => void): void
        stats(): { sockets: number }
        /** close-frame every socket (1001), stop the heartbeat */
        close(): void
    }

    export default function createWss<Meta = unknown>(opt?: WssOptions<Meta>): Wss<Meta>
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
        constructor(msg: string, cause?: unknown, start?: Function)
        constructor(code: number, msg?: string, cause?: unknown, start?: Function)

        static is(x: unknown): x is Fail
        static from(e: unknown, code?: number): Fail

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
    export type Method =     | 'ACL'
        | 'BASELINE-CONTROL' | 'OPTIONS'
        | 'BIND'             | 'ORDERPATCH'
        | 'CHECKIN'          | 'PATCH'
        | 'CHECKOUT'         | 'POST'
        | 'CONNECT'          | 'PRI'
        | 'COPY'             | 'PROPFIND'
        | 'DELETE'           | 'PROPPATCH'
        | 'GET'              | 'PUT'
        | 'HEAD'             | 'REBIND'
        | 'LABEL'            | 'REPORT'
        | 'LINK'             | 'SEARCH'
        | 'LOCK'             | 'TRACE'
        | 'MERGE'            | 'UNBIND'
        | 'MKACTIVITY'       | 'UNCHECKOUT'
        | 'MKCALENDAR'       | 'UNLINK'
        | 'MKCOL'            | 'UNLOCK'
        | 'MKREDIRECTREF'    | 'UPDATE'
        | 'MKWORKSPACE'      | 'UPDATEREDIRECTREF'
        | 'MOVE'             | 'VERSION-CONTROL'

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

    export type StatusErr = Pick<Status, ErrorStatusCode>

    export interface Status {
        readonly [key: number]: string
        readonly 100: 'continue'
        readonly 101: 'switching protocols'
        readonly 102: 'processing'
        readonly 103: 'early hints'
        readonly 200: 'ok'
        readonly 201: 'created'
        readonly 202: 'accepted'
        readonly 203: 'non authoritative information'
        readonly 204: 'no content'
        readonly 205: 'reset content'
        readonly 206: 'partial content'
        readonly 207: 'multi status'
        readonly 208: 'already reported'
        readonly 226: 'im used'
        readonly 300: 'multiple choices'
        readonly 301: 'moved permanently'
        readonly 302: 'found'
        readonly 303: 'see other'
        readonly 304: 'not modified'
        readonly 305: 'use proxy'
        readonly 307: 'temporary redirect'
        readonly 308: 'permanent redirect'
        readonly 400: 'bad request'
        readonly 401: 'unauthorized'
        readonly 402: 'payment required'
        readonly 403: 'forbidden'
        readonly 404: 'not found'
        readonly 405: 'method not allowed'
        readonly 406: 'not acceptable'
        readonly 407: 'proxy authentication required'
        readonly 408: 'request timeout'
        readonly 409: 'conflict'
        readonly 410: 'gone'
        readonly 411: 'length required'
        readonly 412: 'precondition failed'
        readonly 413: 'payload too large'
        readonly 414: 'uri too long'
        readonly 415: 'unsupported media type'
        readonly 416: 'range not satisfiable'
        readonly 417: 'expectation failed'
        readonly 418: 'teapot'
        readonly 421: 'misdirected request'
        readonly 422: 'unprocessable entity'
        readonly 423: 'locked'
        readonly 424: 'failed dependency'
        readonly 425: 'too early'
        readonly 426: 'upgrade required'
        readonly 428: 'precondition required'
        readonly 429: 'too many requests'
        readonly 431: 'request header fields too large'
        readonly 451: 'unavailable for legal reasons'
        readonly 500: 'internal server error'
        readonly 501: 'not implemented'
        readonly 502: 'bad gateway'
        readonly 503: 'service unavailable'
        readonly 504: 'gateway timeout'
        readonly 505: 'http version not supported'
        readonly 506: 'variant also negotiates'
        readonly 507: 'insufficient storage'
        readonly 508: 'loop detected'
        readonly 509: 'bandwidth limit exceeded'
        readonly 510: 'not extended'
        readonly 511: 'network authentication required'
    }

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
    export const STATUS: Status
    export const STATUS_ERR: StatusErr
    export const MIME: Mime
}
