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
import { MIME, STATUS, SYSERR } from 'garage/constants'
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
const enoent: 'ENOENT' = SYSERR.ENOENT.key

const composed: MWare = compose(mw)
const composedSubpath: MWare = composeSubpath(mw)
const used: MWare = use('GET', '/x', mw)
const usedSubpath: MWare = useSubpath('POST', mw)
const mime = fromPath('/tmp/file.json')
const fail: Fail = Fail.of(404)
const isFail: boolean = Fail.is(fail)
const isString: boolean = Is.s('x')
