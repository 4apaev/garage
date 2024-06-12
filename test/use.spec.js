// import { it, describe } from 'node:test'
// import { strictEqual as eq, deepStrictEqual as equal } from 'node:assert'

import use from '../src/core/use.js'
import compose from '../src/core/compose.js'

const log = console.log

const bff = []
const handler = compose([
    use(async (rq, rs, next) => {
        bff.push('A >>')
        await next()
        log(rs.status, rq.method, rq.url)
        bff.push('A <<')
    }),

    use('GET', async (rq, rs, next) => {
        bff.push('B >>')
        await next()
        bff.push('B <<')
    }),

    use('POST', '/two/:route/:action', (rq, rs) => {
        bff.push('C >>')
        log('post /two', rq)
        bff.push('C <<')
    }),

    // TODO: handle multiple methods in one check
    // TODO: handle multiple urls in one check
    use(
        'POST',
        'PUT',

        '/:prfx/:route/:action',
        '/two/:dir/:id',

        async (rq, rs, next) => {
            bff.push('D:1 >>')
            rs.body = '[DATA]'
            await next()
            log('post /two', rq)
            bff.push('D:1 <<')
        },

        (rq, rs) => {
            bff.push('D:2 >>')
            rs.status = 200
            rs.end = true
            log('post /one', rq)
            bff.push('D:2 <<')
        },
    ),
])

let rq = {
    url: '/two/token/update',
    method: 'PUT',
    status: -1,
}
let rs = {}

await handler(rq, rs)
// await sleep(100)

log('BFF', bff)
log('REQ', rq)
log('RES', rs)

function sleep(ms) {
    return new Promise(ok => setTimeout(ok, ms))
}

/*

1. blur       : 16px
2. hue-rotate : 45deg
3. brightness : 50%
4. grayscale  : 50%
5. saturate   : 50%
6. opacity    : 50%
7. invert     : 50%
8. sepia      : 50%

<img src="data:image/png;base64 { B64 }" syle="
    min-width : 100%; max-width : 100%;
    min-height: 100%; max-height: 100%;
    filter: grayscale(100%)
    filter: blur(16px)
    filter: hue-rotate(45deg)
    filter: brightness(50%)
    filter: grayscale(50%)
    filter: saturate(50%)
    filter: opacity(50%)
    filter: invert(50%)
    filter: sepia(50%)"
/>

*/
