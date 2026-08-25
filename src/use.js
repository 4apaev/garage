// @ts-check
import { METHODS } from 'node:http'
import { URLPattern } from 'node:url'

import { Is, Fail } from './util.js'
import compose from './compose.js'

export default use
export function use() {
    /** @type { Validator[] } */ const validators = []
    /** @type { Set<string> } */ const methods = new Set
    /** @type { Set<string> } */ const pttrs = new Set
    /** @type { Set<MWare>  } */ const mware = new Set

    for (const a of arguments) {
        if (Is.f(a)) {
            mware.add(a)
            continue
        }
        Is.s(a) || Fail.raise(500, 'failed to create middleware. invalid argument type', a, use)

        METHODS.includes(a.toUpperCase())
            ? methods.add(a.toUpperCase())
            : pttrs.add(a)
    }

    mware.size || Fail.raise(500, 'failed to create middleware. missing handler', 'handler', use)

    const fx = mware.size > 1
        ? compose([ ...mware ])
        : [ ...mware ][ 0 ]

    methods.size && validators.push(createMethodValidator(methods))
    pttrs.size && validators.push(createPathValidator(uniqPttr(pttrs)))

    return wrapWithValidators(fx, validators)
}

/**
 * @param  { MWare      } mware
 * @param  { Validator[]} validators
 * @return { MWare      }
 */
function wrapWithValidators(mware, validators) {
    return function callNextMiddleware(rq, rs, next) {
        return validators.every(fx => fx(rq))
            ? mware.call(this, rq, rs, next)
            : next()
    }
}

/**
 * @param  { URLPattern[] } pttrs
 * @return { Validator    }
 */
function createPathValidator(pttrs) {
    return rq => pttrs.some(up => {
        const match = up.exec({ pathname: rq.path ?? rq.url })

        if (match) {
            for (const [ k, v ] of Object.entries(match.pathname.groups))
                rq.params[ k ] = decodeURIComponent(v)
            return true
        }
        return false
    })
}

/**
 * @param  { Set<string> } methods
 * @return { Validator   }
 */
function createMethodValidator(methods) {
    return rq => methods.has(rq.method)
}

/**
 * @param  { Set<string>  } pttrs
 * @return { URLPattern[] }
 */
function uniqPttr(pttrs) {
    return Array.from(pttrs, p => new URLPattern({ pathname: p }))
}

/**
 * @typedef { import('garage').Req } Req
 * @typedef { import('garage').Res } Res
 * @typedef { import('garage').Next } Next
 * @typedef { import('garage').Validator } Validator
 * @typedef { import('garage').MWare } MWare
 */
