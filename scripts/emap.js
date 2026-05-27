#!/usr/bin/env node

import { resolve } from 'node:path'
import { constants } from 'node:http2'
import { writeFileSync } from 'node:fs'
import { getSystemErrorMap } from 'node:util'

const HD = []
const ST = []
const SE = []
const MT = []
const EM = Array.from(getSystemErrorMap(), ([ e, [ k, m ]]) => {
    let key  = `${ k }`.padEnd(16)
    let prop = `'${ k }'`.padEnd(18)
    let code = String(e).padEnd(6)
    let pos = code.slice(1)
    return `SYSERR.${
        key  }  = SYSERR[ ${
        code }] = SYSERR[ ${
        pos  }] = { __proto__: null, errno: ${
        code }, key: ${
        prop }, msg: '${
        m }' }`
})

for (let [ k, x ] of Object.entries(constants)) {
    if (k.startsWith('HTTP2_METHOD_'))
        MT.push(`'${ x }',`)

    if (k.startsWith('HTTP2_HEADER_'))
        HD.push(`${ k.slice(13).padEnd(32) }: '${ x }',`)

    else if (k.startsWith('HTTP_STATUS_')) {
        let key = k.slice(12)
        let msg = key.toLowerCase().replaceAll('_', ' ')

        x > 399 && SE.push(`${ x }: '${ msg }',`)
        ST.push(`${ key.padEnd(32) }: ${ x }, ${ x }: '${ msg }',`)
    }
}

const LFT = '\n    '
const CODE = `
const SYSERR = Object.create(null)
${ EM.join('\n') }

export const METHOD = new Set([
    ${ MT.join(LFT) }
])

export const HEADER = {
    ${ HD.join(LFT) }
    __proto__: null,
}

export const STATUS = {
    ${ ST.join(LFT) }
    __proto__: null,
}

export default {
    ${ SE.join(LFT) }
    __proto__: null,
}

`

writeFileSync(
    resolve(import.meta.dirname, '../src/errors.js'),
    CODE.trim()
)