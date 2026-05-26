import { Fail } from './util.js'

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
