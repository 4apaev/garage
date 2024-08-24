process.loadEnvFile()

import Http from 'node:http'

import reader from './src/mw/reader.js'
import logger from './src/mw/logger.js'

import * as User from './src/routes/user.js'
import * as Post from './src/routes/post.js'

const {
    APP_PORT,
    APP_NAME,
} = process.env

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const server = Http.createServer(handle)

server.listen(process.env.APP_PORT, () => {
    console.log(APP_NAME, 'listens on',  APP_PORT)
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function handle(rq, rs) {
    rq.URL = new URL(rq.url, 'file:')

    logger(rq, rs)

    if ('PUT POST DELETE'.includes(rq.method))
        await reader(rq, rs)

    switch (`${ rq.method }:${ rq.URL.pathname }`) {

        case 'GET:/api/user': return User.get(rq, rs)
        case 'PUT:/api/user': return User.update(rq, rs)
        case 'POST:/api/user': return User.create(rq, rs)
        case 'DELETE:/api/user': return User.remove(rq, rs)

        case 'GET:/api/v1/user': return User.v1.get(rq, rs)
        case 'PUT:/api/v1/user': return User.v1.update(rq, rs)
        case 'POST:/api/v1/user': return User.v1.create(rq, rs)
        case 'DELETE:/api/v1/user': return User.v1.remove(rq, rs)

        case 'DELETE:/api/v1/post': return Post.v1.remove(rq, rs)
        case 'POST:/api/v1/post': return Post.v1.create(rq, rs)
        case 'PUT:/api/v1/post': return Post.v1.update(rq, rs)
        case 'GET:/api/v1/post': return Post.v1.get(rq, rs)

        case 'DELETE:/api/post': return Post.remove(rq, rs)
        case 'POST:/api/post': return Post.create(rq, rs)
        case 'PUT:/api/post': return Post.update(rq, rs)
        case 'GET:/api/post': return Post.get(rq, rs)

        default: return rs.end(Http.STATUS_CODES[ rs.statusCode = 403 ])
    }
}
