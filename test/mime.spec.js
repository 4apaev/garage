import { describe, it } from 'node:test'
import { equal } from 'node:assert/strict'

import {
    MIME,
    extname,
    fromHead,
    fromPath,
    get,
    is,
} from '../src/mime.js'

describe('mime', () => {
    const flb = 'fallback'
    const txt = 'text/plain'
    const json = 'application/json'

    it('resolves aliases and falls back for unknown extensions', () => {
        equal(get('json'), json)
        equal(get(json), json)
        equal(get('wat', flb), flb)
        equal(MIME.txt, txt)
    })

    it('extracts extensions without crossing path boundaries or dotfiles', () => {
        equal(extname('file.txt'), 'txt')
        equal(extname(new URL('file:///tmp/app.css?x=1')), 'css')
        equal(extname('/foo.bar/baz'), '')
        equal(extname('/tmp/.env'), '')
        equal(extname('/tmp/a.'), '')
        equal(extname('C:\\tmp\\foo.bar\\baz'), '')
    })

    it('resolves mime types from paths and headers', () => {
        equal(fromPath('/tmp/demo.html'), 'text/html')
        equal(fromPath('/tmp/demo.unknown', flb), flb)
        equal(fromHead({ 'content-type': txt }), txt)

        equal(fromHead(new Headers({ 'content-type': json })), json)
        equal(fromHead(new Map([[ 'content-type', json ]])), json)
        equal(fromHead({ get: () => json }, flb), json)
        equal(fromHead(null, flb), flb)
    })

    it('compares expected types against header values with parameters', () => {
        equal(is('json', 'application/json; charset=utf-8'), true)
        equal(is(txt, { get: () => 'text/plain, */*' }), true)
        equal(is('html', txt), false)
        equal(is('json'), false)
    })
})
