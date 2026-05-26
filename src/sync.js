import { O, Is, Fail, each } from './util.js'

import * as Mim from './mime.js'

export default class Sync {

    static base = 'http://localhost'
    static head = new Headers

    name    = 'Sync'
    head    = new Headers(Sync.head)
    aborter = new AbortController

    constructor(method, url, data) {
        this.url    = /^https?:/i.test(url ??= '/')
            ? new URL(url)
            : new URL(url, new.target.base)

        this.method = (method || 'get').toUpperCase()
        data && this.send(data)
    }

    get params()  { return O.of(this.url.searchParams) }
    get signal()  { return this.aborter.signal }

    type(x) { return x ? this.set('content-type', Mim.get(x, x)) : this.get('content-type') }
    size(x) { return x ? this.set('content-length', x) : 0 | this.get('content-length') }

    has(k) { return this.head.has(k)       }
    get(k) { return this.head.get(k) ?? '' }
    append(k, v) { return this.head.append(k, v) }
    set(k, v) {
        if (Is.x(k))
            return each(k, this.set, this)
        this.head.set(k, v)
        return this
    }

    query(k, v) {
        if (k == null) return this
        if (Is.x(k)) return each(k, this.query, this)
        Is.a(v)
            ? v.forEach(x => this.url.searchParams.append(k, x))
            : this.url.searchParams.has(k)
                ? this.url.searchParams.append(k, v)
                : this.url.searchParams.set(k, v)
        return this
    }

    json(x) {
        return this.type('json', this.body = JSON.stringify(x))
    }

    send(x) {
        if (x == null)                         return this
        if (/^(GET|HEAD)$/i.test(this.method)) return this.query(x)
        if (Is.x(x))                           return this.json(x)
        if (x != null)                                this.body = String(x)
        return this
    }

    abort(cause)   { return this.aborter.abort(cause), this }
    then(ok, nope) { return this.end(ok, nope) }

    end(ok, nope)  {
        if (this.signal.aborted)                // once aborted, сignal stays aborted forever
            this.aborter = new AbortController  // so create new aborter to reset

        const pr = fetch(this.url, {
            body   : this.body,
            method : this.method,
            headers: this.head,
            signal : this.signal,
        }).then(
            this.parse,
            nope ??= e => Fail.deny(e?.status ?? e?.code, e.message, e, console.error(e)))
        return ok
            ? pr.then(ok, nope)
            : pr
    }

    parse = async rs => {
        const pay = {
            rs,
            ok    : rs.ok,
            code  : rs.status,
            status: rs.status,
            head  : new Headers(rs.headers),
        }
        try {
            pay.body = Mim.is('json', pay.head)
                ? await rs.json()
                : await rs.text()
        }
        catch (e) {
            pay.error = new Fail(pay.code = 400, e.message, e)
        }
        this.payload = pay
        return pay.ok && !pay.error
            ? pay
            : Promise.reject(pay)
    }

    static get(u, x)  { return new Sync('get', u, x) }
    static put(u, x)  { return new Sync('put', u, x) }
    static post(u, x) { return new Sync('post', u, x) }
    static del(u, x)  { return new Sync('delete', u, x) }
}
