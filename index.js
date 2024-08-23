process.loadEnvFile()

import Http from 'node:http'

import reader from './src/mw/reader.js'
import logger from './src/mw/logger.js'

import * as User from './src/routes/user.js'

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
    const url = rq.URL = new URL(rq.url, 'file:')
    const method = rq.method

    logger(rq, rs)

    if (method !== 'GET' || method !== 'HEAD')
        await reader(rq, rs)

    if (rs.statusCode === 400)
        return rs.end(Http.STATUS_CODES[ rs.statusCode ])

    if (url.pathname.startsWith('/api')) {
        if (url.pathname.startsWith('/api/user'))
            return handleRoute(rq, rs, User)
    }

    rs.statusCode = 403
    rs.end(Http.STATUS_CODES[ rs.statusCode ])
}

function handleRoute(rq, rs, Route) { // eslint-disable-next-line
         if (rq.method === 'POST')    Route.create(rq, rs)
    else if (rq.method === 'PUT')     Route.update(rq, rs)
    else if (rq.method === 'DELETE')  Route.remove(rq, rs)
    else if (rq.method === 'GET')     Route.get(rq, rs)
    else
        rs.end(Http.STATUS_CODES[ rs.statusCode = 405 ])
}

/*
 * @template { View } T
 * @template { any[] } U
 * @param    { new(...args: U) => T } ViewClass
 * @param    { U } [data]
 * @return   { T }
 */
// function createView(ViewClass, ...data) {
//     return new ViewClass(...data)
// }
