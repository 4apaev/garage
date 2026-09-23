import Fs from 'node:fs/promises'

import { describe, it } from 'node:test'
import { deepEqual } from 'node:assert/strict'

/*
    src/types.d.ts is hand-written, not generated from src/*.js,
    so it can silently drift from what the runtime actually exports
    (it has, more than once).
    this doesn't typecheck the shape of each export, tsc already
    does that internally.

    it only makes sure that every `declare module 'garage*'` block names the same set of value exports its real module has,
    no more and no fewer.
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

        const decl = line.match(/^ {4}export (?:abstract )?(?:class|function|const|let|var) ([\p{L}\p{N}_$]+)/u)
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
/*
    maps each package.json "exports" subpath to its real module url

    exports:
        .           : default: ./src/index.js     , types: ./src/types.d.ts,
        ./constants : default: ./src/constants.js , types: ./src/types.d.ts,
        ./compose   : default: ./src/compose.js   , types: ./src/types.d.ts,
        ./garage    : default: ./src/garage.js    , types: ./src/types.d.ts,
        ./use       : default: ./src/use.js       , types: ./src/types.d.ts,
        ./util      : default: ./src/util.js      , types: ./src/types.d.ts,
        ./sync      : default: ./src/sync.js      , types: ./src/types.d.ts,
        ./mime      : default: ./src/mime.js      , types: ./src/types.d.ts,
        ./mw/ws     : default: ./src/mw/ws.js     , types: ./src/types.d.ts,
*/
async function runtimeModuleMap() {
    const map = new Map
    const pkg = await read('../package.json')

    for (const [ sub, trg ] of Object.entries(pkg.exports)) {
        const k = 'garage' + sub.slice(1)
        const v = new URL(trg.default.replace(/^\./, '..'), import.meta.url)
        map.set(k, v)
    }
    return map
}

async function read(path) {
    let txt = await Fs.readFile(new URL(path, import.meta.url), 'utf8')
    return path.endsWith('.json')
        ? JSON.parse(txt)
        : txt
}

// Object.entries(pkg.exports).map(([ k, v ]) => [ 'garage' + k.slice(1), new URL(v.default.replace(/^\./, '..'), import.meta.url) ])
