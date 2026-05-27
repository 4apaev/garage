import Fs   from 'node:fs/promises'
import Qs   from 'node:querystring'
import Http from 'node:http'

import { Readable     } from 'node:stream'
import { EventEmitter } from 'node:events'
import { MIME, fromPath } from './mime.js'
import { Is, Fail, each } from './util.js'
import compose from './compose.js'
import use     from './use.js'

export class Router extends EventEmitter {
    /** @type {import('./types.js').MWare} */
    middleware
    mware = []
    options = {
        cwd : process.cwd(),
        pid : process.pid,
        port: process.env.APP_PORT,
        name: process.env.APP_NAME,
    }

    constructor(opt) {
        super()
        opt && Object.assign(this.options, opt)

        if (opt?.onerror)
            this.onerror = opt.onerror.bind(this)
    }

    use() {
        this.server
            && Fail.raise(500, 'router already initialized')

        this.middleware = void 0
        this.mware.push(use.apply(this, arguments))
        return this
    }

    onerror = (e, rq, rs, app) => {
        app.listenerCount('error')
            && app.emit('error', e, rq, rs)

        if (rs.headersSent)
            return

        rs.status = e.code
        rs.type = MIME.txt
        return rs.end(e.message)
    }

    request = async (rq, rs) => {
        try {
            let r = await this.middleware(rq, rs)
            return r
        }
        catch (e) {
            return this.onerror(Fail.from(e), rq, rs, this)
        }
    }

    init() {
        this.middleware = compose(this.mware).bind(this)
        this.server ??= create(this.request)
        return this.server
    }

    listen(port = this.options.port) {
        this.server ??= this.init()
        this.server.listen(port, () => {
            console.table(this.options)
        })
    }

    get(...a)   { return this.use('GET'    , ...a) }
    put(...a)   { return this.use('PUT'    , ...a) }
    post(...a)  { return this.use('POST'   , ...a) }
    del(...a)   { return this.use('DELETE' , ...a) }
    patch(...a) { return this.use('PATCH'  , ...a) }

    static of() {
        return Reflect.construct(this, arguments)
    }

    static create(listener) {
        return Http.createServer({
            IncomingMessage: Req,
            ServerResponse : Res,
        }, listener)
    }
}

const µrl = Symbol('µrl')
const µqs = Symbol('µqs')

export class Req extends Http.IncomingMessage {
    params = Object.create(null)

    get URL()   { return this[ µrl ] ??= new URL(this.url, 'file:') }
    get query() { return this[ µqs ] ??= Qs.parse(this.URL.search.replace(/^\?/, ''))  }
    get path()  { return this.URL.pathname }

    get type() { return this.get('content-type') ?? '' }
    get size() { return this.get('content-length') | 0 }

    has(k) { return k.toLowerCase() in this.headers }
    get(k) { return this.headers[ k.toLowerCase() ] ?? '' }

    async reader() {
        let body = []
        for await (const chunk of this)
            body.push(Buffer.from(chunk))

        body = Buffer.concat(body)
        if (this.type.includes('json')) {
            try {
                this.body = body.length
                    ? JSON.parse(body.toString('utf8'))
                    : void 0
            }
            catch (e) {
                this.error = Fail.from(e, 400)
            }
        }
        else if (this.type.includes('text/')) {
            this.body = body.toString('utf8')
        }
        else {
            this.body = body
        }
    }
}

export class Res extends Http.ServerResponse {
    get rq() { return this.req }

    get status()  { return this.statusCode }
    set status(x) {        this.statusCode = x }

    get size()   { return this.get('content-length') | 0 }
    set size(x)  {        this.set('content-length', x) }

    get type()   { return this.get('content-type') }
    set type(x)  {        this.set('content-type', MIME[ x ] ?? x) }

    has(k)       { return this.hasHeader(k)       }
    get(k)       { return this.getHeader(k) ?? '' }
    rm(k)        { return this.removeHeader(k)    }

    set(k, v)    { return Is.x(k) ? each(k, this.setHeader   , this) : this.setHeader(k, v) }
    append(k, v) { return Is.x(k) ? each(k, this.appendHeader, this) : this.appendHeader(k, v) }

    json(code, data) { return this.send(code, JSON.stringify(data), this.type = 'json') }
    send(code, data) { return this.resolve(this.body = data, this.status = code) }

    async file(path, fd) {
        try {
            fd = await Fs.open(path)
            const stat = await fd.stat()

            this.status = 200
            this.size = stat.size
            this.type = fromPath(path, MIME.bin)
            this.body = fd.createReadStream({ autoClose: false })
                .pipe(this)

            await new Promise((ok, no) => this.once('error', no).once('finish', ok).once('close', ok))
            return this
        }
        catch (e) {
            this.status = 404
            this.error = Fail.from(e, 404)
            return this.end()
        }
        finally {
            await fd?.close()
        }
    }

    resolve(data = this.body) {
        if (data == null || this.status === 204) {
            this.size = 0
            return this.end()
        }
        if (Buffer.isBuffer(data)) {
            this.size ||= Buffer.byteLength(data)
            data = Readable.from(data)
        }
        if (Is(Readable, data)) {
            this.type ||= MIME.bin
            data.pipe(this)
            return this
        }
        if (Is.x(data))  {
            data = JSON.stringify(data)
            this.type ||= MIME.json
            this.size   = Buffer.byteLength(data)
        }
        else if (Is.s(data)) {
            this.type ||= MIME.txt
            this.size ||= Buffer.byteLength(data)
        }
        this.end(data)
        return this
    }
}

export default Router
export const { create } = Router
