// @ts-check
import Fail from '../util/fail.js'
import { METHOD } from '../util/constants.js'
import compose from './compose.js'

export default function use() {
    /** @type { RegExp[] }    */ const paths = []
    /** @type { string[] }    */ const methods = []
    /** @type { Handler[] }   */ const handlers = []
    /** @type { Validator[] } */ const validators = []

    for (const a of arguments) {

        /**/ if (typeof a == 'string')  isPathOrMethod(a, paths, methods)
        else if (typeof a == 'function') handlers.push(a)
        else if (RegExp[ Symbol.hasInstance ](a)) paths.push(a)
        else
            console.error('🔴 unknown type "%s"', toString.call(a))
    }

    handlers.length || Fail.raise('missing handler')

    const handler = handlers.length > 1
        ? compose(handlers)
        : handlers[ 0 ]

    paths.length && validators.push(validatePaths(paths))
    methods.length && validators.push(validateMethods(methods))

    return routeRequest(handler, validators)
}

/** @type { UseMethod } */ use.get = (...a) => use(METHOD.GET, ...a)
/** @type { UseMethod } */ use.put = (...a) => use(METHOD.PUT, ...a)
/** @type { UseMethod } */ use.del = (...a) => use(METHOD.DELETE, ...a)
/** @type { UseMethod } */ use.post = (...a) => use(METHOD.POST, ...a)
/** @type { UseMethod } */ use.patch = (...a) => use(METHOD.PATCH, ...a)

/**
 * @param  { Handler } handler
 * @param  { Validator[] } validators
 * @return { Handler }
 */
function routeRequest(handler, validators) {
    return function callNextMiddleware(rq, rs, next) {
        const ok = validators.every(fx => fx(rq))
        if (ok)
            return handler.call(this, rq, rs, next)
        return next()
    }
}

/**
 * @param  { RegExp[] } paths
 * @return { Validator }
 */
function validatePaths(paths) {
    return rq => {
        rq.params ??= Object.create(null)

        let ok, fit
        for (let rx of paths) {
            if (fit = rq.url.match(rx)) {
                ok = true
                Object.assign(rq.params, fit.groups)
            }
        }
        return ok
    }
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
 * @param  { RegExp[] } paths
 * @param  { string[] } methods
 */
function isPathOrMethod(x, paths, methods) {
    let m = METHOD[ x.toUpperCase() ]
    if (m == null)
        paths.push(path2rgx(x))
    else
        methods.push(x.toUpperCase())
}

/**
 * @param  { string } path
 * @return { RegExp }
 */
function path2rgx(path) {
    const tmpl = path
        .replace(/\/:([^/\s]+)/g, String.raw`\/(?<$1>[^/\s]+)`) // create named group (?<param>\w+)
        .replace(/(?<!\\)\//g, String.raw`\/`)                // escape forward slashes
    return new RegExp(String.raw`^${ tmpl }`)               // match only from the begining of the string to avoid matches in the midlle of a url
}

/** @typedef { import('core.js').IRequest } Req */
/** @typedef { import('core.js').IResponse } Res */
/** @typedef { import('core.js').Validator } Validator */
/** @typedef { import('core.js').Handler } Handler */
/** @typedef { (method: string, path: string | RegExp, handler: Handler) => Handler  } UseMethod */
