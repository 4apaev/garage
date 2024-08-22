import Fail from '../util/fail.js'

export default function compose(args) {

    return function handler(...a) {
        let prev = -1

        const emit = i => {
            if (i <= prev || i > args.length)
                return Fail.deny('next called multiple times', 500)

            const cb = args[ prev = i ]

            try {
                return Promise.resolve(cb
                    ? cb.apply(this, a.concat(() => emit(i + 1)))
                    : this)
            }
            catch (cause) {
                return Fail.deny(500, { cause })
            }
        }
        return emit(prev + 1)
    }
}
