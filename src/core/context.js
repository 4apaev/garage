import { createServer } from 'node:http'

import use from './use.js'
import compose from './compose.js'

import Req from './request.js'
import Res from './response.js'

export default class App {

    mw = []
    use(...a)  { this.mw.push(use(...a)) }
    get(...a)  { this.use('GET', ...a)   }
    put(...a)  { this.use('PUT', ...a)   }
    del(...a)  { this.use('DEL', ...a)   }
    post(...a) { this.use('POST', ...a)  }

    upgrade(rq, soc, head) {
        soc.write(
            `HTTP/1.1 101 Web Socket Protocol Handshake
                Connection: Upgrade
                Upgrade: WebSocket

            `.replace(/ *\r?\n */g, '\r\n'),
        )
        soc.pipe(soc) // echo back
    }

    init() {
        const handler = compose(this.mw)
        const server = createServer((rq, rs) => {
            handler.call(
                this,
                new Req(rq),
                new Res(rs),
            )
        })

        server.on('upgrade', this.upgrade)
    }
}

console.clear()

const { raw } = String

function test(t, s) {

    process.stdout.write(test.tmpl
        .replace('%s', t)
        .replace('%s', s))
    process.stdout.write('\n================================================\n')

    console.log(test.tmpl, 'head', s)

    console.log(test.tmpl, 'split', s.split(/\r\n/g))
    console.log(test.tmpl, 'match', s.match(/\r\n/g))
}

test.w = (s, ...a) => {
    '\n================================================\n'
}
test.div = '\n================================================\n'

test.tmpl = `
[[[[[[[---------------- %s ----------------]]]]]]]
................................................
%s
................................................
`

const H = {
    http: raw`HTTP/1.1 101 Web Socket Protocol Handshake`,
    conn: `Connection: Upgrade`,
    up: `Upgrade: WebSocket`,
}

test('trim + repl', raw`
    ${ H.http }
    ${ H.conn }
    ${ H.up }

`.trimStart().replace(/ *\r?\n */g, '|\r\n|'))

test('array + join', [
    H.http,
    H.conn,
    H.up,
    '',
    '',
].join('\r\n'))
