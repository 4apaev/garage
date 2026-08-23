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
    400: 'bad request',                         500: 'internal server error',
    401: 'unauthorized',                        501: 'not implemented',
    402: 'payment required',                    502: 'bad gateway',
    403: 'forbidden',                           503: 'service unavailable',
    404: 'not found',                           504: 'gateway timeout',
    405: 'method not allowed',                  505: 'http version not supported',
    406: 'not acceptable',                      506: 'variant also negotiates',
    407: 'proxy authentication required',       507: 'insufficient storage',
    408: 'request timeout',                     508: 'loop detected',
    409: 'conflict',                            509: 'bandwidth limit exceeded',
    410: 'gone',                                510: 'not extended',
    411: 'length required',                     511: 'network authentication required',
    412: 'precondition failed',
    413: 'payload too large',                   423: 'locked',
    414: 'uri too long',                        424: 'failed dependency',
    415: 'unsupported media type',              425: 'too early',
    416: 'range not satisfiable',               426: 'upgrade required',
    417: 'expectation failed',                  428: 'precondition required',
    418: 'teapot',                              429: 'too many requests',
    421: 'misdirected request',                 431: 'request header fields too large',
    422: 'unprocessable entity',                451: 'unavailable for legal reasons',
}

export const STATUS = {
    200: 'ok'                           , 300: 'multiple choices'        , 100: 'continue'            ,
    201: 'created'                      , 301: 'moved permanently'       , 101: 'switching protocols' ,
    202: 'accepted'                     , 302: 'found'                   , 102: 'processing'          ,
    203: 'non authoritative information', 303: 'see other'               , 103: 'early hints'         ,
    204: 'no content'                   , 304: 'not modified'            ,
    205: 'reset content'                , 305: 'use proxy'               ,
    206: 'partial content'              , 307: 'temporary redirect'      ,
    207: 'multi status'                 , 308: 'permanent redirect'      ,
    208: 'already reported'             ,
    226: 'im used'                      , ...STATUS_ERR,
}

export const SYSERR = [
    [ -7    , 'E2BIG'           , 'argument list too long'                        ],
    [ -13   , 'EACCES'          , 'permission denied'                             ],
    [ -48   , 'EADDRINUSE'      , 'address already in use'                        ],
    [ -49   , 'EADDRNOTAVAIL'   , 'address not available'                         ],
    [ -47   , 'EAFNOSUPPORT'    , 'address family not supported'                  ],
    [ -35   , 'EAGAIN'          , 'resource temporarily unavailable'              ],
    [ -3000 , 'EAI_ADDRFAMILY'  , 'address family not supported'                  ],
    [ -3001 , 'EAI_AGAIN'       , 'temporary failure'                             ],
    [ -3002 , 'EAI_BADFLAGS'    , 'bad ai_flags value'                            ],
    [ -3013 , 'EAI_BADHINTS'    , 'invalid value for hints'                       ],
    [ -3003 , 'EAI_CANCELED'    , 'request canceled'                              ],
    [ -3004 , 'EAI_FAIL'        , 'permanent failure'                             ],
    [ -3005 , 'EAI_FAMILY'      , 'ai_family not supported'                       ],
    [ -3006 , 'EAI_MEMORY'      , 'out of memory'                                 ],
    [ -3007 , 'EAI_NODATA'      , 'no address'                                    ],
    [ -3008 , 'EAI_NONAME'      , 'unknown node or service'                       ],
    [ -3009 , 'EAI_OVERFLOW'    , 'argument buffer overflow'                      ],
    [ -3014 , 'EAI_PROTOCOL'    , 'resolved protocol is unknown'                  ],
    [ -3010 , 'EAI_SERVICE'     , 'service not available for socket type'         ],
    [ -3011 , 'EAI_SOCKTYPE'    , 'socket type not supported'                     ],
    [ -37   , 'EALREADY'        , 'connection already in progress'                ],
    [ -9    , 'EBADF'           , 'bad file descriptor'                           ],
    [ -16   , 'EBUSY'           , 'resource busy or locked'                       ],
    [ -89   , 'ECANCELED'       , 'operation canceled'                            ],
    [ -4080 , 'ECHARSET'        , 'invalid Unicode character'                     ],
    [ -53   , 'ECONNABORTED'    , 'software caused connection abort'              ],
    [ -61   , 'ECONNREFUSED'    , 'connection refused'                            ],
    [ -54   , 'ECONNRESET'      , 'connection reset by peer'                      ],
    [ -39   , 'EDESTADDRREQ'    , 'destination address required'                  ],
    [ -17   , 'EEXIST'          , 'file already exists'                           ],
    [ -14   , 'EFAULT'          , 'bad address in system call argument'           ],
    [ -27   , 'EFBIG'           , 'file too large'                                ],
    [ -65   , 'EHOSTUNREACH'    , 'host is unreachable'                           ],
    [ -4    , 'EINTR'           , 'interrupted system call'                       ],
    [ -22   , 'EINVAL'          , 'invalid argument'                              ],
    [ -5    , 'EIO'             , 'i/o error'                                     ],
    [ -56   , 'EISCONN'         , 'socket is already connected'                   ],
    [ -21   , 'EISDIR'          , 'illegal operation on a directory'              ],
    [ -62   , 'ELOOP'           , 'too many symbolic links encountered'           ],
    [ -24   , 'EMFILE'          , 'too many open files'                           ],
    [ -40   , 'EMSGSIZE'        , 'message too long'                              ],
    [ -63   , 'ENAMETOOLONG'    , 'name too long'                                 ],
    [ -50   , 'ENETDOWN'        , 'network is down'                               ],
    [ -51   , 'ENETUNREACH'     , 'network is unreachable'                        ],
    [ -23   , 'ENFILE'          , 'file table overflow'                           ],
    [ -55   , 'ENOBUFS'         , 'no buffer space available'                     ],
    [ -19   , 'ENODEV'          , 'no such device'                                ],
    [ -2    , 'ENOENT'          , 'no such file or directory'                     ],
    [ -12   , 'ENOMEM'          , 'not enough memory'                             ],
    [ -4056 , 'ENONET'          , 'machine is not on the network'                 ],
    [ -42   , 'ENOPROTOOPT'     , 'protocol not available'                        ],
    [ -28   , 'ENOSPC'          , 'no space left on device'                       ],
    [ -78   , 'ENOSYS'          , 'function not implemented'                      ],
    [ -57   , 'ENOTCONN'        , 'socket is not connected'                       ],
    [ -20   , 'ENOTDIR'         , 'not a directory'                               ],
    [ -66   , 'ENOTEMPTY'       , 'directory not empty'                           ],
    [ -38   , 'ENOTSOCK'        , 'socket operation on non-socket'                ],
    [ -45   , 'ENOTSUP'         , 'operation not supported on socket'             ],
    [ -84   , 'EOVERFLOW'       , 'value too large for defined data type'         ],
    [ -1    , 'EPERM'           , 'operation not permitted'                       ],
    [ -32   , 'EPIPE'           , 'broken pipe'                                   ],
    [ -100  , 'EPROTO'          , 'protocol error'                                ],
    [ -43   , 'EPROTONOSUPPORT' , 'protocol not supported'                        ],
    [ -41   , 'EPROTOTYPE'      , 'protocol wrong type for socket'                ],
    [ -34   , 'ERANGE'          , 'result too large'                              ],
    [ -30   , 'EROFS'           , 'read-only file system'                         ],
    [ -58   , 'ESHUTDOWN'       , 'cannot send after transport endpoint shutdown' ],
    [ -29   , 'ESPIPE'          , 'invalid seek'                                  ],
    [ -3    , 'ESRCH'           , 'no such process'                               ],
    [ -60   , 'ETIMEDOUT'       , 'connection timed out'                          ],
    [ -26   , 'ETXTBSY'         , 'text file is busy'                             ],
    [ -18   , 'EXDEV'           , 'cross-device link not permitted'               ],
    [ -4094 , 'UNKNOWN'         , 'unknown error'                                 ],
    [ -4095 , 'EOF'             , 'end of file'                                   ],
    [ -6    , 'ENXIO'           , 'no such device or address'                     ],
    [ -31   , 'EMLINK'          , 'too many links'                                ],
    [ -64   , 'EHOSTDOWN'       , 'host is down'                                  ],
    [ -4030 , 'EREMOTEIO'       , 'remote I/O error'                              ],
    [ -25   , 'ENOTTY'          , 'inappropriate ioctl for device'                ],
    [ -79   , 'EFTYPE'          , 'inappropriate file type or format'             ],
    [ -92   , 'EILSEQ'          , 'illegal byte sequence'                         ],
    [ -44   , 'ESOCKTNOSUPPORT' , 'socket type not supported'                     ],
    [ -96   , 'ENODATA'         , 'no data available'                             ],
    [ -4023 , 'EUNATCH'         , 'protocol driver not attached'                  ],
    [ -8    , 'ENOEXEC'         , 'exec format error'                             ],
].reduce((err, [ errno, key, msg ]) => {
    err[ key ] = err[ errno ] = err[ -1 * errno ] = ƒ({
        errno,
        key,
        msg,
    })
    return err
}, {})

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
ƒ(SYSERR)
ƒ(STATUS_ERR)
Object.seal(METHOD)
