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
        soc.write('HTTP/1.1 101 Web Socket Protocol Handshake\r\n')
        soc.write('upgrade: WebSocket\r\n')
        soc.write('connection: Upgrade\r\n')
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
