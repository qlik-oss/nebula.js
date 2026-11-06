---
'@nebula.js/cli-build': major
---

Build with Rslib (Rspack) in `nebula build`, in place of rollup. The output is the same files, the es module (`module`) and the SystemJS module (`systemjs`), and unresolved imports are an error. TypeScript and JSX are compiled with SWC instead of Babel, `--preferBuiltins` is gone, and an unknown flag or key of the config file is an error. See the README of `@nebula.js/cli-build` for the differences.
