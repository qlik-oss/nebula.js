---
'@nebula.js/cli-serve': major
---

feat!: `nebula serve` serves the files that nebula build writes by their file names, the es module and the SystemJS module (`/sn-viz.js` and `/sn-viz.systemjs.js` for `dist/sn-viz.js` and `dist/sn-viz.systemjs.js`) with the source maps of them, and the chunks of a code split module from `/chunks`. The urls are printed when it has started. It builds and watches the `systemjs` field of package.json beside the `module` field, and `-p` is an alias of `--port`. The web app loads the es module from its file name.

**Breaking:**

- `--mfe` is removed, `nebula serve` serves the web app and the SystemJS module together. Remove `--mfe` from the scripts that start nebula serve.
- `/pkg/<name>` is removed.
- Nebula serve serves over HTTPS by default, as `--mfe` did, which needs the certificates in `~/.certs` (see the README). Use `--no-https` to serve over HTTP.
