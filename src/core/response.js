// @ts-check

import Fs               from 'node:fs'
import { Stream       } from 'node:stream'
import { STATUS_CODES } from 'node:http'
import { EventEmitter } from 'node:events'
import { MIME, HEADER } from '../constants.js'
import { fromPath     } from '../util/mime.js'
import Is               from '../util/is.js'

/**
 * @implements {IResponse}
 */
export default class Res extends EventEmitter {

    #written = false

    /**
     * @param { TResponse } rs
     */
    constructor(rs) {
        super()
        this.rs = rs
        this.rs.on('drain', () => {
            /* data was written directly to `this.rs` */
            this.#written = true
        })
    }

    get code()    { return this.status }
    get status()  { return this.rs.statusCode }
    set status(x) {        this.rs.statusCode = x }
    set code(x)   {        this.status = x }

    get auth()    { return this.get(HEADER.AUTHORIZATION) }
    get date()    { return this.get(HEADER.DATE) }
    get etag()    { return this.get(HEADER.ETAG) }
    get type()    { return this.get(HEADER.CONTENT.TYPE) }
    get size()    { return this.get(HEADER.CONTENT.LENGTH) }
    get length()  { return this.get(HEADER.CONTENT.LENGTH) }
    get cookie()  { return this.get(HEADER.SET.COOKIE) }

    set auth(x)   {        this.set(HEADER.AUTHORIZATION, x) }
    set date(x)   {        this.set(HEADER.DATE, x) }
    set etag(x)   {        this.set(HEADER.ETAG, x) }
    set type(x)   {        this.set(HEADER.CONTENT.TYPE, x) }
    set size(x)   {        this.set(HEADER.CONTENT.LENGTH, x) }
    set length(x) {        this.set(HEADER.CONTENT.LENGTH, x) }
    set cookie(x) {        this.set(HEADER.SET.COOKIE, x) }

    /**
     * @param  { string } k
     * @return { boolean }
     */
    has(k) { return this.rs.hasHeader(k) }

    /**
     * @param  { string } k
     * @return { boolean }
     */
    del(k) {
        if (this.has(k)) {
            this.rs.removeHeader(k)
            return true
        }
        return  false
    }

    /**
     * @param  { string } k
     * @return { number | string | string[] | undefined }
     */
    get(k) { return this.rs.getHeader(k) }

    /**
     * @param  { string } k
     * @param  { number | string | string[] } v
     * @return { IResponse }
     */
    set(k, v) {
        if (this.rs.headersSent)
            console.warn('cannot set `%s`, header already sent', k)
        else
            this.rs.setHeader(k, v)
        return this
    }

    /**
     * @param  { string } k
     * @param  { string | string[] } v
     * @return { IResponse }
     */
    append(k, v) {
        if (this.rs.headersSent)
            console.warn('cannot append `%s`, header already sent', k)
        else
            this.rs.appendHeader(k, v)
        return this
    }

    /**
     * @param  { any } x
     * @return { IResponse }
     */
    end(x) {
        if (x && this.#written) /* data was written directly to `this.rs` */ {
            this.rs.end(x)
            return this
        }

        x ??= this.body

        if (x == null
            || this.status === 204
            || this.status === 304
        ) {
            this.size = 0
            this.rs.end()
            return this
        }

        if (Is(Stream, x, 1)) {
            this.type ??= MIME.bin
            x.pipe(this.rs)
            return this
        }

        if (!Buffer.isBuffer(x)) {
            this.type ??= MIME.json
            x = JSON.stringify(x)
        }

        this.size ??= Buffer.byteLength(x)
        this.rs.end(x)
        return this
    }

    /**
     * @param  { number } [status=200]
     * @param  { any } [body]
     * @return { IResponse }
     */
    send(status, body) {
        if (Is.o(status))
            [ status, body ] = [ body, status ]

        if (status in STATUS_CODES)
            this.status = status
        else
            this.status ??= 200

        this.body = body
        return this.end()
    }

    /**
     * @param { number } [status=200]
     * @param { any } [body]
     */
    json(status, body) {
        if (Is.o(status))
            [ status, body ] = [ 200, status ]

        this.status = status
        this.type = MIME.json
        this.body = JSON.stringify(body)
        this.size = Buffer.byteLength(this.body)
        this.rs.end(this.body)
        return this
    }

    /**
     * @param  { string | URL } path
     * @return { Promise<IResponse> }
     */
    file(path) {
        return new Promise(ok => {
            Fs.stat(path, (e, s) => {
                if (e) {
                    this.status = 404
                    this.size = 0
                    this.rs.end()
                }
                else {
                    this.status = 200
                    this.size = s.size
                    this.type = fromPath(path)
                    this.set('last-modified', s.mtimeMs)
                    Fs.createReadStream(path).pipe(this.rs)
                }
                ok(this)
            })
        })
    }
}

/** @typedef { import('core.js').IResponse } IResponse */
/** @typedef { import('core.js').TResponse } TResponse */
