/* eslint-disable key-spacing */

function ƒ(x) {
    if (Object(x) !== x)
        return x

    for (const k in Object.setPrototypeOf(x, null))
        ƒ(x[ k ])

    return Object.freeze(x)
}

export const METHOD = [
    'GET'           , 'ACL',
    'PUT'           , 'BIND',
    'POST'          , 'BASELINE-CONTROL',
    'PATCH'         , 'CHECKIN',
    'DELETE'        , 'CHECKOUT',
    'OPTIONS'       , 'CONNECT',
    'HEAD'          , 'COPY',
    'LINK'          , 'PROPPATCH',
    'LABEL'         , 'REBIND',
    'LOCK'          , 'REPORT',
    'MERGE'         , 'SEARCH',
    'MKACTIVITY'    , 'TRACE',
    'MKCALENDAR'    , 'UNBIND',
    'MKCOL'         , 'UNCHECKOUT',
    'MKREDIRECTREF' , 'UNLINK',
    'MKWORKSPACE'   , 'UNLOCK',
    'MOVE'          , 'UPDATE',
    'ORDERPATCH'    , 'UPDATEREDIRECTREF',
    'PRI'           , 'VERSION-CONTROL',
    'PROPFIND',
]
METHOD.has = METHOD.includes.bind(METHOD)

export const HEADER = {
    PATH     : ':path',
    METHOD   : ':method',
    STATUS   : ':status',
    SCHEME   : ':scheme',
    PROTOCOL : ':protocol',
    AUTHORITY: ':authority',

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    UPGRADE: { UPGRADE : 'upgrade', INSECURE: { REQUESTS: 'upgrade-insecure-requests' }},
    upgrade: 'upgrade',

    accept : 'accept',
    ACCEPT : {
        ACCEPT  : 'accept',
        ENCODING: 'accept-encoding',
        LANGUAGE: 'accept-language',
        RANGES  : 'accept-ranges',
        CHARSET : 'accept-charset',
    },

    ACCESS: {
        CONTROL: {
            ALLOW  : {
                ORIGIN     : 'access-control-allow-origin',
                HEADERS    : 'access-control-allow-headers',
                METHODS    : 'access-control-allow-methods',
                CREDENTIALS: 'access-control-allow-credentials',
            },
            REQUEST: {
                METHOD : 'access-control-request-method',
                HEADERS: 'access-control-request-headers',
            },
            EXPOSE: { HEADERS: 'access-control-expose-headers' },
            MAX   : { AGE    : 'access-control-max-age' },
        },
    },

    CONTENT: {
        MD5                     : 'content-md5',
        TYPE                    : 'content-type',
        RANGE                   : 'content-range',
        LENGTH                  : 'content-length',
        ENCODING                : 'content-encoding',
        LANGUAGE                : 'content-language',
        LOCATION                : 'content-location',
        DISPOSITION             : 'content-disposition',
        SECURITY                : { POLICY: 'content-security-policy' },
    },

    PROXY: {
        AUTHENTICATE  : 'proxy-authenticate',
        AUTHORIZATION : 'proxy-authorization',
        CONNECTION    : 'proxy-connection',
    },

    IF: {
        UNMODIFIED: { SINCE     : 'if-unmodified-since' },
        MODIFIED  : { SINCE     : 'if-modified-since' },
        NONE      : { MATCH     : 'if-none-match' },
        RANGE                   : 'if-range',
        MATCH                   : 'if-match',
    },

    X: {
        CONTENT_TYPE_OPTIONS    : 'x-content-type-options',
        FRAME_OPTIONS           : 'x-frame-options',
        XSS_PROTECTION          : 'x-xss-protection',
        FORWARDED_FOR           : 'x-forwarded-for',
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    CACHE   : { CONTROL               : 'cache-control'              },
    ALT     : { SVC                   : 'alt-svc'                    },
    KEEP    : { ALIVE                 : 'keep-alive'                 },
    LAST    : { MODIFIED              : 'last-modified'              },
    MAX     : { FORWARDS              : 'max-forwards'               },
    RETRY   : { AFTER                 : 'retry-after'                },
    SET     : { COOKIE                : 'set-cookie'                 },
    USER    : { AGENT                 : 'user-agent'                 },
    TRANSFER: { ENCODING              : 'transfer-encoding'          },
    STRICT  : { TRANSPORT: { SECURITY : 'strict-transport-security' }},
    TIMING  : { ALLOW    : { ORIGIN   : 'timing-allow-origin'       }},

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    AGE              : 'age'             ,
    ALLOW            : 'allow'           ,
    AUTHORIZATION    : 'authorization'   ,
    CONNECTION       : 'connection'      ,
    COOKIE           : 'cookie'          ,
    DATE             : 'date'            ,
    DNT              : 'dnt'             ,
    EARLY_DATA       : 'early-data'      ,
    ETAG             : 'etag'            ,
    EXPECT           : 'expect'          ,
    EXPECT_CT        : 'expect-ct'       ,
    EXPIRES          : 'expires'         ,
    FORWARDED        : 'forwarded'       ,
    FROM             : 'from'            ,
    HOST             : 'host'            ,
    HTTP2_SETTINGS   : 'http2-settings'  ,
    LINK             : 'link'            ,
    LOCATION         : 'location'        ,
    ORIGIN           : 'origin'          ,
    PREFER           : 'prefer'          ,
    PRIORITY         : 'priority'        ,
    PURPOSE          : 'purpose'         ,
    RANGE            : 'range'           ,
    REFERER          : 'referer'         ,
    REFRESH          : 'refresh'         ,
    SERVER           : 'server'          ,
    TE               : 'te'              ,
    TK               : 'tk'              ,
    TRAILER          : 'trailer'         ,
    VARY             : 'vary'            ,
    VIA              : 'via'             ,
    WARNING          : 'warning'         ,
    WWW_AUTHENTICATE : 'www-authenticate',
}

export const STATUS_ERR = {
    400: 'bad request',
    401: 'unauthorized',
    402: 'payment required',
    403: 'forbidden',
    404: 'not found',
    405: 'method not allowed',
    406: 'not acceptable',
    407: 'proxy authentication required',
    408: 'request timeout',
    409: 'conflict',
    410: 'gone',
    411: 'length required',
    412: 'precondition failed',
    413: 'payload too large',
    414: 'uri too long',
    415: 'unsupported media type',
    416: 'range not satisfiable',
    417: 'expectation failed',
    418: 'teapot',
    421: 'misdirected request',
    422: 'unprocessable entity',
    423: 'locked',
    424: 'failed dependency',
    425: 'too early',
    426: 'upgrade required',
    428: 'precondition required',
    429: 'too many requests',
    431: 'request header fields too large',
    451: 'unavailable for legal reasons',

    500: 'internal server error',
    501: 'not implemented',
    502: 'bad gateway',
    503: 'service unavailable',
    504: 'gateway timeout',
    505: 'http version not supported',
    506: 'variant also negotiates',
    507: 'insufficient storage',
    508: 'loop detected',
    509: 'bandwidth limit exceeded',
    510: 'not extended',
    511: 'network authentication required',
}

export const STATUS = {
    100: 'continue',
    101: 'switching protocols',
    102: 'processing',
    103: 'early hints',

    200: 'ok',
    201: 'created',
    202: 'accepted',
    203: 'non authoritative information',
    204: 'no content',
    205: 'reset content',
    206: 'partial content',
    207: 'multi status',
    208: 'already reported',
    226: 'im used',

    300: 'multiple choices',
    301: 'moved permanently',
    302: 'found',
    303: 'see other',
    304: 'not modified',
    305: 'use proxy',
    307: 'temporary redirect',
    308: 'permanent redirect',

    ...STATUS_ERR,
}

export const MIME = {
    form   : 'multipart/form-data'              ,
    query  : 'application/x-www-form-urlencoded',
    json   : 'application/json'                 ,
    js     : 'application/javascript'           ,
    bin    : 'application/octet-stream'         ,
    zip    : 'application/zip'                  ,
    gif    : 'image/gif'                        ,
    jpg    : 'image/jpeg'                       ,
    png    : 'image/png'                        ,
    svg    : 'image/svg+xml'                    ,
    webp   : 'image/webp'                       ,
    ico    : 'image/x-icon'                     ,
    txt    : 'text/plain'                       ,
    html   : 'text/html'                        ,
    css    : 'text/css'                         ,
    csv    : 'text/csv'                         ,
    xml    : 'text/xml'                         ,
    md     : 'text/x-markdown'                  ,
    sse    : 'text/event-stream'                ,
}

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

ƒ(MIME)
ƒ(METHOD)
ƒ(HEADER)
ƒ(STATUS)
ƒ(STATUS_ERR)
Object.seal(METHOD)
