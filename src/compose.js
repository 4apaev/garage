// @ts-check
import { Fail } from './util.js'

/**
 * @param  { MWare[] } mware
 * @return { MWare }
 */
export function composeProd(mware) {
    /**
     * @param { Req } rq
     * @param { Res } rs
     * @param { Next } next
     */
    return async function (rq, rs, next) {
        /**
         * @param  { number } i
         */
        const tick = i => async () => {
            const mw = i === mware.length
                ? next
                : mware[ i ]

            return mw
                ? mw.call(this, rq, rs, tick(i + 1))
                : mw
        }
        return tick(0)()
    }
}

/**
 * @param  { ...(MWare | MWare[]) } middleware
 * @return { MWare }
 */
export function composeDev(...middleware) {
    const mware = middleware.flat()
    /**
     * @param { Req } rq
     * @param { Res } rs
     * @param { Next } [next]
     */
    return async function (rq, rs, next) {
        /**
         * @param  { number } i
         */
        const tick = async i => {
            const mw = i === mware.length
                ? next
                : mware[ i ]

            if (!mw) return

            let done, called
            const proxy = async () => {
                called && Fail.raise(500, 'next called multiple times')
                called = 1

                try {
                    return await tick(i + 1)
                }
                finally {
                    done = 1
                }
            }
            const rt = await mw.call(this, rq, rs, proxy)

            called && !done && Fail.raise(500, 'mware resolved before downstream')
            return rt
        }
        return tick(0)
    }
}

export default process.env.NODE_ENV === 'production'
    ? composeProd
    : composeDev

/**
 * @typedef { import('garage').Next } Next
 * @typedef { import('garage').MWare } MWare
 * @typedef { import('garage').Req } Req
 * @typedef { import('garage').Res } Res
 */
