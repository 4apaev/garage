import Fs   from 'node:fs/promises'
import Http from 'node:http'
import { Readable     } from 'node:stream'
import { EventEmitter } from 'node:events'
import { MIME, fromPath } from './mime.js'
import { Is, Fail, each } from './util.js'
import compose from './compose.js'
import use     from './use.js'

const µ = Symbol('µrl')

export class Router extends EventEmitter {
    handler
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
    }

    use() {
        this.mware.push(use.apply(this, arguments))
        this.handler = void 0
        return this
    }

    handle(rq, rs) {
        this.handler ??= compose(this.mware).bind(this)
        return this.handler(rq, rs)
    }

    init() {
        return this.server = create(this.handle.bind(this))
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

export class Req extends Http.IncomingMessage {
    params = Object.create(null)

    get URL() { return this[ µ ] ??= new URL(this.url, 'file:') }
    get path() { return this.URL.pathname }
    get query() { return Object.fromEntries(this.URL.searchParams) }

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
                this.error = new Fail(400, e.message, e)
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
            this.type = fromPath(path, MIME.txt)
            this.body = fd.createReadStream({ autoClose: false })
                .pipe(this)

            await new Promise((ok, no) => this.once('error', no).once('finish', ok).once('close', ok))
            return this
        }
        catch (e) {
            console.error(this.status = 404, path, this.error = new Fail(404, e.message, e))
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
            return data.pipe(this), this
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
        return this.end(data), this
    }
}

export default Router
export const { create } = Router
