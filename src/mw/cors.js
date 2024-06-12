import { HEADER } from '../constants.js'

/**
 * @param { import('http').IncomingMessage } rq
 * @param { import('http').ServerResponse } rs
 * @param { Function } [next]
 */
export function cors(rq, rs, next) {
    HEADER.Access.Control.Allow.Origin
    rs.setHeader(HEADER.ACCESS.CONTROL.ALLOW.ORIGIN, '*')
    rs.setHeader(HEADER.ACCESS.CONTROL.ALLOW.HEADERS, 'Origin, X-Requested-With, Content-Type, Accept')
    next && next()
}

export default cors
