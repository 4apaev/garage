// @ts-check

import { EventEmitter   } from 'node:events'
import { HEADER, STATUS } from '../util/constants.js'

import O from '../util/use.js'
import Qurl from '../util/qurl.js'
import Fail from '../util/fail.js'
import dump from 'util/dump.js'
import * as Mim from '../util/mime.js'

const IT = Symbol.iterator
const TOS = Symbol.toStringTag
const INS = Symbol.for('nodejs.util.inspect.custom')

/**
 * @implements {IRequest}
 */
export default class Req extends EventEmitter {

    params = O.o

    static keys = `
        method path
        params query
        body   size
        type   date
        auth   cookie`.match(/\w+/g)

    /**
     * @param { TRequest } rq
     */
    constructor(rq) {
        super()
        this.rq = rq
        this.URL = new Qurl(rq.url, 'file:')
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

    get size()   { return this.length }

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

    async read() {

        /** @type {Buffer[]} */
        const body = []

        for await (const bff of this.rq)
            body.push(bff)

        this.body = Buffer.concat(body)

        if (Mim.is('json', this.rq.headers)) {
            try {
                this.body = JSON.parse(
                    this.body.toString('utf8'))
            }
            catch (e) {
                console.error(
                    this.error = Fail.of('invalid payload', {
                        cause: STATUS.BAD.REQUEST,
                    }),
                )
            }
        }
    }

    get [ TOS ]() { return 'Req' }
    *   [ IT  ]() {
        for (let k of Req.keys)
            yield [ k, this[ k ] ]
    }

    /**
     * @param  { number } depth
     * @param  { import('node:util').InspectOptionsStylized } opts
     */
    [ INS ](depth, opts) {
        const ctx = O.from(Req.keys.map(k => this[ k ]))
        const inner = dump(ctx).replace(/\n/g, `\n     `)
        return `${ opts.stylize(this[ TOS ], 'special') }< ${ inner } >`
    }

}

/** @typedef { import('core.js').IRequest } IRequest */
/** @typedef { import('core.js').TRequest } TRequest */
