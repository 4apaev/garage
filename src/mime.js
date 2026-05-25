export const MIME = Object.create(null)

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

MIME.form    = 'multipart/form-data'
MIME.query   = 'application/x-www-form-urlencoded'
MIME.json    = 'application/json'
MIME.js      = 'application/javascript'
MIME.bin     = 'application/octet-stream'
MIME.zip     = 'application/zip'
MIME.gif     = 'image/gif'
MIME.jpg     = 'image/jpeg'
MIME.png     = 'image/png'
MIME.svg     = 'image/svg+xml'
MIME.webp    = 'image/webp'
MIME.ico     = 'image/x-icon'
MIME.txt     = 'text/plain'
MIME.html    = 'text/html'
MIME.css     = 'text/css'
MIME.csv     = 'text/csv'
MIME.xml     = 'text/xml'
MIME.md      = 'text/x-markdown'
MIME.sse     = 'text/event-stream'

;(rows => {
    for (let row, i = rows.length; i--;) {
        if (row = rows[ i ].trim()) {
            let [ type, ...exts ] = row.match(/\S+/g)

            MIME[ type ] = type

            for (let ex of exts)
                MIME[ ex ] = type
        }
    }
})(`
    multipart/form-data                form  multipart
    application/x-www-form-urlencoded  query url
    application/json                   map   json
    application/javascript             mjs   js
    application/octet-stream           bin   dmg iso img  buffer
    application/zip                    zip   tar
    application/font-woff2             woff2
    application/font-woff              woff
    application/x-font-bdf             bdf
    application/x-font-otf             otf
    application/x-font-pcf             pcf
    application/x-font-snf             snf
    application/x-font-ttf             ttf ttc
    image/gif                          gif
    image/jpeg                         jpg jpeg
    image/png                          png
    image/svg+xml                      svg svgz
    image/webp                         webp
    image/x-icon                       ico
    text/plain                         txt text
    text/html                          html
    text/css                           css
    text/csv                           csv
    text/xml                           xml
    text/x-markdown                    md
    text/event-stream                  sse
`.trim().split('\n'))
