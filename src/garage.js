import Http from 'node:http'
import { EventEmitter } from 'node:events'

import { MIME } from './mime.js'
import { Fail } from './util.js'

import compose  from './compose.js'
import use      from './use.js'

import Req      from './req.js'
import Res      from './res.js'

export default class Garage extends EventEmitter {
    /** @type {import('garage').MWare} */
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
        this.server && Fail.raise(500, 'garage already initialized')
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
        this.server && Fail.raise(500, 'garage already initialized')
        this.middleware = compose(this.mware).bind(this)
        return this.server = Garage.create(this.request)
    }

    listen(port = this.options.port) {
        this.server ??= this.init()
        this.server.listen(port, () => {
            console.table(this.options)
        })
        return this
    }

    [ Symbol.asyncDispose ]() {
        if (!this.server) return
        return new Promise(ok => {           // plain server.close() can hang on
            this.server.close(ok)            // idle keep-alive sockets, so drop
            this.server.closeAllConnections() // them too
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

export { Req, Res, Garage }
