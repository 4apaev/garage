import O from './use.js'

export default class Tic extends Date {

    static get now() { return Date.now() }
    static get date() { return new Date  }

    get string() {

        return this.toLocaleString('en-gb', new Intl.DateTimeFormat([], { /* eslint-disable key-spacing */
            year      : '2-digit',
            month     : '2-digit',
            day       : '2-digit',
            hour      : '2-digit',
            minute    : '2-digit',
            second    : '2-digit',
            hourCycle : 'h23',
            /* eslint-enable  key-spacing */// weekday   : 'short',
        }))
    }

    get y() { return this.getFullYear() }
    get d() { return this.getDate() }
    get M() { return this.getMonth() + 1 }
    get h() { return this.getHours() }
    get m() { return this.getMinutes() }
    get s() { return this.getSeconds() }
    get ms() { return this.getMilliseconds() }
    get time() { return this.getTime() }

    set y(x) { this.setFullYear(x) }
    set d(x) { this.setDate(x) }
    set M(x) { this.setMonth(x - 1) }
    set h(x) { this.setHours(x) }
    set m(x) { this.setMinutes(x) }
    set s(x) { this.setSeconds(x) }
    set ms(x) { this.setMilliseconds(x) }
    set time(x) { this.setTime(x) }

    tmpl(s, ...a) {
        let input = s?.raw
            ? String.raw(s, ...a)
            : s.concat(...a)

        input.replace(/\b(y|d|m|h|s|w|MS)\1?\b/gi, (m, k) => {
            let x = this[ k ] ?? this[ k.toLowerCase() ]
            return x != null ?  String(x).padStart(m.length, 0) : m
        })

        return input.replace(/\b[A-z]{1,2}\b/g, k => {
            let v = this[ k ]
            if (v === +v) {
                return k.length === 2
                    ? `${ v }`.padStart(2, 0)
                    : v
            }
            return k
        })
    }
}

// (map => {

//     function alias(s, o) {

//         let it = new Set(s.match(/\w+/g))

//         for (let k of it) {
//             let upp = k.toUpperCase()
//             let low = k.toLowerCase()
//             let cap = upp[ 0 ] + low.slice(1)

//             it.add(k)
//             it.add(upp)
//             it.add(low)
//             it.add(cap)
//         }

//         return [ ...it ].join(' ')
//     }

//     alias(map, `  y  | Y   yy  yy | YR   YEAR      YEARS   | Yr   Year      Years   | yr   year      years   `)
//     alias(map, `  M  | -   MM  -- | MT   MONTH     MONTHS  | Mt   Month     Months  | mt   month     months  `)
//     alias(map, `  d  | D   DD  DD | DT   DATE      DATES   | Dt   Date      Dates   | dt   date      dates   `)
//     alias(map, `  w  | W   WW  WW | WE   WEEK      WEEKS   | We   Week      Weeks   | we   week      weeks   `)
//     alias(map, `  h  | H   HH  HH | HR   HOURS     HOUR    | Hr   Hours     Hour    | hr   hours     hour    `)
//     alias(map, `  m  | -   mm  -- | MIN  MINUTES   MINUTE  | Min  Minutes   Minute  | min  minutes   minute  `)
//     alias(map, `  s  | S   SS  SS | SEC  SECONDS   SECOND  | Sec  Seconds   Second  | sec  seconds   second  `)
//     alias(map, `  ms | MS  --  -- | MSEC MSECONDS  MSECOND | Msec Mseconds  Msecond | msec mseconds  msecond `)

// })(Tic.map = O.of({ /* eslint-disable key-spacing */
//     y: `y `,
//     M: `M `,
//     d: `d `,
//     w: `w `,
//     h: `h `,
//     m: `m `,
//     s: `s `,
//     ms: `ms`,
//     /* eslint-enable  key-spacing */
// }))

/*

        +-----------------+----------+---------+--------------------------------------------------------+
        |   formatMatcher | best fit | basic   |                                                        |
        |   localeMatcher | best fit | lookup  |                                                        |
        +-----------------+----------+---------|                                                        |
        |          hour12 | boolean  |         |                                                        |
        |        timeZone | string   |         |                                                        |
        +-----------------+----------+---------+--------------+------------+--------------+-------------+
        |    timeZoneName | short    | long    | shortOffset  | longOffset | shortGeneric | longGeneric |
        +-----------------+----------+---------+------+-------+------------+--------------+-------------+
        |             era |                    | long | short | narrow     |                            |
        |         weekday |                    | long | short | narrow     |                            |
        +-----------------+----------+---------+------+-------+------------+----------------------------+
        |           month | numeric  | 2-digit | long | short | narrow     |                            |
        +-----------------+----------+---------+------+-------+------------+----------------------------+
        |            year | numeric  | 2-digit |                                                        |
        |             day | numeric  | 2-digit |                                                        |
        |            hour | numeric  | 2-digit |                                                        |
        |          minute | numeric  | 2-digit |                                                        |
        |          second | numeric  | 2-digit |                                                        |
        +-----------------+----------+---------+--------------------------------------------------------+
        | numberingSystem | string   |                                                                  |
        |        calendar | string   |                                                                  |
        |          locale | string   |                                                                  |
        +-----------------+----------+----------+----------+--------------------------------------------+
        |   formatMatcher | basic    | best fit | best fit |                                            |
        +-----------------+----------+----------+----------+-------+------------------------------------+
        |       dateStyle | full     | long     | medium   | short |                                    |
        |       timeStyle | full     | long     | medium   | short |                                    |
        +-----------------+----------+----------+----------+-------+------------------------------------+
        |       dayPeriod | narrow   | short    | long     |       |                                    |
        +-----------------+----------+----------+----------+-------+------------------------------------+
        |       hourCycle | h11      | h12      | h23      | h24   |                                    |
        +-----------------+----------+----------+----------+-------+------------------------------------+
        | fractionalSecondDigits     | 1        | 2        | 3     |                                    |
        +----------------------------+----------+----------+-------+------------------------------------+

    }

    */
