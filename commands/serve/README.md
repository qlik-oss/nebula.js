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
  --config, -c        Path to a JavaScript config file
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
  --clientId          Your tenant's clientId for OAuth connection       [string]
  --webIntegrationId  Your tenant's webIntegrationId for connection     [string]
  --fixturePath       Path to a folder that will be used as basis when locating
                      fixtures              [string] [default: "test/component"]
  --mfe               Serves bundle to use in micro frontend           [boolean]
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

### Micro Frontend (MFE) Mode

The MFE mode, activated with the `--mfe` option, builds a visualisation which is
used in a micro frontend environemnt. The visualisation is served at:

```
https://<host>:<port>/pkg/<module name>
```

The module name is by default the name in `package.json` but may be overriden using the
`--type` option.

The MFE mode runs in HTTPS which requires certificates to be installed in the
environment running nebula serve.

The regular dev environment in nebula serve is disabled when running in this mode.

#### How to install trusted certificates locally

There are a few ways to install local trusted certificates on your machine, The important
end result is that there are two files `~/.certs/cert.pem` (the certificate) and
`~/.certs/key.pem` (the public key). Read about how certificates work
[here](http://www.steves-internet-guide.com/ssl-certificates-explained/). If you already
have a self-signed and trusted certificate in this location, then skip this guide.

##### Easy step-by-step guide to install and generate certificates locally

Install mkcert - [documentation](https://github.com/FiloSottile/mkcert)

```sh
brew install mkcert
```

Make sure the active directory is user folder and run the following:

```sh
$ mkdir ~/.certs

$ mkcert -install

$ mkcert -key-file ~/.certs/key.pem -cert-file ~/.certs/cert.pem localhost 127.0.0.1 ::1

```

Verify that two new files have appeared in the certs/ - folder
