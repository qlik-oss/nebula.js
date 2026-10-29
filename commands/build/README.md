# @nebula.js/cli-build

Build nebula.js visualization.

## Install

```sh
npm install @nebula.js/cli @nebula.js/cli-build -g
```

## Usage

```sh
nebula build

Build nebula.js visualization

Options:
  --version                 Show version number                                 [boolean]
  --config, -c              Path to a JavaScript config file
                                                   [string] [default: "nebula.config.js"]
  --watch, -w               Watch source files
                                            [choices: "umd", "systemjs"] [default: "umd"]
  --sourcemap, -m           Generate source map                 [boolean] [default: true]
  --mode                    Explicitly set mode
                                          [string] [choices: "production", "development"]
  --core                    Set a core build target            [string] [default: "core"]
  --typescript              Enable typescript bundling         [boolean] [default: false]
  --preferBuiltins          Specify whether to use Node.js built-in modules.
                                                                [boolean] [default: true]
  --browser                 Use the browser module resolutions in package.json and adds
                            'browser' to exportConditions if it is not present so browser
                            conditionals in exports are applied.
                                                               [boolean] [default: false]
```

## Example

### Configuration file

Build the bundle with a nebula configuration json file in a new path

```sh
nebula build --config config/my-nebula-config.js
```

In the config file, build properties:

- Version
- Sourcemap
- Mode
- Core
- Typescript

The following code in a config file demonstrates an example to set the nebula build configuration.

```js
const path = require('path');
const defaultTheme = require('yourThemeProject/theme.json');
const targetPkg = require(path.resolve(process.cwd(), 'package.json'));
const replacementStrings = {
  'process.env.PACKAGE_VERSION': JSON.stringify(targetPkg.version),
};
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const sourcemap = mode !== 'production';

module.exports = {
  build: {
    replacementStrings,
    sourcemap,
    mode,
    core: 'core',
    typescript: true,
  },
};
```

### Watch files

Rebuild the bundle when files in `/src` folder have been change on the disk

```sh
nebula build --watch
```

### Source map

Build the bundle without a source map file - `.js.map` file

```sh
nebula build --sourcemap false
```

A source map is a file that maps from the bundled source file to the original
source files, enabling the browser to reconstruct and present the original source
code in the debugger. So if there is an error in a file in the `/dist` directory,
the source map can tell you the original source file location.

Basically, source map is helpful for debugging and should be removed for production.

### Mode

Bundle is not minified in the development mode

```sh
nebula build --mode development
```

And minified in the production mode

```sh
nebula build --mode production
```

### Core build

You can export only the esm bundle by adding --core parameter.

To achieve that, you need to add a package.json file in the `/core` directory.
In the package.json file, a `module` field which specifies the output file
from the build is required:

```json
"module": "dist/hello.esm.js",
```

The package.json can also have a different list of peerDependencies changing
what dependencies are included in the output file.

Then run the following command:

```sh
nebula build --core
```

The code is exported into `/core` directory

When you want to specify your directory instead of the default one, you can move
that package.json file into your directory and run the following command:

```sh
nebula build --core minimal/target
```

The code is exported into `/minimal/target` directory

Tips:
In the package.json file, the main field makes sure that Node users using require
can be served the umd version. The module field is a common convention to designate
how to import an esm version of your code.

### SystemJS build

You can build a bundle using the SystemJS format by adding a `systemjs` field in the
package.json which specifies the output file from the build:

```json
"systemjs": "dist/hello.systemjs.js"
```

### Typescript

With this option you can enable typescript bundling of your code. The types are removed from the code, they are not
checked, and a `tsconfig.json` is not read: run `tsc --noEmit` for the check.

```sh
nebula build --typescript
```

## How it is built

The visualization is bundled with [Rolldown](https://rolldown.rs): `src/index` is bundled once for each of the formats

- UMD, to `main` of `package.json`. Always one file.
- ES module, to `module`, if there is one.
- SystemJS, to `systemjs`, if there is one and unless `--systemjs false`.
- with `--core`, the ES module of the `package.json` in the directory of the core package.

Rolldown has no SystemJS format. The ES bundle is converted to it with Rollup, one `System.register` per chunk, and the
source maps are chained, so that they point at the original sources. The conversion is in `lib/esm-to-systemjs.js`, it
is a copy of `tools/build/esm-to-systemjs.mjs` of the nebula.js repository, which the internal build of nebula.js
uses and which is not published. Keep them in line.

The code is transformed by Oxc, for the oldest version of each of the browsers of `@qlik/browserslist-config`, and JSX
with the automatic runtime (and development mode in development builds) for `.jsx` and `.tsx`. The production bundles
are minified with Terser.

Stylesheets are bundles too: `.css`, `.scss`, `.sass` and `.less` files are put into a `<style>` element in the head of
the document when the bundle is loaded, if there is a document. The default export of a stylesheet is its text and of a
CSS module (`*.module.css`, `*.module.scss`) the map of its class names, which are `[name]_[local]__[hash:base64:5]`. The
stylesheets go through PostCSS, with the plugins of the `postcss.config.js` of the project. `sass` and `less` are those
of the project.

## Differences from the previous (Rollup) build

The file names, the directories, the banner, the behaviours and the command line are the same. These are the
differences you can notice, in the order of how likely they are to matter:

- **Babel is not used.** The code is transformed by Oxc, for the same browsers. The `babel.config.js` of a project,
  which Babel looked for in the directory the build ran in, is no longer read, and so are the Babel plugins of it. Code
  that needs a Babel plugin (decorators, styled-components and the like) has to be transformed before it is bundled.
  Class fields and TypeScript constructs that only Babel supports are compiled the way Oxc does it.
- **TypeScript is stripped, not checked.** It was by Babel before as well, but `tsconfig.json` is read by neither.
- **Stylus is no longer supported** (`.styl` files), and `node-sass` is not used: Sass needs Dart Sass 1.45 or later,
  and `~package/file` imports in a Sass file work as before. The options of `rollup-plugin-postcss` (`use`, `extract`,
  `inject` and others) are gone, none of them could be set from the command line or the config file of nebula. Other
  file types than the four above are not understood, as before.
- **Node builtins are not dependencies of UMD and SystemJS bundles.** `require('crypto')` or `import('fs')` in a
  library, in a code path for node, made `crypto` a dependency of the UMD bundle (`define(['crypto'], ...)`) and of the
  SystemJS bundle, which an AMD or SystemJS host cannot load. They are now read where they are used, with `require`
  when there is one, and are an empty object otherwise. In the ES bundle they are still imports that the one that loads
  the bundle has to handle (a `require('crypto')` is a call of `require` that is kept in the bundle).
- **A property that is written to something nothing uses is left out**, as Rollup did for the objects and the classes
  of a prebuilt library, so that only what is imported ends up in the bundle. A write to a property of an imported
  object that the code does not use anywhere else, e.g. `import patched from 'lib'; patched.flag = true;`, is left out
  too, which Rollup did not do. Use the import, or `globalThis`, to make it count. Writes to the global object,
  or to objects that are exported or used, are kept.
- **The globals of externals in UMD bundles** are `stardust`, `React` and `ReactDOM` for the packages that have them,
  and for the other externals the last part of the name in camel case (`some-peer` is `somePeer`). Rollup guessed the
  name from how a package was imported, so `react` was `React` in some bundles and `react` in others.
- **Legal comments are at the top of the production bundles**, below the banner, once each, instead of where the code
  they belong to is. In development bundles they stay where they are.
- **UMD bundles of big dependencies can be larger**, when a dependency with CommonJS and ES modules that require each
  other is bundled, as Rolldown wraps the module that is required (a lazy initialisation) where Rollup merged it. A
  visualization of `@material-ui/icons` is 10% larger as UMD, the other formats are not.
- **An external that nothing uses is left out of the dependencies**, if it has no side effects: `import 'react-dom'` of
  a library that is then shaken out is not a dependency of the SystemJS bundle. It was.
- **Development bundles have a comment with the path of each module** (`// src/index.js`) and the helpers of Rolldown
  (`__commonJS`, `__toESM`) for the CommonJS modules, which have no source.
- **Logs differ.** The warnings of Rolldown (`MISSING_GLOBAL_NAME`, `MIXED_EXPORTS`, `UNRESOLVED_IMPORT`) have other
  texts than those of Rollup, and the circular dependency warnings are not logged. A warning about an import of a
  package that cannot be resolved is a warning, and the import is an external, as before.
- **Watch** emits the events of Rolldown, with the same `code`s as before (`BUNDLE_START`, `BUNDLE_END`, `ERROR`, and
  `START` and `END`) and a `close()`. `nebula serve` only needs those. The watcher of Rolldown starts and finishes the
  build of every bundle, and a `result` of the event is closed for you.
- **Dependencies:** Babel, `rollup-plugin-postcss`, `rollup-plugin-sass` and the Rollup plugins are no longer
  dependencies of this package, `rolldown`, `rollup` (only for SystemJS), `terser`, `postcss-modules`, `postcss-load-config`
  and `browserslist` are.

### Not changed

The source maps of a SystemJS bundle are chained and written to the `.map` file, the sources are relative to it. A
bundle of a package with a dynamic import needs `--inlineDynamic` or `--codeSplit` for the ES and SystemJS bundles, as it
did (the UMD bundle always inlines it). With `--codeSplit` the entry of the ES module and of the SystemJS bundle is
`index.js` in the first directory of its `package.json` field, and the chunks are next to it.
