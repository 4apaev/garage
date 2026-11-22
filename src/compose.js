// @ts-check

/**
 * @param  { ...(MWare | MWare[]) } middleware
 * @return { MWare }
 */
export default function compose(...middleware) {
    const mware = middleware.flat()
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
 * @typedef { import('garage').Next } Next
 * @typedef { import('garage').MWare } MWare
 * @typedef { import('garage').Req } Req
 * @typedef { import('garage').Res } Res
 */
