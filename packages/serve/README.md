# @nebula.js/cli-serve

Basic web development server for supernovas.

## Install

```sh
npm install @nebula.js/cli -g
```

## Usage

### CLI

```sh
nebula serve -h

Dev server

Options:
  --version      Show version number                                   [boolean]
  --entry        File entrypoint                                        [string]
  --build                                              [boolean] [default: true]
  --host                                                                [string]
  --port                                                                [number]
  --enigma.host                                                         [string]
  --enigma.port                                                  [default: 9076]
  -h, --help     Show help                                             [boolean]
```

#### Example

Start the server and connect to enigma on port `9077`
```sh
nebula serve --enigma.port 9077
```

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
