---
'@nebula.js/cli-serve': major
---

feat!: `nebula serve` serves the SystemJS module at `/<package name>.js`, `@scope/name` is `/scope-name.js`, with the chunks of it beside. It builds and watches the `systemjs` field of package.json beside the `module` field, and `-p` is an alias of `--port`.

The `--mfe` option is removed, `nebula serve` serves the web app and the SystemJS module together. Remove `--mfe` from the scripts that start nebula serve, and add `--https` if the page that loads the SystemJS module is served over HTTPS.
