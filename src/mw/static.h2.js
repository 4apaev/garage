import Https from 'node:http2'
import sanitize from '../util/sanitize.js'
import * as Icons from './mw/favico.js'

import {
    MIME,
    fromPath,
} from '../util/mime.js'

const CT = Https.constants.HTTP2_HEADER_CONTENT_TYPE
const PATH = Https.constants.HTTP2_HEADER_PATH
const STATUS = Https.constants.HTTP2_HEADER_STATUS
const PARENT = 'parent'

////////////////////////////////////////////////////////////////////////////////////////////////
/* {
        key: Fs.readFileSync(key),
        cert: Fs.readFileSync(cert),
    } */

Https.createServer

export default function init(config) {
    const {
        key,
        cert,
        files = {},
        stub = {},
        dir = process.cwd(),
    } = config ?? {}

    if (typeof key != 'string')
        throw new Error('Missing Secure Server Key')

    if (typeof cert != 'string')
        throw new Error('Missing Secure Server Certificate')

    const server = Https.createSecureServer({ key, cert })

    server.on('stream', router({ dir, stub, files }))
    return server
}

function router(ctx) {
    return (soc, heads) => {
        let path = heads[ PATH ]

        if (path.startsWith('/sse'))
            return sse(soc, ctx, path)

        if (path.startsWith('/favicon'))
            return fav(soc, ctx, path)

        sendFile(soc, ctx, path)

        if (path in ctx.files) {
            ctx.files[ path ].forEach(k =>
                pushStream(soc, ctx, k))
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////

function sse(soc) {
    soc.respond(sse.head)
    setInterval(() =>
        soc.write(`data: ${ new Date }\n\n`), 30000)
}

function fav(soc) {
    soc.respond(fav.head)
    soc.end(Icons.fav)
}

////////////////////////////////////////////////////////////////////////////////////////////////

function sendFile(soc, ctx, path) {
    const fl = sanitize(
        path,
        ctx.dir,
        ctx.stub,
    )
    soc.respondWithFile(
        fl,
        set(CT, fromPath(fl, MIME.txt)),
        onError(soc),
    )
}

function pushStream(soc, ctx, path) {
    soc.pushStream(
        set(PATH, path),
        set(PARENT, soc.id),
        (e, ps) => {
            if (e) throw e
            sendFile(ps, ctx, path)
        },
    )
}

function onError(soc) {
    return {
        onError(e) {
            console.error('[ error ]', e)
            try {
                soc.respond(set(STATUS, e.code === 'ENOENT'
                    ? 404
                    : 500))
            }
            catch (e) {
                console.error('[ error: Try ]', e)
            }
            soc.end()
        },
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////

function set(k, v, o = {}) {
    o[ k ] = v
    return o
}

sse.head = set(CT, MIME.sse, set(STATUS, 200))
fav.head = set(CT, MIME.ico, set(STATUS, 200))
