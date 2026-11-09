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
                                            [choices: "esm", "systemjs"] [default: "esm"]
  --sourcemap, -m           Generate source map                 [boolean] [default: true]
  --mode                    Explicitly set mode
                                          [string] [choices: "production", "development"]
  --core                    Set a core build target            [string] [default: "core"]
  --typescript              Enable typescript bundling         [boolean] [default: false]
  --browser                 Use the 'browser' field and export condition of the packages
                            in the bundle so browser conditionals in exports are applied.
                                                                [boolean] [default: true]
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
The `module` field of package.json is the file of the es module that is built, and the
`systemjs` field the file of the SystemJS module. A build needs at least one of them. There is
no UMD bundle, the `main` field is not used by the build.

### SystemJS build

You can build a bundle using the SystemJS format by adding a `systemjs` field in the
package.json which specifies the output file from the build:

```json
"systemjs": "dist/hello.systemjs.js"
```

### Styles

Stylesheets that the source imports are added to the bundle and injected in a `<style>` element
in the document head when the bundle is loaded, nothing is injected when there is no `document`.

- `import './style.css'` adds the stylesheet. PostCSS is applied, using the `postcss.config.js` of your project if there is one.
- `import styles from './style.module.css'` is a CSS module, `styles` maps the class names of the file to the generated ones.
- `import './style.scss'` is compiled when `sass` is installed in your project, `import './style.less'` when `less` is.

### Typescript

With this option you can enable typescript bundling of your code. Add a `tsconfig.json`
file to configure typescript to your own preferences.

```sh
nebula build --typescript
```

## Building with Rslib

The bundles are built with [Rslib](https://rslib.rs), on [Rspack](https://rspack.rs). The output has the same formats and behaves the
same way as it did when the bundler was Rollup, with these differences to be aware of when you upgrade:

- The generated class names of CSS modules have another hash (`name_class__hash`).
- `replacementStrings` are applied as definitions, a key has to be an identifier or a member expression
  such as `__VERSION__` or `process.env.VERSION`, not any piece of text, and the value is the code that replaces it.
- With `--reactNative`, a `.native` file replaces the file it sits next to when it is imported without a file extension.
- An import that cannot be resolved is an error, it used to be left as an external dependency with a warning. Add the package to the dependencies, or to the peer dependencies when the host provides it.
- Node.js built-in modules are not bundled and not dependencies, importing one gives an empty module unless a package of that name is installed. `--preferBuiltins` is removed.
- The `bundle-analysis.html` that development builds used to write is no longer created.
- `@rollup/plugin-typescript` is not needed for `--typescript`, TypeScript is compiled with SWC. The code, and the packages in `node_modules`, are compiled for the browsers of `@qlik/browserslist-config`.
- Stylus (`.styl`) files are not supported.
- With `--codeSplit` a SystemJS build is the entry `index.js` and a chunk per dynamic import. The chunks are loaded from the directory that SystemJS loaded the entry from, also when the entry file is renamed.
- **The UMD bundle is gone.** `nebula build` writes the es module (`module`) and the SystemJS module (`systemjs`), and `--watch` watches `esm` or `systemjs`. The entry of a bundle is an es module: an entry that is a CommonJS module (`module.exports = …`) has no exports in the es module, its properties are the named exports of the SystemJS module.
- A bundle contains a small module runtime, so the output of a very small visualization is a few kilobytes larger.
- A flag or a key in the `build` section of the config file that `nebula build` does not know of is an error (`Unknown argument: foo`), and no longer ignored. A misspelled option used to do nothing.
- The notices of the licenses (`/*!`, `@license`, `@preserve`) of the code in a production bundle are written to `<bundle>.LICENSE.txt` next to it, and no longer kept in the bundle. Publish that file with the bundle.
