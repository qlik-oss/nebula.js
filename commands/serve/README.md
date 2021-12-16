# @nebula.js/cli-serve

Basic web development server for nebula.js visualizations.

## Install

```sh
npm install @nebula.js/cli @nebula.js/cli-serve -g
```

## Usage

### CLI

```sh
nebula serve -h

Start a development server

Options:
  --version           Show version number                              [boolean]
  --config, -c        Path to JSON config file
                                          [string] [default: "nebula.config.js"]
  --entry             File entrypoint                                   [string]
  --type              Generic object type                               [string]
  --keyboardNavigation                                [boolean] [default: false]
  --build                                              [boolean] [default: true]
  --host                                         [string] [default: "localhost"]
  --port                                                                [number]
  --disableHostCheck                                  [boolean] [default: false]
  --resources         Path to a folder that will be served as static files under
                      /resources                                        [string]
  --scripts           Array of scripts to inject                         [array]
  --stylesheets       Array of stylesheets to inject                     [array]
  --enigma.host                                  [string] [default: "localhost"]
  --enigma.port                                         [number] [default: 9076]
  --webIntegrationId                                                    [string]
  --fixturePath       Path to a folder that will be used as basis when locating
                      fixtures              [string] [default: "test/component"]
  -h, --help          Show help                                        [boolean]
```

#### Example

Start the server and connect to enigma on port `9077`

```sh
nebula serve --enigma.port 9077
```

### Config file

nebula.config.js

```js
module.exports = {
  serve: {
    ...,
  },
};
```

Serve properties:

- types: Additional types to load into the serve instance. Useful in conjunction with useEmbed.
  - `ex: types: [{ name: 'barchart', url: "https://unpkg.com/@nebula.js/sn-bar-chart"}],`
- themes: Theme files to load
  - `ex: themes: [{ id: 'sense', theme: { /* valid sense json theme */ } }],`
- renderConfigs: configuration for the test renderer
- flags: Additional flag settings for feature toggling
  - `flags: { SOME_FEATURE: true }`
- resources: Adds path to /resources
- snapshots: Snapshots property structure, generally used for automated tests.

### node.js API

```js
const serve = require('@nebula.js/cli-serve');

serve({
  port: 3000,
  entry: path.resolve(__dirname, 'sn.js') // custom entrypoint
  enigma: {
    port: 9077
  }
}).then(s => {
  s.url; // serve url
  s.close(); // close the server
});
```
