import { describe, it } from 'node:test'
import { equal } from 'node:assert/strict'

import * as pkg from 'garage'
import * as local from '../src/index.js'

describe('index', () => {
    it('re-exports the public api from the package root', () => {
        equal(pkg.Garage, local.Garage)
        equal(pkg.Router, local.Router)
        equal(pkg.Req, local.Req)
        equal(pkg.Res, local.Res)
        equal(pkg.create, local.create)
        equal(pkg.compose, local.compose)
        equal(pkg.composeDev, local.composeDev)
        equal(pkg.composeProd, local.composeProd)
        equal(pkg.use, local.use)
    })

    it('keeps documented package subpaths importable', async () => {
        const compose = await import('garage/compose')
        const garage  = await import('garage/garage')
        const mime    = await import('garage/mime')
        const sync    = await import('garage/sync')
        const use     = await import('garage/use')
        const util    = await import('garage/util')

        equal(compose.default, local.compose)
        equal(garage.default, local.Garage)
        equal(mime.MIME.json, 'application/json')
        equal(sync.default.name, 'Sync')
        equal(use.default, local.use)
        equal(util.Is.s('x'), true)
    })
})
