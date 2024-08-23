import * as Fs from 'node:fs'
import sanitize from '../util/sanitize.js'
import { MIME, fromPath } from '../util/mime.js'

export default function statiq(ctx) {
    if (ctx.method != 'GET')
        return end(ctx.rs, 405)

    const url = sanitize(
        ctx.url,
        ctx.conf.dir,
        ctx.conf.stub,
    )

    Fs.stat(url, (e, stat) => {
        if (e)
            return end(ctx.rs, 404)

        if (!stat.isFile())
            return end(ctx.rs, 403)

        ctx.rs.status = 200
        ctx.length = stat.size
        ctx.type = fromPath(url.pathname, MIME.txt)

        Fs.createReadStream(url)
            .pipe(ctx.rs)
    })
}

function end(rs, code, data) {
    rs.statusCode = code
    rs.end(data)
}
