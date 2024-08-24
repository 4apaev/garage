// @ts-check

import { Stream         } from 'node:stream'
import { EventEmitter   } from 'node:events'
import Fs                 from 'node:fs'

import Is                 from '../util/is.js'
import { alias          } from '../util/use.js'
import { MIME, fromPath } from '../util/mime.js'
import { HEADER, STATUS, STATUS_CODES } from '../util/constants.js'

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

    get status()  { return this.rs.statusCode }
    set status(x) {        this.rs.statusCode = x }

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
     * @param  { string } k
     * @return { boolean }
     */
    rm(k) { return this.has(k) ? (this.rs.removeHeader(k), true) : false }

    /**
     * @param  { any } x
     * @return { IResponse }
     */
    end(x) {
        if (x != null && this.#written) /* data was written directly to `this.rs` */ {
            this.rs.end(x)
            return this
        }

        x ??= this.body

        if (x == null
            || this.status === STATUS.NO.CONTENT
            || this.status === STATUS.NOT.MODIFIED
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

        if (Is.o(x) && !Is.B(x)) {
            this.type ??= MIME.json
            x = JSON.stringify(x)
        }

        this.size ??= Buffer.byteLength(x)
        this.rs.end(x)
        return this
    }

    /**
     * @param  { number } status
     * @param  { any } [body]
     * @return { IResponse }
     */
    send(status, body) {
        this.status = status
        return this.end(this.body = body)
    }

    /**
     * @param { number } status
     * @param { any } body
     */
    json(status, body) {
        this.type = MIME.json
        return this.send(status, body)
    }

    /**
     * @param  { string | URL } path
     * @return { Promise<IResponse> }
     */
    file(path) {
        return new Promise(ok => {
            Fs.stat(path, (e, s) => {
                if (e) {
                    console.error(STATUS.NOT.FOUND, STATUS_CODES[ STATUS.NOT.FOUND ], path)

                    this.status = STATUS.NOT.FOUND
                    this.size = 0
                    this.rs.end()
                }
                else {
                    this.status = STATUS.OK
                    this.size = s.size
                    this.type = fromPath(path)
                    this.set(HEADER.LAST.MODIFIED, s.mtimeMs)
                    Fs.createReadStream(path).pipe(this.rs)
                }
                ok(this)
            })
        })
    }
}

alias(Res.prototype, 'status code')
alias(Res.prototype, 'rm remove delete del')

/** @typedef { import('core.js').IResponse } IResponse */
/** @typedef { import('core.js').TResponse } TResponse */
