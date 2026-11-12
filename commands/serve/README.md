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
      --version             Show version number                        [boolean]
  -c, --config              Path to JSON config file
                                          [string] [default: "nebula.config.js"]
      --entry               File entrypoint                             [string]
      --type                Generic object type                         [string]
      --build               Build the nebula visualization into /dist dictionary
                                                       [boolean] [default: true]
      --host                Specify a host to use[string] [default: "localhost"]
  -p, --port                Specify a port number to listen for requests on
                                                                        [number]
      --disableHostCheck    Bypasses host checking    [boolean] [default: false]
      --keyboardNavigation  Whether or not Nebula handles keyboard navigation
                                                      [boolean] [default: false]
      --resources           Path to a folder that will be served as static files
                            under /resources                            [string]
      --scripts             Array of scripts to inject                   [array]
      --stylesheets         Array of stylesheets to inject               [array]
      --enigma.host         Set host to communicate with Qlik Associative Engine
                                                 [string] [default: "localhost"]
      --enigma.port         Set port to communicate with Qlik Associative Engine
                                                        [number] [default: 9076]
      --clientId            Tenant's clientId for OAuth connection      [string]
      --webIntegrationId    Tenant's webIntegrationId for connection    [string]
      --fixturePath         Path to a folder that will be used as basis when
                            locating fixtures
                                            [string] [default: "test/component"]
  -h, --help                Show help                                  [boolean]
      --open                Open up in browser         [boolean] [default: true]
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

- types: Additional types to load into the serve instance. Useful in conjunction with useEmbed. The `url` is an es module.
  - `ex: types: [{ name: 'barchart', url: "https://example.com/sn-bar-chart.esm.js"}],`
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

### The visualization

`nebula serve` builds the visualization as an es module, with `nebula build --watch`, and loads it into the page. The
file is the `module` field of `package.json`, which has to be set.

The page has `@nebula.js/stardust`, `react`, `react-dom`, `react-dom/client` and `react/jsx-runtime`, and the
visualization imports those by their names, so that the page and the visualization share one of each. Any other module
is bundled into the visualization, also the ones that are `peerDependencies` of it.

A code split `module` imports its chunks from the `chunks` directory beside the entry, which nebula build writes.

### SystemJS and es module

Nebula serve serves the es module (the `module` field of `package.json`) and the SystemJS module (the `systemjs` field),
which it builds and watches beside the es module of the web app:

```
http://<host>:<port>/<package name>.js       the SystemJS module
http://<host>:<port>/<package name>.esm.js   the es module
```

The package name has the `@` removed and the `/` replaced by `-`, `@scope/sn-viz` is served at `/scope-sn-viz.js` and
`/scope-sn-viz.esm.js`. The files are not copied, they are served from where nebula build wrote them. A code split module
imports its chunks from `chunks` relative to its url, and `/chunks` is served from the `chunks` directory beside the
module. `--type` overrides the package name.

### HTTPS

The `--https` option serves over HTTPS, which requires certificates to be installed in the environment running nebula
serve. Use it when the page that loads the SystemJS module is served over HTTPS.

#### How to install trusted certificates locally

There are a few ways to install locally trusted certificates on your machine, The important
end result is that there are two files `~/.certs/cert.pem` (the certificate) and
`~/.certs/key.pem` (the public key). Read about how certificates work
[here](http://www.steves-internet-guide.com/ssl-certificates-explained/). If you already
have a self-signed and trusted certificate in this location, then skip this guide.

##### Easy step-by-step guide to install and generate certificates locally

Install mkcert - [documentation](https://github.com/FiloSottile/mkcert)

```sh
brew install mkcert
```

Make sure the active directory is the user folder and run the following:

```sh
$ mkdir ~/.certs

$ mkcert -install

$ mkcert -key-file ~/.certs/key.pem -cert-file ~/.certs/cert.pem localhost 127.0.0.1 ::1

```

Verify that two new files have appeared in the certs/ - folder

### Developing nebula serve

The pages of `nebula serve` (the hub and the page that renders a visualization) are built with the package, into `dist`, by the `rsbuild.config.mjs` of the package. To work on them and on the packages they use from source, with hot reload, run this in `commands/serve` of this repository:

```sh
pnpm start --entry ../../test/fixtures/viz/listbox
```

It takes the arguments of `nebula serve`. It is not part of the published package, which serves the built pages. The `MONO` environment variable that used to turn this on is gone.

### More info

[Rsbuild](https://rsbuild.rs) builds the pages of the web development server for nebula.js visualizations and serves them. You can find more info from the [Rsbuild configuration](https://rsbuild.rs/config/) and the [dev server](https://rsbuild.rs/config/server/).
