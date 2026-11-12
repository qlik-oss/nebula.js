---
'@nebula.js/cli-serve': major
---

feat!: `nebula serve` serves the directories that nebula build writes to, at the paths of the files in the package (`/dist/sn-viz.js`, `/dist/sn-viz.systemjs.js` and the chunks and source maps beside them), and the urls are printed when it has started. It builds and watches the `systemjs` field of package.json beside the `module` field, and `-p` is an alias of `--port`. The web app loads the es module from the path of the `module` field.

**Breaking:**

- `--mfe` is removed, `nebula serve` serves the web app and the SystemJS module together. Remove `--mfe` from the scripts that start nebula serve.
- `/pkg/<name>` is removed.
- Nebula serve serves over HTTPS by default, as `--mfe` did, which needs the certificates in `~/.certs` (see the README). Use `--no-https` to serve over HTTP.
