---
'@nebula.js/cli-serve': minor
---

Build the pages of `nebula serve` and serve them with Rsbuild, in place of `@rspack/dev-server` and `html-webpack-plugin`. The `stylesheets` of the serve config are added to the page as style sheets (they were added as scripts), and the page of a `nebula build` error is no longer shown in the browser, the error is logged in the terminal.
