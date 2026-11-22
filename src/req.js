import Qs   from 'node:querystring'
import Http from 'node:http'

import { O, Fail } from './util.js'
import * as Mim    from './mime.js'

const µrl = Symbol('µrl') // cache
const µqs = Symbol('µqs') // cache

export default class Req extends Http.IncomingMessage {
    static limit = 1 << 20 // max body bytes for reader(), Infinity turns it off

    params = O.o

    get URL()   { return this[ µrl ] ??= new URL(this.url, 'file:') }
    get query() { return this[ µqs ] ??= Qs.parse(this.URL.search.replace(/^\?/, ''))  }
    get path()  { return this.URL.pathname }

    get type() { return this.get('content-type') ?? '' }
    get size() { return +this.get('content-length') || 0 }

    has(k) { return k.toLowerCase() in this.headers }
    get(k) { return this.headers[ k.toLowerCase() ] ?? '' }

    async reader(limit = this.constructor.limit) {
        this.size > limit && Fail.raise(413, 'payload too large', this.size, this.reader)

        let body = [], n = 0
        for await (const chunk of this) {
            // content-length can lie, or be missing with chunked encoding
            n += chunk.length
            n > limit && Fail.raise(413, 'payload too large', n, this.reader)
            body.push(Buffer.from(chunk))
        }

        body = Buffer.concat(body)

        if (Mim.is('json', this.type)) {
            try {
                this.body = body.length
                    ? JSON.parse(body.toString('utf8'))
                    : void 0
            }
            catch (e) {
                Fail.raise(400, 'invalid json', e, this.reader)
            }
        }
        else if (Mim.is('txt', this.type)) {
            this.body = body.toString('utf8')
        }
        else {
            this.body = body
        }
    }
}
