// @ts-check

import { URLSearchParams } from 'url'

/**
 * @typedef { URLSearchParams | string | Record<string, any> | Iterable<[string, any]> | Array<[string, any]> } QParams
 */

/**
 * @class
 * @extends URL
 */
export default class QURL extends URL {

    /** @type  { string } */
    get path() { return this.pathname }

    /** @param  { string } x */
    set path(x) {
        let [ p, ...s ] = x.split('?')
        this.pathname = p
        this.search = s.join('?')
    }

    /** @type { Record<string, any> } */
    get query()  {
        const q = Object.create(null)
        for (let [ k, v ] of this.searchParams) {
            q[ k ] = k in q
                ? [].concat(q[ k ], format(v))
                : format(v)
        }
        return q
    }

    /**
     * @param { QParams } x
     */
    set query(x) {
        let it = Array.isArray(x)
            ? x
            : toString.call(x) == '[object Object]'
                ? Object.entries(x)
                : new URLSearchParams(x)

        for (const [ k, v ] of it) {
            if (Array.isArray(v))
                v.forEach(y => this.searchParams.append(k, format(y)))
            else
                this.searchParams[ this.searchParams.has(k) ? 'append' : 'set' ](k, format(v))
        }
    }
}

/** @param { any } x */
function format(x) {
    const map = { true: true, false: false, null: undefined, undefined }
    return x in map ? map[ x ] : isNaN(+x) ? x : +x
}

/*

| URLSearchParams
| string
| Record<string, any>
| Iterable<[string, any]>
| Array<[string, any]>

*/
