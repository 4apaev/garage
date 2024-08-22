/**
 * @param  { string } path
 * @return { RegExp }
 */
export default function path2regex(path) {
    const tmpl = path
        .replace(/\/:([^/\s]+)/g, String.raw`\/(?<$1>[^/\s]+)`) // create named group (?<param>\w+)
        .replace(/(?<!\\)\//g, String.raw`\/`)                // escape forward slashes
    return new RegExp(String.raw`^${ tmpl }`)               // match only from the begining of the string to avoid matches in the midlle of a url
}
