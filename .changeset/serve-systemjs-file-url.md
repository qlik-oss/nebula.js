---
'@nebula.js/cli-serve': major
---

feat!: `nebula serve` serves the directories that nebula build writes to from the root, so the es module and the SystemJS module are at their file names (`/sn-viz.js` and `/sn-viz.systemjs.js` for `dist/sn-viz.js` and `dist/sn-viz.systemjs.js`), with the chunks and the source maps beside them. The urls are printed when it has started. It builds and watches the `systemjs` field of package.json beside the `module` field, and `-p` is an alias of `--port`. The web app loads the es module from its file name.

**Breaking:**

- `--mfe` is removed, `nebula serve` serves the web app and the SystemJS module together. Remove `--mfe` from the scripts that start nebula serve.
- `/pkg/<name>` is removed.
- Nebula serve serves over HTTPS by default, as `--mfe` did, which needs the certificates in `~/.certs` (see the README). Use `--no-https` to serve over HTTP.
