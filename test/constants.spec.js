import { describe, it } from 'node:test'
import * as assrt       from 'node:assert/strict'

import {
    HEADER,
    METHOD,
    MIME,
    STATUS,
    STATUS_ERR,
} from '../src/constants.js'

describe('constants', () => {
    it('exports method lookup as a frozen array with a has helper', () => {
        assrt.equal(Array.isArray(METHOD), true)
        assrt.equal(Object.isFrozen(METHOD), true)
        assrt.equal(Object.getPrototypeOf(METHOD), null)

        assrt.equal(METHOD.includes, undefined)
        assrt.equal(METHOD.has('GET'), true)
        assrt.equal(METHOD.has('get'), false)
        assrt.equal(METHOD.has('BREW'), false)

        assrt.throws(() => { METHOD[ 0 ] = 'BREW' }, TypeError)
        assrt.throws(() => { METHOD.extra = 'nope' }, TypeError)
    })

    it('groups methods by body/empty, and keeps the sets usable', () => {
        assrt.equal(METHOD.body.has('POST'), true)
        assrt.equal(METHOD.body.has('GET'), false)

        assrt.equal(METHOD.empty.has('GET'), true)
        assrt.equal(METHOD.empty.has('POST'), false)

        assrt.doesNotThrow(() => METHOD.body.has('PUT')) // guards against nulled Set.prototype
    })

    it('freezes constants recursively', () => {
        for (const x of [ HEADER, STATUS, STATUS_ERR, MIME ])
            assertDeepFrozen(x)

        assertDeepFrozen(METHOD.has)
    })

    it('rejects mutations at the public constant surfaces', () => {
        assrt.throws(() => { MIME.json = 'text/plain' }, TypeError)
        assrt.throws(() => { MIME.mjs = 'text/plain' }, TypeError)
        assrt.throws(() => { HEADER.ACCEPT.ENCODING = 'gzip' }, TypeError)
        assrt.throws(() => { STATUS[ 404 ] = 'gone' }, TypeError)
        assrt.throws(() => { STATUS_ERR[ 404 ] = 'lost' }, TypeError)
    })

    it('keeps generated mime aliases and syscall aliases intact', () => {
        assrt.equal(MIME.json, 'application/json')
        assrt.equal(MIME.map, 'application/json')
        assrt.equal(MIME.jpeg, 'image/jpeg')
        assrt.equal(MIME.svgz, 'image/svg+xml')
        assrt.equal(MIME.buffer, 'application/octet-stream')
        assrt.equal(MIME.woff2, 'application/font-woff2')
        assrt.equal(MIME[ 'text/html' ], 'text/html')
    })
})

function assertDeepFrozen(x, seen = new Set) {
    if (Object(x) !== x || seen.has(x))
        return

    seen.add(x)

    assrt.equal(Object.isFrozen(x), true)
    assrt.equal(Object.getPrototypeOf(x), null)

    for (const k in x)
        assertDeepFrozen(x[ k ], seen)
}
