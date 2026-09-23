garage
================

[![CI](https://github.com/4apaev/garage/actions/workflows/ci.yml/badge.svg)](https://github.com/4apaev/garage/actions/workflows/ci.yml)

a small http server, router, and middleware toolkit.

```js
import Garage from 'garage'

const app = Garage.of({
    name: 'garage',
    port: 3000,
})

app.get('/hello/:world', (rq, rs) =>
    rs.json(200, {
        hello: rq.params.world }))

app.use(
    'PUT',
    'POST',
    '/api/:route',
    (rq, rs, next) => next().then(() => console.log(rs.status, rq.method, rq.url)),
    (rq, rs, next) => rq.reader().then(next),
    (rq, rs) => rs.json(200, {[ rq.params.route ]: rq.body }),
)

app.use((rq, rs) => rs.send(404, 'not found'))
app.listen()

```

## api

- `Garage.create(listener)` creates a node http server using garage request/response classes
- `Garage` composes middleware and route handlers
- `Req` extends `http.IncomingMessage`
- `Res` extends `http.ServerResponse`
- `compose(...middleware)` composes koa-style middleware
- `use(...methods, ...paths, ...middlewares)` builds route middleware with multiple `URLPattern`, http methods and multiple handlers

## disposal

`Garage` and `Sync` support the `using` declaration:

```js
// closes the server (and drops idle keep-alive sockets) when the block exits
await using app = Garage.of({ port: 0 }).listen()

// aborts the request when the block exits before it settles
using rq = Sync.get('/items')
```
