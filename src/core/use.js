// @ts-check

import compose from './compose.js'
import path2regex from './path2regex.js'

const METHODS = new Set('GET,PUT,POST,DELETE,PATCH,OPTIONS,HEAD'.split(','))

/** @typedef { import('core.js').IRequest   } Req       */
/** @typedef { import('core.js').IResponse  } Res       */
/** @typedef { import('core.js').Handler   } Handler   */
/** @typedef { import('core.js').Validator } Validator */

export default function use() {
    /** @type { RegExp[] }    */ const paths = []
    /** @type { string[] }    */ const methods = []
    /** @type { Handler[] }   */ const handlers = []
    /** @type { Validator[] } */ const validators = []

    for (const a of arguments) {
        if (typeof a == 'function')
            handlers.push(a)

        else if (typeof a == 'string')
            isMethod(a) ? methods.push(a.toUpperCase()) : paths.push(path2regex(a))

        else if (a instanceof RegExp)
            paths.push(a)

        else
            console.error('🔴 unknown type "%s"', toString.call(a))
    }

    if (handlers.length < 1)
        throw new Error('missing handler')

    let handler = handlers.length > 1
        ? compose(handlers)
        : handlers[ 0 ]

    methods.length && validators.push(validateMethods(methods))
    paths.length && validators.push(paths.length === 1
        ? validatePath(paths[ 0 ])
        : validatePaths(paths))

    return routeRequest(handler, validators)
}

/**
 * @param { Handler } handler
 * @param { Validator[] } validators
 * @return { Handler }
 */
function routeRequest(handler, validators) {
    return function callNextMiddleware(rq, rs, next) {
        const ok = validators.every(fx => fx(rq))
        return ok
            ? handler.call(this, rq, rs, next)
            : next()
    }
}

/**
 * @param  { RegExp } rx
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
 * @param  { RegExp[] } paths
 * @return { Validator }
 */
function validatePaths(paths) {
    return rq => {
        let ok
        rq.params ??= Object.create(null)
        for (let rx of paths)
            ok ??= matchReqPath(rq, rx)
        return ok
    }
}

/**
 * @param  { Req } rq
 * @param  { RegExp } rx
 * @return { boolean }
 */
function matchReqPath(rq, rx) {
    const match = rq.url.match(rx)
    if (match == null)
        return false

    if (match.groups) {
        for (let [ k, v ] of Object.entries(match.groups)) {
            if (k in rq.params)
                console.warn('duplicated request parameter %s - old: %s, new: %s', k, rq.params[ k ], v)
            else
                rq.params[ k ] = v
        }
    }
    return true
}

/**
 * @param  { string[] } methods
 * @return { Validator }
 */
function validateMethods(methods) {
    return rq => methods.includes(rq.method)

}

/**
 * @param  { string } x
 * @return { boolean }
 */
function isMethod(x) {
    return METHODS.has(x.toUpperCase())
}
