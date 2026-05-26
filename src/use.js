// @ts-check
import { URLPattern } from 'node:url'

import { Fail } from './util.js'
import compose from './compose.js'

const METHOD = new Set(`
    GET    COPY
    PUT    PATCH UPDATE
    POST   MERGE
    DELETE MOVE
    HEAD   OPTIONS
    TRACE  SEARCH
    BIND   UNBIND
    LINK   UNLINK
`.match(/\w+/g))

export default use
export function use() {
    /** @type { MWare[]     } */ const handlers   = []
    /** @type { Validator[] } */ const validators = []
    /** @type { URLPattern[]} */ const patterns   = []
    /** @type { Set<string> } */ const methods    = new Set

    for (const a of arguments) {
        /**/ if (typeof a == 'function') handlers.push(a)
        else if (typeof a != 'string')   Fail.raise(500, 'failed to create middleware. invalid argument type', a)
        else if (METHOD.has(a.toUpperCase())) methods.add(a.toUpperCase())
        else patterns.push(new URLPattern({ pathname: a }))
    }

    handlers.length || Fail.raise(500, 'failed to create middleware. missing handler')

    const mware = handlers.length > 1
        ? compose(handlers)
        : handlers[ 0 ]

    methods.size && validators.push(createMethodValidator(methods))
    patterns.length && validators.push(createPathValidator(patterns))

    return wrapWithValidators(mware, validators)
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
 * @typedef { import('./garage.js').Req       } Req
 * @typedef { import('./garage.js').Res       } Res
 * @typedef { import('./types.js').Next       } Next
 * @typedef { import('./types.js').Validator  } Validator
 * @typedef { import('./types.js').MWare      } MWare
 */
