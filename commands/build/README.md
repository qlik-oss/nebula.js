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
  --version        Show version number                                 [boolean]
  --config, -c     Path to JSON config file
                                          [string] [default: "nebula.config.js"]
  --watch, -w      Watch source files                 [boolean] [default: false]
  --sourcemap, -m  Generate source map                 [boolean] [default: true]
  --mode           Explicitly set mode
                                 [string] [choices: "production", "development"]
```

## Example

### Configuration file

Build the bundle with a nebula configuration json file in a new path

```sh
nebula build --config ../../nebula.config.js
```

In nebula.config.js, there are five available options that can be configured.

- Version
- Sourcemap
- Mode
- Core
- Theme

The following code in a nebula.config.js file demonstrates an example to set the nebula configuration.

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
  },
  serve: {
    themes: [{ id: 'sense', theme: defaultTheme }],
  },
};
```

### Watch files

Rebuild the bundle when files in `/src` folder change on the disk

```sh
nebula build --watch
```

### Source map

Build the bundle no need of generating source maps - `.js.map` files

```sh
nebula build --sourcemap false
```

A source map is a file that maps from the bundled source file to the original
source files, enabling the browser to reconstruct and present the original source
code in the debugger. So if there is an error in a file in the `/dist` directory,
the source map can tell you the original source file location.

Basically, sourcemap is helpful for debugging and should be removed for production.

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

To achive that, you need to add a package.json file in the `/core` directory.
In the package.json file, a `module` field which specifies the output file
from the build is required:

```json
"module": "dist/hello.esm.js",
```

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
