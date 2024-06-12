import { it, describe } from 'node:test'
import { strictEqual as equal } from 'assert'
import Is from '../src/util/is.aint.js'
import parseArgv from '../src/util/arguments.js'

let argv = parseArgv(`

            -a

            --one first

            -b

            unknown

            -c

            --two second

            last

            Michael Miretsky

            michael

            krote

            passs

        `.match(/\S+/g))

for (let k in argv)
    console.log(k, argv[ k ])

/* describe('Parse Argv', () => {

    it('', () => {
        let argv = parseArgv(`

            -a

            --one first

            -b

            unknown

            -c

            --two second

            last

            Michael Miretsky

            michael

            krote

            passs

        `.match(/\S+/g))

        for (let k in argv)
            console.log(k, argv[ k ])

    })

})
 */
