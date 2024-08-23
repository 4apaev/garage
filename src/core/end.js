import { Stream } from 'stream'
import { HEADER, STATUS, MIME } from '../util/constants.js'

/**
 * @param  { import('node:http').ServerResponse } rs
 * @param  { any } [body]
 */
export default function end(rs, body) {

    if (rs.statusCode === STATUS.NO.CONTENT
     || rs.statusCode === STATUS.NOT.MODIFIED) {
        set(rs, HEADER.CONTENT.LENGTH, 0)
        rs.end()
        return
    }

    if (Stream[ Symbol.hasInstance ](body)) {
        set(rs, HEADER.CONTENT.TYPE, MIME.bin)
        body.pipe(rs)
        return
    }

    if (!Buffer.isBuffer(body)) {
        set(rs, HEADER.CONTENT.TYPE, MIME.json)
        body = JSON.stringify(body)
    }

    set(rs, HEADER.CONTENT.LENGTH, Buffer.byteLength(body))
    rs.end(body)
}

function set(rs, k, v) {
    rs.headersSent
        || rs.hasHeader(k)
        || rs.setHeader(k, v)
}
