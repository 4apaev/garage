import Fs from 'fs'
import Pt from 'path'
import {
    pathToFileURL,
} from 'url'

const cwd = process.cwd()
export const Mim = Object.create(null)

/**
 * @param { import('http').IncomingMessage } rq
 * @param { import('http').ServerResponse } rs
 */
export default function statiq(rq, rs) {
    if (rq.method != 'GET')
        return rs.fail(405)

    if (rq.path == '/')
        return rs.send(200, html(process.uptime()))

    const url = Pt.join(cwd, rq.path)

    Fs.stat(url, (e, stat) => {
        if (e)
            return rs.fail(404)

        if (!stat.isFile())
            return rs.fail(403)

        rs.status = 200
        rs.length = stat.size
        rs.type = Mim[ Pt.extname(rq.path).slice(1) ] ?? Mim.txt
        Fs.createReadStream(url).pipe(rs)
    })
}


function html(uptime) {
    return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport"    content="width=device-width, initial-scale=1" />
    <meta name="description" content="user service">
    <title>🐔 users</title>
  </head>
  <body>
    <h1>🐔 users</h1>
    <h2>uptime: ${ uptime }</h2>
  </body>
</html>`
}


Mim.txt   = 'text/plain'
Mim.html  = 'text/html'
Mim.css   = 'text/css'
Mim.less  = 'text/less'
Mim.csv   = 'text/csv'
Mim.jsx   = 'text/jsx'
Mim.md    = 'text/x-markdown'
Mim.csv   = 'text/csv'
Mim.jsx   = 'text/jsx'
Mim.yml   = 'text/yaml'
Mim.yaml  = 'text/yaml'
Mim.xml   = 'text/xml'
Mim.gif   = 'image/gif'
Mim.png   = 'image/png'
Mim.jpg   = 'image/jpeg'
Mim.jpeg  = 'image/jpeg'
Mim.webp  = 'image/webp'
Mim.svg   = 'image/svg+xml'
Mim.svgz  = 'image/svg+xml'
Mim.ico   = 'image/x-icon'
Mim.woff  = 'font/woff'
Mim.otf   = 'font/opentype'
Mim.zip   = 'application/zip'
Mim.tar   = 'application/zip'
Mim.bdf   = 'application/x-font-bdf'
Mim.pcf   = 'application/x-font-pcf'
Mim.snf   = 'application/x-font-snf'
Mim.ttf   = 'application/x-font-ttf'
Mim.bin   = 'application/octet-stream'
Mim.dmg   = 'application/octet-stream'
Mim.iso   = 'application/octet-stream'
Mim.img   = 'application/octet-stream'
Mim.js    = 'application/javascript'
Mim.json  = 'application/json'
Mim.form  = 'multipart/form-data'
Mim.query = 'application/x-www-form-urlencoded'
Mim.sse   = 'text/event-stream'
