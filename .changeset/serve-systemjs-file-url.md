---
'@nebula.js/cli-serve': minor
---

feat: serve the SystemJS module at `/<package name>.js`, `@scope/name` is `/scope-name.js`, with the chunks of it beside, also when serving the web app without `--mfe`. nebula serve builds and watches the `systemjs` field of package.json beside the `module` field.
