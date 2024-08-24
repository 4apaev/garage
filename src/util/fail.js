// @ts-check
export const CODES = { __proto__: null }

export default class Fail extends Error {

    /** @type { string } */ name = 'Fail'
    /** @type { number } */ code = 0

    /**
     * @example
     * ┌──────────────────────────────────────────────────────┬──────┬───────────────┬───────────────────────┬───────────────────────┐
     * │                                                      │ code │ cause         │ instance message      │ error message         │
     * ├──────────────────────────────────────────────────────┼──────┼───────────────┼───────────────────────┼───────────────────────┤
     * │  new Fail(500)                                       │ 500  │               │ Internal Server Error │ Internal Server Error │
     * │  new Fail(501, false)                                │ 501  │       false   │ Not Implemented       │ Not Implemented       │
     * │  new Fail('epic disaster', 502)                      │ 502  │         502   │ epic disaster         │ Bad Gateway           │
     * │  new Fail('biblical catastrophy', { code: 503 })     │ 503  │ { code: 503 } │ biblical catastrophe  │ Service Unavailable   │
     * │  new Fail('apocalypse now', { cause: { code: 504 }}) │ 504  │ { code: 504 } │ apocalypse now        │ Gateway Timeout       │
     * └──────────────────────────────────────────────────────┴──────┴───────────────┴───────────────────────┴───────────────────────┘
     * @param { string|number }  msg
     * @param { any      } [cause]
     * @param { Function } [start]
     */
    constructor(msg, cause, start) {
        super(`${ msg }`, { cause: cause?.cause ?? cause })

        /**/ if (msg in CODES)      this.code = +msg,   this.message = CODES[ msg ]
        else if (cause in CODES)    this.code = +cause, this.message = CODES[ cause ] // @ts-ignore
        else if (this?.cause?.code) this.code = +this?.cause?.code

        new.target.trap(this, start ?? new.target)
    }

    static CODES = CODES
    static trap = Error.captureStackTrace

    /**
     * @param    { any     } x
     * @return   { boolean }
     */
    static is = x =>
        this[ Symbol.hasInstance ](x)

    /**
     * @param    { string | number } m
     * @param    { ErrorOptions  } [c]
     * @param    { Function      } [f = Fail.of]
     * @return   { Fail          }
     */
    static of = (m, c, f) =>
        Reflect.construct(this, [ m, c, f ?? this.of ])

    /**
     * @param    { string | number } [m]
     * @param    { ErrorOptions  } [c]
     * @param    { Function      } [f = Fail.deny]
     * @return   { Promise<Fail> }
     */
    static deny = (m, c, f) =>
        Promise.reject(this.of(m, c, f ?? this.deny))

    /**
     * @param    { any       }  x
     * @param    { string | number } [m]
     * @param    { any       } [c]
     * @param    { Function  } [f = Fail.raise]
     * @throws   { Fail      }
     * @return   { asserts x }
     */
    static assert = (x, m, c, f) => x || this.raise(m, c, f ?? this.assert)

    /**
     * @throws   { Fail     }
     * @param    { string | number } [m]
     * @param    { any      } [c]
     * @param    { Function } [f = Fail.raise]
     * @return   { never    }
     */
    static raise  = (m, c, f) => {
        throw this.of(m, c, f ?? this.raise)
    }
}

Fail.from = Fail.of

export const { is, of, trap, deny, raise, assert } = Fail

CODES[ 400 ] = `Bad Request`
CODES[ 401 ] = `Unauthorized`
CODES[ 402 ] = `Payment Required`
CODES[ 403 ] = `Forbidden`
CODES[ 404 ] = `Not Found`
CODES[ 405 ] = `Method Not Allowed`
CODES[ 406 ] = `Not Acceptable`
CODES[ 407 ] = `Proxy Authentication Required`
CODES[ 408 ] = `Request Timeout`
CODES[ 409 ] = `Conflict`
CODES[ 410 ] = `Gone`
CODES[ 411 ] = `Length Required`
CODES[ 412 ] = `Precondition Failed`
CODES[ 413 ] = `Payload Too Large`
CODES[ 414 ] = `URI Too Long`
CODES[ 415 ] = `Unsupported Media Type`
CODES[ 416 ] = `Range Not Satisfiable`
CODES[ 417 ] = `Expectation Failed`
CODES[ 418 ] = `I'm a Teapot`
CODES[ 421 ] = `Misdirected Request`
CODES[ 422 ] = `Unprocessable Entity`
CODES[ 423 ] = `Locked`
CODES[ 424 ] = `Failed Dependency`
CODES[ 425 ] = `Too Early`
CODES[ 426 ] = `Upgrade Required`
CODES[ 428 ] = `Precondition Required`
CODES[ 429 ] = `Too Many Requests`
CODES[ 431 ] = `Request Header Fields Too Large`
CODES[ 451 ] = `Unavailable For Legal Reasons`
CODES[ 500 ] = `Internal Server Error`
CODES[ 501 ] = `Not Implemented`
CODES[ 502 ] = `Bad Gateway`
CODES[ 503 ] = `Service Unavailable`
CODES[ 504 ] = `Gateway Timeout`
CODES[ 505 ] = `HTTP Version Not Supported`
CODES[ 506 ] = `Variant Also Negotiates`
CODES[ 507 ] = `Insufficient Storage`
CODES[ 508 ] = `Loop Detected`
CODES[ 509 ] = `Bandwidth Limit Exceeded`
CODES[ 510 ] = `Not Extended`
CODES[ 511 ] = `Network Authentication Required`
