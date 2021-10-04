# @nebula.js/cli-sense

The `nebula sense` command builds a nebula visualization so that it can be used as an extension in Qlik Sense.

## Install

```sh
npm install @nebula.js/cli
```

## Usage

```sh
nebula sense

Build a nebula visualization as a Qlik Sense extension

Options:
  --version    Show version number                                     [boolean]
  --ext        Extension definition                                     [string]
  --meta       Extension meta information                               [string]
  --output     Destination directory            [string] [default: "<name>-ext"]
  --minify     Minify and uglify code                  [boolean] [default: true]
  --sourcemap  Generate sourcemaps                    [boolean] [default: false]
  --legacy     Generate legacy extension              [boolean] [default: false]
  -h, --help   Show help                                               [boolean]
```

## Example

### EXT

You can set property panel definition and feature supprts by creating a separate file for the extension info and providing it as argument to `--ext`:

Create a file called def.js and add the following:

```js
// def.js
export default {
  definition: {
    // Property panel definition
  },
  support: {
    export: true,
    exportData: true,
    snapshot: true,
    viewData: true,
  },
  importProperties: null,
  exportProperties: null,
};
```

Run the command:

```bash
nebula sense --ext def.js
```

Note:
Using the --ext option will overwrite any ext definition already presented on the chart, its main purpose is to support legacy option below.

### Meta

You can improve meta info about the extension, such as extension name, extension
icon, and description by providing a `.json` formatted file and supply that filename
as an argument to the `nebula sense` command with `--meta` option.

Create a file called meta.json and add the following code demonstrating an example
to set the extension meta information:

```json
{
  "name": "My tasty banana extension",
  "icon": "barchart",
  "description": "Nebula test table wrapped in a Qlik Sense extension"
}
```

Run the command:

```bash
nebula sense --meta meta.json
```

The meta data will be ended up in the `.qext` file used by the Qlik Sense.

Copy the updated `your-chart-ext` directory to your `Extension` directory,
overwriting the old version. Then the meta data of the extension has been changed.

The rest of the required information is populated automatically based on the content in `package.json`.

### Output

Generate all required files into the specified `--output` folder called sn-table-ext:

```bash
nebula sense --output sn-table-ext
```

You can upload that folder as an extension on [Qlik Sense Enterprise for Windows](https://help.qlik.com/en-US/sense-developer/August2021/Subsystems/Extensions/Content/Sense_Extensions/Howtos/deploy-extensions.htm) or [SaaS editions of Qlik Sense](https://help.qlik.com/en-US/cloud-services/Subsystems/Hub/Content/Sense_Hub/Admin/mc-extensions.htm)

### QEXT

Running nebula sense generates a `QEXT` file for you, which is
required for loading the visualization into sense.

The `QEXT` file can also be manually created by yourself.
Create a file called `your-extension-name.qext` and add the following code as an
example:

```json
{
  "name": "your-extension-name",
  "version": "0.1.0",
  "description": "",
  "author": {
    "name": "",
    "email": ""
  },
  "icon": "extension",
  "type": "visualization",
  "supernova": true
}
```

The `"supernova": true` attribute should not be added when building with the
--legacy option below.

### Legacy

Qlik Sense before 2020 does not support nebula supernova natively, so a special
build path is needed for visualizations to load properly in the client.
For this purpose, use the --legacy option.

```bash
nebula sense --legacy
```

You can find that the generated `QEXT` file does not include `supernova: true`.

Note:
For old Qlik Sense, not all features of extension are presented.
