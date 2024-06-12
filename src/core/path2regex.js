/**
 * @param  { string } path
 * @return { RegExp }
 */
export default function path2regex(path) {
    let tmpl = path.replace(/\/:([^/\s]+)/g, groupParam)    // create named group (?<param>\w+)
        .replace(/(?<!\\)\//g, '\\/')                       // escape forward slashes
    return new RegExp(String.raw`^${ tmpl }`)               // avoid matches in the midlle of a url
}

/**
 * @param  { string } _
 * @param  { string } param
 * @return { string }
 */
function groupParam(_, param) {
    return String.raw`\/(?<${ param }>[^/\s]+)`
}
