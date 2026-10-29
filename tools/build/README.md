# Build scripts

The `rolldown.config.mjs` in the root of the repo configures the build of the package in the current directory, with the CLI
of Rolldown: `rolldown --config ../../rolldown.config.mjs [--watch]`. It is what the `build`, `build:dev` and
`build:watch` scripts of `apis/stardust`, `apis/test-utils` and `apis/snapshooter` run. The CLI builds the bundles of a
package one after the other, and in watch mode it leaves out the UMD outputs, as they are not used in development.

- `plan.mjs` decides which bundles and outputs a package gets, and validates `main`, `module`, `unpkg`, `jsdelivr` and
  that the package has no dependencies other than `@qlik/api`.
- `options.mjs` turns the plan into [Rolldown](https://rolldown.rs) options.
- `esm-to-systemjs.mjs` converts the chunks of an ES bundle to SystemJS, see below.

## How the outputs are made

Everything is bundled with Rolldown, once per variant (production, which is minified, and dev). The UMD and ESM outputs
of a variant come from the same bundle.

Rolldown has no SystemJS format. The SystemJS output of stardust is a code split ES bundle where every chunk is then
converted with Rollup (`format: 'system'`). The imports between the chunks stay as they are, so they become the
dependencies of `System.register`. The source map of Rolldown is passed to Rollup, which chains it with its own, so the
final maps point at the original sources.

## Differences from the Rollup build

- The code is down-levelled for Chrome 62, Safari 11 and iOS 12.2 (the same targets as before) by Rolldown, and that
  now includes the code in `node_modules`. Before, only our own packages were transformed with Babel. The production
  bundles are a few percent larger because of it, and they parse as ES2017 in all outputs.
- Babel is used to convert the chunks of the SystemJS output, and to check the locale strings (`tools/locale-string-validator.cjs`,
  which warns, as it did before) of the files that ask a translator for a string.
- The "use client" directives of MUI are not logged: the `moduleLevelDirective` check of Rolldown is off.
- The SystemJS output has the entry module in `stardust.systemjs[.dev].js`, and not in a chunk that it imports. The
  chunks in `dist/chunks` are the dynamic imports of `@qlik/api` and the code they share.
- `import('fs')` in `@qlik/api` is an empty module in a browser. It is an empty chunk in the SystemJS output.
- The source maps of the SystemJS output have sources. They were empty before.
- `test-utils` is down-levelled too, which it was not before. It is 1.3 KB bigger (2.3 KB, from 1.0 KB).
- All code that is bundled, also from `node_modules`, is down-levelled to the floor of Chrome 62, Safari 11 and iOS 12.2.
- Production bundles are minified with Terser (`@rollup/plugin-terser`, as before), and not with the minifier of
  Rolldown. That prints strings as template literals when it is as short, e.g. `typeof process<\`u\``. Parcel does not
recognise `typeof process == \`object\``as a check for`process`, and fails to bundle stardust. Terser writes strings
  with quotes. The bundles are about 3% bigger when gzipped than with the minifier of Rolldown, and the build takes a
  second longer.
- A CommonJS module that requires a peer dependency (react-dom requires react) gets a `__require` function in an ES
  bundle, that throws where there is no global `require`. The `esmExternalRequirePlugin` of Rolldown owns the externals
  of a bundle, and makes those requires imports, as Rollup did. For that it has to be the one that lists them: they are
  not given as the `external` option of the bundle.
