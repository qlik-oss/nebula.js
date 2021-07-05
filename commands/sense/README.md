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

## Extension

### EXT

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

The rest of the required information is populated automatically based on the content in `package.json`.

### Output

The command generates all required files into the specified `--output` folder. You can the zip the folder and upload it as an extension on [Qlik Sense Enterprise for Windows](https://help.qlik.com/en-US/sense-developer/April2020/Subsystems/Extensions/Content/Sense_Extensions/Howtos/deploy-extensions.htm) or [Qlik Sense Enterprise on Kubernetes](https://help.qlik.com/en-US/sense-admin/April2020/Subsystems/DeployAdministerQSE/Content/Sense_DeployAdminister/QSEoK/Administer_QSEoK/mc-extensions.htm)

```bash
nebula sense --output sn-table-ext
```

### Legacy

 Explictly declaring legacy to generate legacy extension to run in old qlik sense which does not support nebula supernova

```bash
nebula sense --legacy
```
