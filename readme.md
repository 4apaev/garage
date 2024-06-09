🛟 Gws Common
=============

Gateway Services
----------------
- 🛟 **gws.common**
- 🐔 gws.users
- 💈 gws.front
- 🗂 gws.files
- 🛎 gws.notification

```sh
  # pass vars to npm scripts
  npm run send -- one two 3 4

```

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
 ├── .env
 ├── .env.example
 ├── .eslintrc.yml
 ├── .gitignore
 ├── index.js
 ├── tsconfig.json
 ├── package.json
 ├── package-lock.json
 ├── readme.md
 │
 ├─┬ scripts
 │ ├── pre.sh
 │ ├── fold.yml
 │ ├── fold.crap.yml
 │ ├── generate.service.js
 │ ├── env.update.js
 │ └── lints.js
 │
 ├─┬ test
 │ ├── is.spec.js
 │ ├── use.spec.js
 │ ├── qurl.spec.js
 │ └── compose.spec.js
 │
 └─┬ src
   ├── init.js
   ├── router.js
   ├── constants.js
   ├─┬ core
   │ ├── end.js
   │ ├── use.js
   │ ├── use.single.js
   │ ├── path2regex.js
   │ ├── response.js
   │ ├── request.js
   │ ├── compose.js
   │ ├── context.js
   │ ├── init.js
   │ └── core.d.ts
   │
   ├─┬ mw
   │ ├── cors.js
   │ ├── logger.js
   │ ├── reader.js
   │ └── static.js
   │
   └─┬ util
     ├── is.js
     ├── arguments.js
     ├── async.ierator.js
     ├── exec.js
     ├── fail.js
     ├── fold.js
     ├── mime.js
     ├── qurl.js
     ├── rand.js
     ├── tic.js
     └── use.js
```







