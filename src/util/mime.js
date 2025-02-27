// @ts-check

import Pt from 'node:path'
import { MIME, HEADER } from './constants.js'

/**
 * @typedef { import('http').IncomingHttpHeaders | Map | Headers | Record<PropertyKey, any> } Head
 */

export { MIME }

/**
 * @param  { string } s
 * @param  { string } [fallback]
 * @return { string }
 */
export function get(s, fallback) {
    return MIME[ s ] ?? fallback
}

/**
 * @param  { Head } ctx
 * @param  { string } [fallback]
 * @return { string }
 */
export function fromHead(ctx, fallback) {
    const re = typeof ctx?.get == 'function'
        ? ctx.get(HEADER.CONTENT.TYPE) ?? ctx.get(HEADER.CONTENT.TYPE.toLowerCase())
        : ctx?.[ HEADER.CONTENT.TYPE ] ?? ctx?.[ HEADER.CONTENT.TYPE ]
    return re ?? fallback ?? ''
}

/**
 * @param  { string | URL } s
 * @param  { string } [fallback]
 * @return { string }
 */
export function fromPath(s, fallback) {
    const ex = extname(s)
    return ex
        ? get(ex, fallback) ?? ''
        : fallback ?? ''
}

/**
 * @param  { string | URL } file
 * @return { string }
 */
export function extname(file) {
    let ext = ''
    let path = typeof file == 'string'
        ? file
        : file.pathname
    for (let i = path.length; i--;) {
        if (path[ i ] == '.')
            return ext
        ext = path[ i ] + ext
    }
    return ''
}

/**
 * @param  { string } expected
 * @param  { string | Head } actual
 * @return { boolean }
 */
export function is(expected, actual) {
    if (actual == null)
        return false

    const e = get(expected, expected)
    const a = typeof actual == 'string'
        ? get(actual, actual)
        : fromHead(actual)
    return e.startsWith(a)
}

/**
 * @param  { string } path
 * @param  { string } dir
 * @param  { Record<string, string> } stub
 * @return { string }
 */
export function sanitize(path, dir, stub) {
    return sanitize.cache[ path ] ??= path in stub
        ? Pt.isAbsolute(stub[ path ])
            ? stub[ path ]
            : Pt.join(dir, stub[ path ])
        : Pt.join(dir, Pt.normalize(path))
}

sanitize.cache = { __proto__: null }
