// @ts-check
import { Fail } from './util.js'

/**
 * @param  { MWare[] } mware
 * @return { MWare   }
 */
export function composeProd(mware) {
    /**
     * @param  { Req } rq
     * @param  { Res } rs
     * @param  { Next } next
     */
    return async function (rq, rs, next) {
        /**
         * @param  { number } i
         */
        const dispatch = i => async () => {
            const mw = i === mware.length
                ? next
                : mware[ i ]

            if (!mw)
                return

            return mw.call(this, rq, rs, dispatch(i + 1))
        }

        return dispatch(0)()
    }
}

/**
 * @param  { ...(MWare | MWare[]) } middleware
 * @return { MWare }
 */
export function composeDev(...middleware) {
    const mware = middleware.flat()
    /**
     * @param  { Req } rq
     * @param  { Res } rs
     * @param  { Next } [next]
     */
    return async function (rq, rs, next) {
        /**
         * @param  { number } i
         */
        const dispatch = async i => {
            const mw = i === mware.length
                ? next
                : mware[ i ]

            if (!mw) return

            let done, called
            const proxy = async () => {
                called && Fail.raise(500, 'next called multiple times')
                called = 1

                try {
                    return await dispatch(i + 1)
                }
                finally {
                    done = 1
                }
            }
            const rt = await mw.call(this, rq, rs, proxy)

            called && !done && Fail.raise(500, 'mware resolved before downstream')
            return rt
        }
        return dispatch(0)
    }
}

// const compose = process.env.NODE_ENV === 'production'
//     ? composeProd
//     : composeDev

export default process.env.NODE_ENV === 'production'
    ? composeProd
    : composeDev

/**
 * @typedef { import('./types.js').Next      } Next
 * @typedef { import('./types.js').MWare     } MWare
 * @typedef { import('./garage.js').Req      } Req
 * @typedef { import('./garage.js').Res      } Res
 */
