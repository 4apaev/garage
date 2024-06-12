import Ch from 'child_process'

export default function Exec(s, ...a) {
    let cmd
    if (s?.raw) {
        cmd = [ s.raw[ 0 ] ]
        for (let i = 0; i < a.length;)
            cmd = cmd.concat(a[ i++ ], s.raw[ i ])
        cmd = cmd.join('')
    }
    else {
        cmd = s.concat(...a)
    }

    return new Promise((ok, nope) => {
        Ch.exec(cmd, (e, std) => e
            ? nope(e)
            : ok(std))
    })
}

export function readStdin() {
    return new Promise((resolve, reject) => {
        let chunk = ''
        let content = ''

        process.stdin
            .setEncoding('utf8')
            .on('readable', () => {
                while ((chunk = process.stdin.read()) !== null)
                    content += chunk

            })
            .on('end', () => resolve(content))
            .on('error', reject)
    })
}
