---
'@nebula.js/cli-serve': major
---

`nebula serve` builds the visualization as an es module (the `module` field of `package.json`) and loads it into the page, in place of a UMD bundle. The page has `@nebula.js/stardust`, `react` and `react-dom`, and a visualization imports those by their names. Other modules are bundled into it. The `url` of a type in the serve config is an es module. `--mfe` is unchanged.
