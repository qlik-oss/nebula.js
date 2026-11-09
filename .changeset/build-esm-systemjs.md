---
'@nebula.js/cli-build': major
---

`nebula build` writes the es module (`module` in `package.json`) and the SystemJS module (`systemjs`), the UMD bundle (`main`) is no longer built. `--watch` watches `esm` or `systemjs`, `--watch` alone watches `esm`, and a package.json with neither `module` nor `systemjs` is an error. The `main` field is removed from the templates of `nebula create`.
