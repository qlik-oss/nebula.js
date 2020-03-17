# @nebula.js/cli-sense

## Install

```sh
npm install @nebula.js/cli
```

## Usage

```sh
nebula sense

Build a supernova as a Qlik Sense extension

Options:
  --version    Show version number                                     [boolean]
  --ext        Extension definition                                     [string]
  --meta       Extension meta information                               [string]
  --minify     Minify and uglify code                  [boolean] [default: true]
  --sourcemap  Generate sourcemaps                    [boolean] [default: false]
  -h, --help   Show help                                               [boolean]
```

### Extension

You can provide some additional information as part of the Qlik Sense Extension API by creating a separate file for the extension info and providing it as argument to `--ext`:

```js
// def.js
export default {
  definition: {
    // Property panel definition
  },
  support: {
    exportData: true,
  },
};
```

```bash
nebula sense --ext def.js
```

The provided file will be transpiled and placed in the folder `/dist-ext`. Two additional files will be created which are the entrypoints for the extension in Qlik Sense; If your supernova module is named `banana-chart`, the files `banana-chart.js` and `banana-chart.qext` will be created in the root of your project. If you have a `files` property in your `package.json` you should include these files in addition to the already existing ones:

```json
{
  "name": "banana-chart",
  "files": [
    "// other files",
    "dist-ext",
    "banana-chart.js"
    "banana-chart.qext"
  ]
}
```

### Meta

You can add more meta about the extension by providing a `.json` formatted file with `--meta`:

```json
{
  "name": "My tasty banana extension",
  "icon": "barchart"
}
```

```bash
nebula sense --meta meta.json
```

The rest of the required information will be populated automatically.
