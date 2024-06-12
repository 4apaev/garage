// @ts-check

import Util from 'node:util'
import { EventEmitter } from 'node:events'
import { HEADER } from '../constants.js'
import QURL from '../util/qurl.js'
import Fail from '../util/fail.js'
import O from '../util/use.js'

const INSPECT = Symbol.for('nodejs.util.inspect.custom')
const PROMISIFY = Symbol.for('nodejs.util.promisify.custom')
const TOS = Symbol.toStringTag
const AIT = Symbol.asyncIterator
const  IT = Symbol.iterator

/** @typedef { import('core.js').IRequest } IRequest */
/** @typedef { import('core.js').TRequest } TRequest */

/**
 * @implements {IRequest}
 */
export default class Req extends EventEmitter {

    params = O.o

    /**
     * @param { TRequest } rq
     */
    constructor(rq) {
        super()
        this.rq = rq
        this.URL = new QURL(rq.url, 'file:')
    }

    get url()    { return this.rq.url    }
    get method() { return this.rq.method }
    get query()  { return this.URL.query }
    get path()   { return this.URL.path  }

    get cookie() { return this.get(HEADER.SET.COOKIE) }
    get length() { return this.get(HEADER.CONTENT.LENGTH)  }

    get type()   { return this.get(HEADER.CONTENT.TYPE) }
    get auth()   { return this.get(HEADER.AUTHORIZATION)  } // @ts-ignore
    get date()   { return new Date(this.get(HEADER.DATE)) }

    get size() { return this.length }

    get    [ Symbol.toStringTag   ]() { return 'req' }
    async *[ Symbol.asyncIterator ]() { yield* this }
    *      [ Symbol.iterator ]() {
        yield [ 'method', this.method ]
        yield [ 'path', this.path ]
        yield [ 'query', this.query ]
        yield [ 'type', this.type ]
        yield [ 'size', this.size ]
    }

    [ Util.promisify.custom ]() {

    }

    /**
     * @param  { number } depth
     * @param  { Util.InspectOptionsStylized } opts
     * @param  { typeof Util.inspect } inspect
     */
    [ Util.inspect.custom ](depth, opts, inspect) {

        const req = {
            method: this.method,
            path: this.path,
            query: this.query,
            type: this.type,
            size: this.size,
        }

        const inner = inspect(req, opts).replace(/\n/g, `\n     `) // 5 space padding because that's the size of "Req< "
        return `${ opts.stylize('Req', 'special') }< ${ inner } >`

        // return inspect({
        //     method : this.method,
        //     url    : this.url,
        //     query  : this.query,
        //     path   : this.path,
        //     size   : this.size,
        //     type   : this.type,
        // }, {
        //     colors: true,
        //     depth
        // })
    }

    async read() {

        let body = ''
        this.rq.setEncoding('utf8')

        for await (const chunk of this.rq)
            body += chunk

        let type = this.type ?? ''

        if (type.includes('application/json')) {
            try {
                this.body = JSON.parse(body)
            }
            catch (e) {
                e.code = e.staus = 400
                O.of
                this.error = Fail.of('invalid payload', e)
            }
        }
        else {
            this.body = body
        }
    }

    /**
     * @param  { string } k
     * @return { boolean }
     */
    has(k) { return k in this.rq.headers }

    /**
     * @param  { string } k
     * @return { number | string | string[] | undefined }
     */
    get(k) { return this.rq.headers[ k ] }

}
