---
'@nebula.js/cli-serve': major
---

feat!: `nebula serve` serves the SystemJS module at `/<package name>.js` and the es module at `/<package name>.esm.js`, `@scope/name` is `/scope-name.js`, also with `--type`. It builds and watches the `systemjs` field of package.json beside the `module` field, and `-p` is an alias of `--port`.

The files are served from where nebula build wrote them, the chunks of a code split module from `/chunks`. The web app loads the es module from `/<package name>.esm.js`.

**Breaking:**

- `--mfe` is removed, `nebula serve` serves the web app and the SystemJS module together. Remove `--mfe` from the scripts that start nebula serve.
- `/pkg/<name>` is removed.
- Nebula serve serves over HTTPS by default, as `--mfe` did, which needs the certificates in `~/.certs` (see the README). Use `--no-https` to serve over HTTP.
