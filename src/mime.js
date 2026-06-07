import { MIME } from './constants.js'

export { MIME }

export function get(s, fallback) {
    return MIME[ s ] ?? fallback
}

export function fromHead(ctx, fallback) {
    return ctx?.get?.('content-type')
        ?? ctx?.[ 'content-type' ]
        ?? fallback
}

export function fromPath(s, fallback) {
    const ex = extname(s)
    return ex
        ? get(ex, fallback)
        : fallback
}

export function extname(file) {
    const path = file instanceof URL
        ? file.pathname
        : String(file)
    for (let ext = '', i = path.length; i--;) {
        if (path[ i ] == '/' || path[ i ] == '\\')
            return ''

        if (path[ i ] == '.') {
            return i && ext && path[ i - 1 ] != '/' && path[ i - 1 ] != '\\'
                ? ext
                : ''
        }

        ext = path[ i ] + ext
    }
    return ''
}

export function is(expected, actual) {
    const exp = get(expected, expected)
    const act = typeof actual == 'string'
        ? actual
        : fromHead(actual, '')
    return !!act && exp.startsWith(act.replace(/[;,].*/, ''))
}
