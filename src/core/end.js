import { Stream } from 'stream'

/**
 * @param  { import('node:http').ServerResponse } rs
 * @param  { any } [body]
 */
export default function end(rs, body) {

    if (rs.statusCode === 204 || rs.statusCode === 304) {
        set(rs, 'content-length', 0)
        rs.end()
        return
    }

    if (Stream[ Symbol.hasInstance ](body)) {
        set(rs, 'content-type', 'octet-stream')
        body.pipe(rs)
        return
    }

    if (!Buffer.isBuffer(body)) {
        set(rs, 'content-type', 'application/json')
        body = JSON.stringify(body)
    }

    set(rs, 'content-length', Buffer.byteLength(body))
    rs.end(body)
}

function set(rs, k, v) {
    rs.headersSent
        || rs.hasHeader(k)
        || rs.setHeader(k, v)
}
