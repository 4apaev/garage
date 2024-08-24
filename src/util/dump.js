import Is from './is.js'
import { each } from './use.js'

export default function dump(it, tab = 4) {
    const seen = new WeakSet

    tab === +tab && (tab = ' '.repeat(tab))

    return (function inner(prev, next, path, key) {
        const prfx = tab.repeat(path.length)

        if (Is.x(next)) {
            if (seen.has(next)) {
                prev.push(`${ prfx }<Circular:${ key }>`)
            }
            else {
                seen.add(next)
                prev.push(prfx + key),
                each(next, Is.any(next, Array, Set)
                    ? (k, v) => inner(prev, v, path.concat(k), '- ')
                    : (k, v) => inner(prev, v, path.concat(k), k + ': '))
            }

        }
        else {
            prev.push(prfx + key + next)
        }
    })([], it, [], '').join('\n')
}

dump.log = (it, tab) => console.log(dump(it, tab))
