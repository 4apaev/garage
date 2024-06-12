process.loadEnvFile()

import {
    STATUS_CODES,
    ServerResponse,
    IncomingMessage,
} from 'node:http'

import O from './util/use.js'
import QUrl from './util/qurl.js'

/**
 * @param { import('http').IncomingMessage } rq
 * @param { import('http').ServerResponse } rs
 */
export default function init(rq, rs) {
    rq.URL = new QUrl(rq.url, 'file:')
    rq.timestamp = Date.now()
}

O.use(ServerResponse.prototype, {
    get code()      { return this.statusCode },
    get status()    { return this.statusCode },

    get type()      { return this.get('content-type') },
    get length()    { return this.get('content-length') },
    get cookie()    { return this.get('cookie') },
    get date()      { return this.get('date') },
    get etag()      { return this.get('etag') },

    ////////////////////////////////////////////////////////////////////////////////////////

    set code(x)      { this.statusCode = x },
    set status(x)    { this.statusCode = x },

    set type(x)      { this.set('content-type', x) },
    set length(x)    { this.set('content-length', x) },
    set cookie(x)    { this.set('cookie', x) },
    set date(x)      { this.set('date', x) },
    set etag(x)      { this.set('etag', x) },

    ////////////////////////////////////////////////////////////////////////////////////////

    has(k) { return this.hasHeader(k) },
    get(k) { return this.getHeader(k) },

    set(k, v) {
        this.setHeader(k, v)
        return this
    },

    append(k, v) {
        this.appendHeader(k, v)
        return this
    },

    ////////////////////////////////////////////////////////////////////////////////////////

    send(code, body) {
        if (body == null)
            body = code, code = this.code || 200

        if (code in STATUS_CODES)
            this.code = code

        this.length = Buffer.byteLength(body)
        this.end(body)
        return this
    },

    json(code, body) {
        if (body == null)
            body = code, code = this.code || 200

        this.type = 'application/json'
        return this.send(code, JSON.stringify(body))
    },

    fail(code, msg) {
        return this.json(code, {
            error: true,
            message: msg ?? STATUS_CODES[ code ],
        })
    },
})

O(IncomingMessage.prototype, {
    get path()  { return this.URL.path },
    get query() { return this.URL.query },

    get type()      { return this.get('content-type') },
    get length()    { return this.get('content-length') },
    get auth()      { return this.get('authorization') },
    get accept()    { return this.get('accept') },
    get cookie()    { return this.get('cookie') },
    get date()      { return this.get('date') },
    get etag()      { return this.get('etag') },
    get vary()      { return this.get('vary') },

    has(k) { return k in this.headers },
    get(k) { return this.headers[ k ] ?? '' },
})
