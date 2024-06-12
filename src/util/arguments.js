const pair =  /^-+(?<k>[\w-]+)=(?<v>[\w-]+)$/
const tuple = /^--(?<k>[\w-]+)$/
const flag =  /^-(?<k>[\w-]+)$/

export default function parse(args, options) {

    if (args?.raw)
        args = String.raw(args)

    if (typeof args == 'string')
        args = args.match(/\S+/g)

    const pos = []
    const argv = {}
    const set = (k, v) =>
        argv[ k ] = k in argv
            ? [].concat(argv[ k ], v)
            : v

    let i = 0
    do {
        let x, a = args[ i++ ]
        /**/ if (x = a.match(pair)) set(x.groups.k, x.groups.v)
        else if (x = a.match(tuple)) set(x.groups.k, isa(args[ i ]) ? true : args[ i++ ])
        else if (x = a.match(flag)) set(x.groups.k, true)
        else pos.push(a)
    } while (i < args.length)

    return {
        pos,
        argv: normalize(argv, options),
    }

}

function isa(s) {
    return s ? s.startsWith('-') : true
}

function normalize(values, opt) {
    if (opt == null)
        return Object.fromEntries(Object.entries(values).map(([ k, v ]) => [ k, format.map[ v ] ?? v ]))

    for (let [ k, o ] of Object.entries(opt)) {
        let rs = values[ k ] ?? values[ o.short ] ?? o.default

        delete values[ o.short ]

        values[ k ] = Array.isArray(rs)
            ? rs.map(x => format(x, o))
            : format(rs, o)
    }
    return values
}

function format(x, opt) {
    x ??= opt.default
    if (x in format.map)       return format.map[ x ]
    if (opt.type == 'boolean') return Boolean(x)
    if (opt.type == 'number')  return Number(x)
    return String(x)
}

format.map = {
    __proto__: null,
    0: 0, 1: 1, 2: 2, 3: 3, 4: 4,
    5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
    true: true,     false: false,
    True: true,     False: false,
    TRUE: true,     FALSE: false,
    undefined,
    null: undefined,
    NaN: undefined,
}

/*

console.log(
    use.dump(
        parse`
            -f
            some
            -l=5
            other
            -q=1
            -q=2
            -q=3
            -dog=shoshi ${ {
        foo: { short: 'f', type: 'boolean', default: false },
        alg: { short: 'a', type: 'string', default: 'MD5' },
        level: { short: 'l', type: 'number', default: 42 },
        silent: { short: 's', type: 'boolean' },
        query: { short: 'q', type: 'string' },
    } }`,
    ),
)

export function parseNative(args, options) {
    return util.parseArgs({
        args,
        strict: false,
        allowPositionals: true,
        options: {
            foo   : { short: 'f', type: 'boolean' , default: false },
            alg   : { short: 'a', type: 'string'  , default: 'MD5' },
            level : { short: 'l', type: 'string'  , default: '42'  },
            silent: { short: 's', type: 'boolean' , default: true  },
            query : { short: 'q', type: 'string'  , multiple: true },
        }})
}

Error: Could not find config file.
    at locateConfigFileToUse (node_modules/eslint/lib/eslint/eslint.js:350:21)

 */
