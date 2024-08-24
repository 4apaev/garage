import Fail from '../util/fail.js'

/** @typedef { import('core.js').IRequest } Req */
/** @typedef { import('core.js').IResponse } Res */
/** @typedef { import('core.js').Handler } Handler */
/**
* @param { Handler[] } args
* @return { Handler }
*/
export default function compose(args) {
    /**
    * @param { Req } rq
    * @param { Res } rs
    * @return { Promise<any> }
    */
    return function handler(rq, rs) {
        let prev = -1

        /**
         * @param { number  } i
         * @return { Promise<any> }
         */
        const emit = i => {
            if (i <= prev || i > args.length)
                return Fail.deny('next called multiple times', { cause: 500 })

            const cb = args[ prev = i ]

            try {
                return Promise.resolve(cb
                    ? cb.call(this, rq, rs, () => emit(i + 1))
                    : this)
            }
            catch (cause) {
                return Fail.deny(500, { cause })
            }
        }
        return emit(prev + 1)
    }
}
