---
id: serve
title: Serve
---

Use the `serve` command to start a basic web development server for supernovas.

## Usage

```
nebula serve
```


There are a number of arguments you can supply: 

| Argument     | Purpose                            | Type     |
| ------------ | -----------------------------------|--------- |
| `--version`  | Show version number                | [boolean]|
| `--entry`    | File entry point                   | [string] |
| `--build`    |                                    | [boolean] [default: true] |
| `--host`     | Specify host                       | [string] |
| `--port`     | Run on specific host               | [string] |
| `--enigma.host` | Specify enigma host              | [string] |
| `--enigma.port` | Specify enigma port              | [string] [default: 9076] |
| `-h, --help` | Show help                          | [boolean]|

### Example

Start the server and connect to enigma on port `9077`
```
nebula serve --enigma.port 9077
```

## Node.js API

```JavaScript
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