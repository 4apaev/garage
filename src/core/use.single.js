// ts-check

import compose from './compose.js'
import path2regex from './path2regex.js'

const METHODS = new Set

export default function use() {

    /** @type {Handler[]}   */ const handlers = []
    /** @type {Validator[]} */ const validators = []

    for (const a of arguments) {
        /**/ if (typeof a == 'function') handlers.push(a)
        else if (typeof a == 'string') validators.push(isMethod(a) ? validateMethod(a) : validatePath(path2regex(a)))
        else if (a instanceof RegExp) validators.push(validatePath(a))
        else
            console.error('🔴 unknown type "%s"', toString.call(a))
    }

    if (handlers.length < 1)
        throw new Error('missing handler')

    return routeRequest(validators, compose(handlers))
}

///////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @param  { Validator[] } validators
 * @param  { Handler } handler
 * @return { Handler }
 */
function routeRequest(validators, handler) {
    return function callNextMiddleware(rq, rs, next) {
        const ok = validators.every(fx => fx(rq))
        return ok
            ? handler.call(this, rq, rs, next)
            : next()
    }
}

/**
 * @param { RegExp } rx
 * @return { Validator }
 */
function validatePath(rx) {
    return rq => {
        const match = rq.url.match(rx)
        rq.params = match?.groups
        return match != null
    }
}

/**
 * @param  { string } method
 * @return { Validator }
 */
function validateMethod(method) {
    method = method.toUpperCase()
    return rq => rq.method === method
}

/**
 * @param  { string } x
 * @return { boolean }
 */
function isMethod(x) {
    return METHODS.has(x.toUpperCase())
}

////////////////////////////////////////////////////////////////////////////////////////////////

METHODS.add('GET')
METHODS.add('PUT')
METHODS.add('POST')
METHODS.add('DELETE')
METHODS.add('PATCH')
METHODS.add('OPTIONS')
METHODS.add('HEAD')

/** @type { UseMethod } */ use.get = (...a) => use('GET', ...a)
/** @type { UseMethod } */ use.post = (...a) => use('POST', ...a)
/** @type { UseMethod } */ use.put = (...a) => use('PUT', ...a)
/** @type { UseMethod } */ use.del = (...a) => use('DELETE', ...a)

/////////////////////////////////////////////////////////////////////////////////////////////////

/** @typedef { import('core.js').Req       } Req       */
/** @typedef { import('core.js').Res       } Res       */
/** @typedef { import('core.js').Validator } Validator */
/** @typedef { import('core.js').Handler   } Handler   */
/** @typedef { (...a: any[]) => Handler } UseMethod           */
