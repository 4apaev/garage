import { hrtime } from 'node:process'
export { hrtime, logger  }

export const DTF = new Intl.DateTimeFormat([], {
    year: 'numeric',
    month: 'short',        // long narrow short
    weekday: 'short',      // long narrow short
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
})

/**
 * @param { import('http').IncomingMessage } rq
 * @param { import('http').ServerResponse } rs
 */
export default function logger(rq, rs) {
    const end = time()
    rs.once('finish', () => {
        console.log(
            `│ %s │ %d │ %i │ %s │ %s`,
            DTF.format(new Date),
            `${ end() }`.padEnd(4),
            rs.statusCode,
            rq.method.padEnd(6),
            rq.url.padEnd(64),
        )
    })
}

export function time(start = hrtime()) {
    return () => {
        const [ s, ns ] = hrtime(start)
        return Math.round((s * 1e+9 + ns) / 1e+6)
    }
}
