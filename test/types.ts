import Garage, {
    type MWare,
    Req,
    Res,
    compose,
    use,
} from 'garage'

import * as garage              from 'garage/garage'
import Sync, { type Payload   } from 'garage/sync'
import { Fail, Is }             from 'garage/util'
import { MIME, STATUS } from 'garage/constants'
import { fromPath             } from 'garage/mime'
import composeSubpath           from 'garage/compose'
import useSubpath               from 'garage/use'

const app: Garage = new Garage({ name: 'typed' })
const mw: MWare = (_rq: Req, rs: Res) => rs.send(200, 'ok')

app.get('/x', mw)

const defaulted: Garage = new garage.default
const created: ReturnType<typeof Garage.create> = Garage.create()
const payload: Promise<Payload<{ ok: true }>> = Sync.get<{ ok: true }>('/').end()

const json: 'application/json' = MIME.json
const html: 'text/html' = MIME[ 'text/html' ]
const notFound: 'not found' = STATUS[ 404 ]

const composed: MWare = compose(mw)
const composedSubpath: MWare = composeSubpath(mw)
const used: MWare = use('GET', '/x', mw)
const usedSubpath: MWare = useSubpath('POST', mw)
const mime = fromPath('/tmp/file.json')
const fail: Fail = Fail.of(404)
const isFail: boolean = Fail.is(fail)
const isString: boolean = Is.s('x')

import createWss, { createFrameParser, encodeFrame, OP, type Wss } from 'garage/mw/ws'
import { is } from 'garage/mime'
import { A, O } from 'garage/util'

const wss: Wss<{ id: string }> = createWss({ maxPayload: 1024, authenticate: () => ({ id: 'x' }) })
const upgraded: Promise<void> = wss.handleUpgrade(null as never, null as never)
wss.each((meta, soc) => meta.id && wss.send(soc, encodeFrame('hi', { opcode: OP.text })))
createFrameParser(f => f.payload, { maxPayload: 8, onOversize: () => {} })

const route: MWare = async (rq, rs) => {
    const tags: string | string[] = rq.query.tag
    await rs.file(new URL('file:///tmp/x.txt'))
    return rs.json(200, { tags, json: is('json', rq.type) })
}

const bag = O.o
bag.anything = 1
const nums: A<number> = A.of(1, 2, 3)
const prodComposed: MWare = composeSubpath(mw, [ route ])
