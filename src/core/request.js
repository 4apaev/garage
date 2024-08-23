// @ts-check

import { EventEmitter   } from 'node:events'
import { HEADER, STATUS } from '../util/constants.js'

import O from '../util/use.js'
import Qurl from '../util/qurl.js'
import Fail from '../util/fail.js'
import * as Mim from '../util/mime.js'

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
        this.URL = new Qurl(rq.url, 'file:')
    }

    // has(k) {
    //     throw new Error('Method not implemented.')
    // }
    // get(k) {
    //     throw new Error('Method not implemented.')
    // }

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
        yield [ 'path',   this.path   ]
        yield [ 'query',  this.query  ]
        yield [ 'type',   this.type   ]
        yield [ 'size',   this.size   ]
    }

    // [ Symbol.for('nodejs.util.promisify.custom') ]() {}

    /**
     * @param  { number } depth
     * @param  { import('node:util').InspectOptionsStylized } opts
     * @param  { typeof import('node:util').inspect } inspect
     */
    [ Symbol.for('nodejs.util.inspect.custom') ](depth, opts, inspect) {
        const inner = inspect({
            method: this.method,
            path: this.path,
            query: this.query,
            type: this.type,
            size: this.size,
        }, opts).replace(/\n/g, `\n     `) // 5 space padding because that's the size of "Req< "
        return `${ opts.stylize('Req', 'special') }< ${ inner } >`
    }

    async reader() {
        let body = []

        for await (const chunk of this.rq)
            body.push(chunk)

        this.body = Buffer.concat(body)

        if (Mim.is('json', this.rq.headers)) {
            try {
                this.body = JSON.parse(this.body)
            }
            catch (e) {
                e.code = e.staus = STATUS.BAD.REQUEST
                this.error = Fail.of('invalid payload', e)
            }
        }
    }

    async read() {
        this.body = ''
        this.rq.setEncoding('utf8')

        for await (const chunk of this.rq)
            this.body += chunk

        if (Mim.is('json', this.rq.headers)) {
            try {
                this.body = JSON.parse(this.body)
            }
            catch (e) {
                e.code = e.staus = STATUS.BAD.REQUEST
                this.error = Fail.of('invalid payload', e)
            }
        }
    }

    /**
     * @param  { string } k
     * @return { boolean }
     */
    has(k) {
        return k in this.rq.headers
    }

    /**
     * @param  { string } k
     * @return { number | string | string[] | undefined }
     */
    get(k) {
        return this.rq.headers[ k ]
    }

}

/** @typedef { import('core.js').IRequest } IRequest */
/** @typedef { import('core.js').TRequest } TRequest */

/*
cmplx
prmtv

u
i
f
s
S
b
B
o
t

U
I
F
n
N
a
A
O
T

u U
i I
f F
s S
n N
b B
a A
o O
t T

*/
