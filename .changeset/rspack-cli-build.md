---
'@nebula.js/cli-build': major
---

Build with Rspack in `nebula build`, in place of rollup. The output is the same files, the es module (`module`) and the SystemJS module (`systemjs`), and unresolved imports are an error. `--preferBuiltins` is gone, an unknown flag or key of the config file is an error, and a bundle's named exports are the values at the time of the build, not live bindings. See the README of `@nebula.js/cli-build` for the differences.
