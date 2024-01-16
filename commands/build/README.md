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
  --inlineDynamicImports    Inlines dynamic imports, allowing for code-splitting
                            regardless of format.
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

With this option you can enable typescript bundling of your code. Add a `tsconfig.json`
file to configure typescript to your own preferences.

```sh
nebula build --typescript
```
