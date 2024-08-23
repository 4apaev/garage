// @ts-check
import compose from './compose.js'
import path2regex from '../util/path2regex.js'

import { METHOD } from '../util/constants.js'
import Fail from '../util/fail.js'
import Is from '../util/is.js'
import O from '../util/use.js'

export default function use() {
    /** @type { RegExp[] }    */ const paths = []
    /** @type { string[] }    */ const methods = []
    /** @type { Handler[] }   */ const handlers = []
    /** @type { Validator[] } */ const validators = []

    for (const a of arguments) {
        if (Is.s(a))
            a in METHOD ? methods.push(a.toUpperCase()) : paths.push(path2regex(a))

        else if (Is.f(a))
            handlers.push(a)

        else if (Is(RegExp, a))
            paths.push(a)

        else
            console.error('🔴 unknown type "%s"', Is.T(a))
    }

    handlers.length || Fail.raise('missing handler', arguments)

    const handler = /*          */ handlers.length > 1 ? compose(handlers)    : handlers[ 0 ]
    paths.length   && validators.push(paths.length > 1 ? validatePaths(paths) : validatePath(paths[ 0 ]))
    methods.length && validators.push(validateMethods(methods))

    return routeRequest(handler, validators)
}

/** @type { UseMethod } */ use.get  = (...a) => use(METHOD.GET, ...a)
/** @type { UseMethod } */ use.post = (...a) => use(METHOD.POST, ...a)
/** @type { UseMethod } */ use.put  = (...a) => use(METHOD.PUT, ...a)
/** @type { UseMethod } */ use.del  = (...a) => use(METHOD.DELETE, ...a)

/**
 * @param  { Handler } handler
 * @param  { Validator[] } validators
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
        rq.params = match?.groups ?? O.o
        return match != null
    }
}

/**
 * @param  { RegExp[] } paths
 * @return { Validator }
 */
function validatePaths(paths) {
    return rq => {
        rq.params ??= O.o

        let ok
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
    rq.params ??= O.o

    const match = rq.url.match(rx)
    if (match == null)
        return false

    O.assign(rq.params, match.groups)
    return true
}

/**
 * @param  { string[] } methods
 * @return { Validator }
 */
function validateMethods(methods) {
    return rq => methods.includes(rq.method)

}

/** @typedef { import('core.js').IRequest   } Req       */
/** @typedef { import('core.js').IResponse  } Res       */
/** @typedef { import('core.js').Handler    } Handler   */
/** @typedef { import('core.js').Validator  } Validator */
/** @typedef { (method: string, path: string | RegExp, handler: Handler) => Handler  } UseMethod */
