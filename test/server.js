import { once } from 'node:events'

// shared real-server helpers: not itself a *.spec.js file, so it's outside
// `npm test`'s glob - import from spec files that need a real listening
// garage app instead of mocks.

// starts a real garage server on an ephemeral port and returns its base url.
export async function start(app) {
    const table = console.table
    console.table = () => {}

    app.listen(0)
    await once(app.server, 'listening')

    console.table = table
    return `http://127.0.0.1:${ app.server.address().port }`
}

// closes the server and drops any idle keep-alive sockets left open - fetch's
// keep-alive agent, or a hijacked upgrade socket, can otherwise leave
// server.close()'s callback waiting forever.
export function stop(app) {
    return new Promise(ok => {
        app.server.close(ok)
        app.server.closeAllConnections()
    })
}
