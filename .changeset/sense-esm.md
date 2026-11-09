---
'@nebula.js/cli-sense': major
---

`nebula sense` builds one AMD module from the es module (`module` in `package.json`) that `nebula build` writes, in place of copying the UMD bundle (`main`) next to a wrapper. The module is bundled with Rslib and is `<name>.js` in the output directory, with the `.qext` file. Run `nebula build` first. Unresolved imports of the extension are left to Qlik Sense as AMD dependencies, with a warning. See the README of `@nebula.js/cli-sense`.
