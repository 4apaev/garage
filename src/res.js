import Fs   from 'node:fs/promises'
import Http from 'node:http'

import { Readable       } from 'node:stream'
import { pipeline       } from 'node:stream/promises'
import { Is, Fail, each } from './util.js'
import * as Mim           from './mime.js'

export default class Res extends Http.ServerResponse {
    get rq() { return this.req }

    get status()  { return this.statusCode }
    set status(x) {        this.statusCode = x }

    get size()   { return this.get('content-length') | 0 }
    set size(x)  {        this.set('content-length', x) }

    get type()   { return this.get('content-type') }
    set type(x)  {        this.set('content-type', Mim.get(x, x)) }

    has(k)       { return this.hasHeader(k)       }
    get(k)       { return this.getHeader(k) ?? '' }
    rm(k)        { return this.removeHeader(k)    }

    set(k, v)    { return Is.x(k) ? each(k, this.setHeader   , this) : this.setHeader(k, v) }
    append(k, v) { return Is.x(k) ? each(k, this.appendHeader, this) : this.appendHeader(k, v) }

    json(code, data) {
        this.type = 'json'
        return this.send(code, JSON.stringify(data))
    }

    send(code, data) {
        this.status = code
        this.body = data
        return this.resolve(data)
    }

    async file(path, fd) {
        try {
            fd = await Fs.open(path)
            const stat = await fd.stat()
            stat.isFile() || Fail.raise(404, 'not a file', path)

            this.status = 200
            this.size = stat.size
            this.type = Mim.fromPath(path, Mim.MIME.bin)
            this.body = fd.createReadStream({ autoClose: false })

            await pipeline(this.body, this)
            return this
        }
        catch (e) {
            this.error = new Fail(404, e.message, e, this.file)

            // too late for a 404, the status line is gone
            if (this.headersSent)
                return this.destroy()

            this.status = 404
            return this.end()
        }
        finally {
            await fd?.close()
        }
    }

    resolve(data = this.body) {
        if (this.status === 204) {
            this.rm('content-length')    // rfc 9110: no length on 204
            return this.end()
        }
        if (data == null) {
            this.size = 0
            return this.end()
        }

        if (Buffer.isBuffer(data)) {
            this.size ||= Buffer.byteLength(data)
            data = Readable.from(data)
        }
        if (Is(Readable, data)) {
            this.type ||= Mim.MIME.bin
            data.pipe(this)
            return this
        }

        if (Is.x(data))  {
            data = JSON.stringify(data)
            this.type ||= Mim.MIME.json
            this.size   = Buffer.byteLength(data)
        }
        else if (Is.s(data)) {
            this.type ||= Mim.MIME.txt
            this.size ||= Buffer.byteLength(data)
        }

        this.end(data)
        return this
    }
}
