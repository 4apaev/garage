import EventEmitter from 'node:events'
import Is from './is.js'
import {
    pro,
    use,
} from './use.js'

Symbol.break = Symbol.for('ƒ.break')
Symbol.ignored = Symbol.for('ƒ.ignored')

const Gfx = pro(pro(pro((async function* () { })())))

use(Gfx, {
    async * map(fn) {
        for await (let value of this)
            yield fn(value)
    },

    async * filter(fn) {
        for await (let value of this) {
            if (fn(value))
                yield value
        }
    },

    async * flatMap(fn) {
        for await (let value of this) {
            /**/ if (Is.i.async(value)) for await (let x of value) yield await fn(x)
            else if (Is.i(value))       for (let x of value)       yield fn(x)
            else                                                   yield value
        }
    },

    async * flatMapLatest(fn) {
        for await (let v of this.map(last(fn))) {
            if (v !== Symbol.ignored)
                yield v
        }
    },

    async * throttle(ms) {
        let relay = 1 /* convey carry bear relay pipe */
        for await (let v of this) {
            if (relay) {
                yield v
                relay = 0
                await sleep(ms)
                relay = 1
            }
        }
    },

    async * distinctUntilChanged() {
        let ref = Symbol()
        for await (let v of this) {
            if (v !== ref)
                yield ref = v
        }
    },
})

export async function* fromEvent(e, node) {
    while (1)
        yield await once(e, node)

}

export function last(fn) {
    let seen = Symbol.ignored
    return async function () {
        const curr = seen = fn.apply(this, arguments)
        const x = await curr
        return curr === seen
            ? x
            : Symbol.ignored
    }
}

export function once(e, node) {
    return new Promise(ok => {
        const handler = e => {
            off(node, e, handler)
            ok(e)
        }
        on(node, e, handler)
    })
}

function on(ctx, event, handler) {
    /**/ if ('function' == typeof ctx?.on)               ctx.on(event, handler)
    else if ('function' == typeof ctx?.addListener)      ctx.addListener(event, handler)
    else if ('function' == typeof ctx?.addEventListener) ctx.addEventListener(event, handler)
    else console.warn('[Missing Method]. Cannot add event listener for "%s"', event)
    return  ctx
}

function off(ctx, event, handler) {
    /**/ if ('function' == typeof ctx?.off)                 ctx.off(event, handler)
    else if ('function' == typeof ctx?.removeListener)      ctx.removeListener(event, handler)
    else if ('function' == typeof ctx?.removeEventListener) ctx.removeEventListener(event, handler)
    else console.warn('[Missing Method]. Cannot remove event listener for "%s"', event)
    return  ctx
}

export function sleep(ms) {
    return new Promise(ok => setTimeout(ok, ms ?? 0))
}

export function Co(gfx, ...args) {
    const gen = gfx(...args)
    const end = x => x.done
        ? Symbol.break
        : x.value

    return Is.f.async(gfx)
        ? (...a) => end(gen.next(...a))
        : (...a) => gen.next(...a).then(end)

}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(() => {

    // import('node:events').then()

    async function* examplePlain(e, node) {
        let last
        let tooSoon = 0

        for await (let { target: { value: v }} of fromEvent(e, node)) {

            if (!v) continue
            if (tooSoon) continue
            if (v === last) continue

            last = v

            try {
                let rs = await fetch('/autocomplete/' + v) // misses `last`
                yield await rs.json()

                tooSoon = 1
                await sleep(500)
                tooSoon = 0
            }
            catch (e) {
                console.error(e)
            }
        }
    }

    async function exampleUsingAsyncProtoMethods(e, node) {
        fromEvent(e, node)
            .map(e => e.target.value)
            .filter(Boolean)
            .throttle(500)
            .distinctUntilChanged()
            .flatMapLatest(x => fetch('/autocomplete/' + x))
            .then(r => r.json())

    }

    class Ctx extends EventEmitter {

        get cords() {
            return Math.r
        }

        click() {
            this.emit('click', this)
        }
    }

    const ctx = new Ctx

    exampleUsingAsyncProtoMethods('some', ctx)
})()

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
