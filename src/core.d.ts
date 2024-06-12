import { EventEmitter } from 'node:events'

import {
    ServerResponse as TResponse,
    IncomingMessage as TRequest,
} from 'node:http'

import QURL from 'util/qurl.js'

export {
    TResponse,
    TRequest,
}

// export type TVal = number | string | string[] | undefined
// export type TBody = string | Buffer | NodeJS.ArrayBufferView | ArrayBuffer

export type Handler = (rq: IRequest, rs: IResponse, next?: () => void) => void
export type Validator = (rq: IRequest) => boolean

export interface IRequest extends EventEmitter {
    rq: TRequest

    URL: QURL
    url: string
    path: string
    method: string
    params: Record<string, string>
    query: Record<string, any>
    body?: any

    cookie: number | string | string[] | undefined
    length: number | string | string[] | undefined

    size: number | string | string[] | undefined
    type: number | string | string[] | undefined
    auth: number | string | string[] | undefined
    date: Date


    has(k: string): boolean
    get(k: string): number | string | string[] | undefined
}

export interface IResponse extends EventEmitter {
    rs: TResponse

    body?: any
    code: number
    status: number


    auth: number | string | string[] | undefined
    date: number | string | string[] | undefined
    etag: number | string | string[] | undefined
    type: number | string | string[] | undefined
    size: number | string | string[] | undefined
    length: number | string | string[] | undefined
    cookie: number | string | string[] | undefined


    has(k: string): boolean
    del(k: string): boolean
    get(k: string): number | string | string[] | undefined
    set(k: string, v: number | string | string[] | undefined): IResponse
    append(k: string, v: number | string | string[] | undefined): IResponse

    end(x?: any): IResponse

    send(body?: any): IResponse
    send(status: number, body?: any): IResponse

    json(status: number, body?: any): IResponse
    file(path: string | URL): Promise<IResponse>
}

