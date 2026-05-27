import {
    IncomingMessage,
    Server,
    ServerResponse,
} from 'node:http'

import { EventEmitter } from 'node:events'
import { Readable     } from 'node:stream'

import type { MWare } from './types.js'
import type { Fail } from './util.js'

export interface RouterOptions {
    cwd? : string
    pid? : number
    port?: string | number
    name?: string
    onerror?: (this: Router, e: Fail, rq: Req, rs: Res, app: Router) => unknown
}

export default Router
export class Router extends EventEmitter {
    middleware?: MWare
    mware: MWare[]
    options: RouterOptions
    server?: Server

    constructor(opt?: RouterOptions)
    use(...args: Array<string | MWare>): this
    onerror(e: Fail, rq: Req, rs: Res, app: Router): unknown
    onrequest(rq: Req, rs: Res): Promise<unknown>
    init(): Server
    listen(port?: string | number): void
    get(...args: Array<string | MWare>): this
    put(...args: Array<string | MWare>): this
    post(...args: Array<string | MWare>): this
    del(...args: Array<string | MWare>): this
    patch(...args: Array<string | MWare>): this

    static of(opt?: RouterOptions): Router
    static create(listener?: (rq: Req, rs: Res) => unknown): Server
}

export const create: typeof Router.create

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
