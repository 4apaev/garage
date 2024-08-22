/* eslint-disable key-spacing */

export const HEADER = {
    PATH: ':path',
    STATUS: ':status',
    METHOD: ':method',
    SCHEME: ':scheme',
    PROTOCOL: ':protocol',
    AUTHORITY: ':authority',
    AUTHORIZATION: 'authorization',
    CONNECTION: 'connection',
    FORWARDED: 'forwarded',
    PRIORITY: 'priority',
    LOCATION: 'location',
    REFERER: 'referer',
    PURPOSE: 'purpose',
    EXPIRES: 'expires',
    REFRESH: 'refresh',
    TRAILER: 'trailer',
    WARNING: 'warning',
    PREFER: 'prefer',
    COOKIE: 'cookie',
    ORIGIN: 'origin',
    SERVER: 'server',
    ALLOW: 'allow',
    RANGE: 'range',
    HOST: 'host',
    FROM: 'from',
    DATE: 'date',
    ETAG: 'etag',
    LINK: 'link',
    VARY: 'vary',
    VIA: 'via',
    AGE: 'age',
    DNT: 'dnt',
    TE: 'te',
    TK: 'tk',
    ALT      : { SVC         : 'alt-svc'           },
    SET      : { COOKIE      : 'set-cookie'        },
    MAX      : { FORWARDS    : 'max-forwards'      },
    WWW      : { AUTHENTICATE: 'www-authenticate'  },
    USER     : { AGENT       : 'user-agent'        },
    KEEP     : { ALIVE       : 'keep-alive'        },
    LAST     : { MODIFIED    : 'last-modified'     },
    EARLY    : { DATA        : 'early-data'        },
    RETRY    : { AFTER       : 'retry-after'       },
    HTTP2    : { SETTINGS    : 'http2-settings'    },
    CACHE    : { CONTROL     : 'cache-control'     },
    TRANSFER : { ENCODING    : 'transfer-encoding' },
    TIMING   : { ALLOW     : { ORIGIN   : 'timing-allow-origin'       }},
    STRICT   : { TRANSPORT : { SECURITY : 'strict-transport-security' }},

    EXPECT   : {
        CT: 'expect-ct',
        EXPECT: 'expect' },

    ACCEPT: {
        ACCEPT: 'accept',
        RANGES: 'accept-ranges',
        CHARSET: 'accept-charset',
        ENCODING: 'accept-encoding',
        LANGUAGE: 'accept-language' },

    PROXY: {
        CONNECTION: 'proxy-connection',
        AUTHENTICATE: 'proxy-authenticate',
        AUTHORIZATION: 'proxy-authorization' },

    CONTENT: {
        MD5: 'content-md5',
        TYPE: 'content-type',
        RANGE: 'content-range',
        LENGTH: 'content-length',
        ENCODING: 'content-encoding',
        LANGUAGE: 'content-language',
        LOCATION: 'content-location',
        DISPOSITION: 'content-disposition',
        SECURITY: { POLICY: 'content-security-policy' }},

    IF: {
        RANGE      : 'if-range',
        MATCH      : 'if-match',
        NONE       : { MATCH: 'if-none-match'       },
        MODIFIED   : { SINCE: 'if-modified-since'   },
        UNMODIFIED : { SINCE: 'if-unmodified-since' }},

    UPGRADE: {
        UPGRADE: 'upgrade',
        INSECURE: { REQUESTS: 'upgrade-insecure-requests' }},

    X: {
        XSS       : { PROTECTION : 'x-xss-protection'                  },
        FRAME     : { OPTIONS    : 'x-frame-options'                   },
        FORWARDED : { FOR        : 'x-forwarded-for'                   },
        CONTENT   : { TYPE       : { OPTIONS: 'x-content-type-options' }}},

    ACCESS: {
        CONTROL: {
            MAX    : { AGE: 'access-control-max-age'            },
            EXPOSE : { HEADERS: 'access-control-expose-headers' },
            REQUEST: {
                METHOD: 'access-control-request-method',
                HEADERS: 'access-control-request-headers'       },
            ALLOW  : {
                ORIGIN: 'access-control-allow-origin',
                HEADERS: 'access-control-allow-headers',
                METHODS: 'access-control-allow-methods',
                CREDENTIALS: 'access-control-allow-credentials' }}},

}

export const METHOD = {
    HEAD              : 'HEAD',
    GET               : 'GET',
    PUT               : 'PUT',
    POST              : 'POST',
    PATCH             : 'PATCH',
    DELETE            : 'DELETE',

    ACL               : 'ACL',
    BIND              : 'BIND',
    COPY              : 'COPY',

    LINK              : 'LINK',
    LABEL             : 'LABEL',
    LOCK              : 'LOCK',

    CONNECT           : 'CONNECT',
    CHECKIN           : 'CHECKIN',
    CHECKOUT          : 'CHECKOUT',

    MOVE              : 'MOVE',
    MKCOL             : 'MKCOL',
    MERGE             : 'MERGE',
    MKACTIVITY        : 'MKACTIVITY',
    MKCALENDAR        : 'MKCALENDAR',
    MKWORKSPACE       : 'MKWORKSPACE',
    MKREDIRECTREF     : 'MKREDIRECTREF',

    OPTIONS           : 'OPTIONS',
    ORDERPATCH        : 'ORDERPATCH',

    PRI               : 'PRI',
    PROPFIND          : 'PROPFIND',
    PROPPATCH         : 'PROPPATCH',

    REBIND            : 'REBIND',
    REPORT            : 'REPORT',

    SEARCH            : 'SEARCH',
    TRACE             : 'TRACE',

    UNBIND            : 'UNBIND',
    UNLINK            : 'UNLINK',
    UNLOCK            : 'UNLOCK',
    UPDATE            : 'UPDATE',
    UNCHECKOUT        : 'UNCHECKOUT',
    UPDATEREDIRECTREF : 'UPDATEREDIRECTREF',

    VERSION           : { CONTROL: 'VERSION-CONTROL' },
    BASELINE          : { CONTROL: 'BASELINE-CONTROL' },
}

export const STATUS = {
    CONTINUE      : 100,
    PROCESSING    : 102,

    OK            : 200,
    CREATED       : 201,
    ACCEPTED      : 202,

    FOUND         : 302,

    UNAUTHORIZED  : 401,
    FORBIDDEN     : 403,
    CONFLICT      : 409,
    GONE          : 410,
    TEAPOT        : 418,
    LOCKED        : 423,

    NOT           : {
        MODIFIED    : 304,
        FOUND       : 404,
        ACCEPTABLE  : 406,
        IMPLEMENTED : 501,
        EXTENDED    : 510 },

    SWITCHING     : { PROTOCOLS  : 101 },
    EARLY         : { HINTS      : 103 },
    NO            : { CONTENT  : 204 },
    RESET         : { CONTENT  : 205 },
    PARTIAL       : { CONTENT  : 206 },
    MULTI         : { STATUS   : 207 },
    ALREADY       : { REPORTED : 208 },
    IM            : { USED     : 226 },
    MULTIPLE      : { CHOICES      : 300 },
    MOVED         : { PERMANENTLY  : 301 },
    SEE           : { OTHER        : 303 },
    USE           : { PROXY        : 305 },
    TEMPORARY     : { REDIRECT     : 307 },
    PERMANENT     : { REDIRECT     : 308 },
    PAYMENT       : { REQUIRED   : 402 },
    LENGTH        : { REQUIRED   : 411 },
    EXPECTATION   : { FAILED     : 417 },
    MISDIRECTED   : { REQUEST    : 421 },
    UNPROCESSABLE : { ENTITY     : 422 },
    FAILED        : { DEPENDENCY : 424 },
    UPGRADE       : { REQUIRED   : 426 },
    SERVICE       : { UNAVAILABLE   : 503 },
    GATEWAY       : { TIMEOUT       : 504 },
    INSUFFICIENT  : { STORAGE       : 507 },
    LOOP          : { DETECTED      : 508 },
    BAD           : { REQUEST : 400, GATEWAY  : 502 },
    PRECONDITION  : { FAILED  : 412, REQUIRED : 428 },
    TOO           : { EARLY   : 425, MANY     : { REQUESTS: 429 }},
    REQUEST       : { TIMEOUT : 408, HEADER   : { FIELDS: { TOO: { LARGE: 431 }}}},
    NON           : { AUTHORITATIVE  : { INFORMATION : 203 }},
    METHOD        : { NOT            : { ALLOWED     : 405 }},
    PROXY         : { AUTHENTICATION : { REQUIRED    : 407 }},
    PAYLOAD       : { TOO            : { LARGE       : 413 }},
    URI           : { TOO            : { LONG        : 414 }},
    UNSUPPORTED   : { MEDIA          : { TYPE        : 415 }},
    RANGE         : { NOT            : { SATISFIABLE : 416 }},
    INTERNAL      : { SERVER         : { ERROR       : 500 }},
    VARIANT       : { ALSO           : { NEGOTIATES  : 506 }},
    BANDWIDTH     : { LIMIT          : { EXCEEDED    : 509 }},
    NETWORK       : { AUTHENTICATION : { REQUIRED    : 511 }},
    UNAVAILABLE   : { FOR            : { LEGAL       : { REASONS  : 451 }}},
    HTTP          : { VERSION        : { NOT         : { SUPPORTED: 505 }}},
}

export const MIME = `
    multipart/form-data                form  multipart
    application/x-www-form-urlencoded  query url

    application/json                   map   json
    application/javascript             js    mjs

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

    text/css                           css
    text/csv                           csv

    text/plain                         txt
    text/html                          html
    text/xml                           xml
    text/jsx                           jsx
    text/less                          less
    text/yaml                          yml yaml
    text/x-markdown                    md
    text/event-stream                  sse
`
    .trim()
    .split('\n')
    .reduce((mim, row) => {
        if (row.trim()) {
            let [ type, ...alias ] = row.match(/\S+/g)
            mim[ type ] = type
            alias.forEach(a => mim[ a ] = mim[ '.' + a ] = type)
        }
        return mim
    }, Object.create(null))

export default {
    HEADER,
    METHOD,
    STATUS,
    MIME,
}
