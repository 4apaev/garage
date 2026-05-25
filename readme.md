# garage

a small http server, router, and middleware toolkit.

```js
import { Router } from 'garage'

const app = new Router({
    name: 'garage',
    port: 3000,
})

app.get('/hello/:world', (rq, rs) => {
    return rs.json(200, {
        hello: rq.params.world,
    })
})

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

- `create(listener)` creates a node http server using garage request/response classes
- `Router` composes middleware and route handlers
- `Req` extends `http.IncomingMessage`
- `Res` extends `http.ServerResponse`
- `compose(...middleware)` composes koa-style middleware
- `use(...methods, ...paths, ...middlewares)` builds route middleware with multiple `URLPattern`, http methods and multiple handlers
