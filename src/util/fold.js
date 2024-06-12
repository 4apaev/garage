export const FOLD_DUPS = Symbol.for('fold.duplicates')

export default (it, div = '_') => {
    let ctx = Object.create(null)
    ctx[ FOLD_DUPS ] = []

    for (let [ k, v ] of Object.entries(it))
        fold(ctx, k, v, div)

    return ctx
}

export function fold(prev, next, value, div = '_') {
    let chunks = next.split(div)
    let key = chunks.pop()
    let tmp = prev

    for (let k of chunks) {
        tmp = (tmp[ k ] ??= Object.create(null))
    }

    if (Object(tmp) === tmp) {
        if (key in tmp) {
            if (key.toLowerCase() === value) {

                prev[ FOLD_DUPS ].push(`${ key } = ${ value }`)

                tmp[ key ][ key ] = value
                console.log('Duplicated key "%s" in "%s"', key, next, value)
            }
        }
        else {
            tmp[ key ] = value
        }
    }
    else {
        console.error('Invalid key "%s" in "%s"', key, next, value, tmp)
    }
    return prev
}
