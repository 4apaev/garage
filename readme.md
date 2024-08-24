🚂 Garage
=========

```sh
  # pass vars to npm scripts
  npm run send -- one two 3 4

```

## Regex Look Ahead/Behind

```
┌───────────┬────────┬───────────┬───────────────────┬───────┐
│ name      │ symbol │ regex     │ ok           nope │ match │
├───────────┼────────┼───────────┼────────┬──────────┼───────┤
│ ++ AHEAD  │   ?=   │ a(?=b)    │ [a]b   ╎   ac     │ a     │
│ -- AHEAD  │   ?!   │ a(?!b)    │ [a]c   ╎   ab     │ a     │
│ ++ BEHIND │   ?<=  │ (?<=a)b   │  a[b]  ╎   cb     │ b     │
│ -- BEHIND │   ?<!  │ (?<!a)b   │  c[b]  ╎   ab     │ b     │
└───────────┴────────┴───────────┴────────┴──────────┴───────┘
```


```
┌───────────────────────┐
│ Exports               │
└┬──────────────────────┘
 │
 ├── .git
 ├── .gitignore
 ├── .env.example
 ├── .env
 ├── .eslintrc.yml
 │
 ├── index.js
 ├── readme.md
 ├── tsconfig.json
 ├── package.json
 ├── package-lock.json
 │
 ├─┬ .vscode
 │ ├── garage.code-workspace
 │ ├── launch.json
 │ └── tasks.json
 │
 ├─┬ scripts
 │ ├── pre
 │ ├── certs
 │ └── web.socket.js
 │
 ├─┬ test
 │ ├── compose.spec.js
 │ ├── qurl.spec.js
 │ ├── is.spec.js
 │ └── use.spec.js
 │
 └─┬ src
   ├── init.js
   ├── router.js
   ├── constants.js
   │
   ├─┬ core
   │ ├── use.js
   │ ├── end.js
   │ ├── init.js
   │ ├── compose.js
   │ ├── context.js
   │ ├── request.js
   │ └── response.js
   │
   ├─┬ mw
   │ ├── ws.js
   │ ├── cors.js
   │ ├── logger.js
   │ ├── reader.js
   │ ├── static.js
   │ ├── static.h1.js
   │ └── static.h2.js
   │
   └─┬ util
     ├── is.js
     ├── use.js
     ├── dump.js
     ├── fail.js
     ├── mime.js
     ├── qurl.js
     ├── helpers.js
     └── constants.js
```







