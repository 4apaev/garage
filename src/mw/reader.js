export const withBody = new Set([
    'PUT',
    'POST',
    'DELETE',
])

/**
 * @param { import('http').IncomingMessage } rq
 * @param { import('http').ServerResponse } rs
 */
export default async function read(rq, rs) {

    if (!withBody.has(rq.method))
        return

    let body = ''
    rq.setEncoding('utf8')

    for await (const chunk of rq)
        body += chunk

    let type = rq.headers[ 'content-type' ] ?? ''

    if (type.includes('application/json')) {
        try {
            rq.body = JSON.parse(body)
        }
        catch (e) {
            rs.statusCode = 400
        }
    }
    else {
        rq.body = body
    }
}
