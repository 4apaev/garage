import WebSocket from 'ws'
import {
    EventEmitter,
    createEventEmitter,
} from 'events'

import { each } from '../util/each.js'

export class WS extends EventEmitter {
    ws
    cmd = new Map
    port = 3000
    lastCommands = {}

    constructor(port) {
        super()

        if (Number.isInteger(+port))
            this.port = +port

        this.ws = new WebSocket.Server({ port: this.port })
    }

    stop() {
        this.ws.close()
        this.removeAllListeners()
    }

    start() {
        this.ws.on('connection', soc => {



            const tuples = []


            each(this.lastCommands, (command, payload) =>
                tuples.push({ command, payload }), tuples)

            soc.send(JSON.stringify(tuples))
            soc.on('message', msg =>
                this.emit('message', msg, soc))
        })
    }

    broadcast(msg, { skip } = {}) {
        for (const { command, payload } of msg)
            this.lastCommands[ command ] = payload

        const str = JSON.stringify(msg)
        for (const client of this.ws.clients) {
            skip !== client
            && client.readyState === WebSocket.OPEN
            && client.send(str)
        }
    }

    add(e, cb) {}     // : AddListener<Events>
    fire(e, ...a) {}  // : (message: any, { skip }?: { skip?: WebSocket }) => void
}


// : WebSocketServer
export default function createWebSocketServer() {
    let ws                                     // : WebSocket.Server
    const lastCommands = {}                    // :{[key:string]:string}
    const eventEmitter = createEventEmitter()  //createEventEmitter<Events>()

    return {
        get port() {
            return ws.options.port
        },

        addListener: eventEmitter.addListener,

        broadcast(message, { skip } = {}) {
            for (const { command, payload } of message)
                lastCommands[ command ] = payload

            const stringifiedMessage = JSON.stringify(message)
            for (const client of ws.clients) {
                if (skip !== client && client.readyState === WebSocket.OPEN)
                    client.send(stringifiedMessage)

            }
        },

        start(port = 3000) {
            ws = new WebSocket.Server({ port })

            ws.on('connection', wsoc => {
                const tuples = Object.entries(lastCommands).map(([ k, v ])=>({ command: k, payload: v }))
                tuples.length && wsoc.send(JSON.stringify(tuples))


                wsoc.on('message', message => {
                    eventEmitter.emit('message', message, wsoc)
                })
            })
        },
        stop() {
            eventEmitter.removeAllListeners()
            ws.close()
        },
    }
}


// type Events = {
//   message: (
//     message: string | Buffer | ArrayBuffer | Buffer[],
//     websocket: WebSocket
//   ) => void
// }

// export interface WebSocketServer {
//   /**
//    * The port of the server.
//    */
//   readonly port: number

//   /**
//    * Add a listener to the websocket server.
//    */
//   readonly addListener: AddListener<Events>
//   /**
//    * Send a message to all connected clients.
//    */
//   readonly broadcast: (message: any, { skip }?: { skip?: WebSocket }) => void
//   /**
//    * Start the websocket server.
//    */
//   readonly start: (port?: number) => void
//   /**
//    * Stop the websocket server.
//    */
//   readonly stop: () => void
// }
