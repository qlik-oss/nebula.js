---
'@nebula.js/cli-build': patch
'@nebula.js/cli-sense': patch
---

fix: remove the warnings of builds that were wrong or noise. `nebula build --mode development` no longer warns about conflicting values for `process.env.NODE_ENV`, `nebula sense` no longer warns that the qext file should be in the `files` array when its directory is, and no longer warns about unresolved imports of sources that are not in the extension, which came from the build cache directory that it shared with `nebula build`
