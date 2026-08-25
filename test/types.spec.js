import Fs from 'node:fs/promises'

import { describe, it } from 'node:test'
import { deepEqual } from 'node:assert/strict'

/*
    src/types.d.ts is hand-written, not generated from src/*.js, so it can
    silently drift from what the runtime actually exports (it has, more than
    once). this doesn't type-check the shape of each export - tsc already
    does that internally - it only makes sure every `declare module 'garage*'`
    block names the same set of value exports its real module has, no more
    and no fewer.
*/
describe('types', () => {
    it('declares the same value exports the runtime modules actually have', async () => {
        const dts = await read('../src/types.d.ts')

        const declared = parseDeclaredModules(dts)
        const runtime  = await runtimeModuleMap()

        deepEqual(
            [ ...declared.keys() ].sort(),
            [ ...runtime.keys() ].sort(),
            'package.json "exports" and types.d.ts "declare module" blocks list different subpaths')

        for (const [ name, url ] of runtime) {
            const mod  = await import(url)
            const have = Object.keys(mod)
            const want = declared.get(name)

            deepEqual(
                [ ...want ].sort(),
                have.sort(),
                `declare module '${ name }' no longer matches the runtime exports of ${ url }`)
        }
    })
})

/*
    walks src/types.d.ts and collects, per `declare module 'garage...'` block,
    the names it exports as values (skips types/interfaces/namespaces, which
    have no runtime presence to drift against).
*/
function parseDeclaredModules(src) {
    const lines = src.split('\n')
    const modules = new Map
    let mod, names

    for (let i = 0; i < lines.length; i++) {
        const line = lines[ i ]

        if (mod == null) {
            const open = line.match(/^declare module '(garage(?:\/\S+)?)' \{$/)
            if (open) {
                mod = open[ 1 ]
                names = new Set
            }
            continue
        }

        if (line === '}') {
            modules.set(mod, names)
            mod = void 0
            continue
        }

        if (!line.startsWith('    export')) continue

        if (/^ {4}export +(type +)?\{$/.test(line)) {
            const typeOnly = line.includes('type')
            let j = i + 1
            for (; !lines[ j ].startsWith('    }'); j++)
                typeOnly || addNamed(names, lines[ j ])
            i = j
            continue
        }

        const named = line.match(/^ {4}export +\{ *(.+) *\}/)
        if (named) {
            for (const el of named[ 1 ].split(','))
                addNamed(names, el)
            continue
        }

        if (/^ {4}export +default\b/.test(line)) { names.add('default'); continue }
        if (/^ {4}export +(type|interface)\b/.test(line))                continue // type-only
        if (/^ {4}export +namespace\b/.test(line))                       continue // merges into an existing value

        const decl = line.match(/^ {4}export (?:abstract )?(?:class|function|const|let|var) (\w+)/)
        if (decl) names.add(decl[ 1 ])
    }
    return modules
}

function addNamed(names, el) {
    el = el.trim().replace(/ *, *$/, '')
    el && names.add(
        el.includes(' as ')
            ? el.split(' as ').pop().trim()
            : el)
}

// maps each package.json "exports" subpath to its real module url, e.g.
// 'garage/compose' -> file:///.../src/compose.js
async function runtimeModuleMap() {
    const pkg = await read('../package.json')
    const map = new Map

    for (const [ subpath, target ] of Object.entries(pkg.exports)) {
        const name = subpath === '.'
            ? 'garage'
            : 'garage' + subpath.slice(1)
        map.set(name, new URL(target.default.replace(/^\./, '..'), import.meta.url))
    }
    return map
}

async function read(path) {
    let txt = await Fs.readFile(new URL(path, import.meta.url), 'utf8')
    return path.endsWith('.json')
        ? JSON.parse(txt)
        : txt
}
