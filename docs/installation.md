---
id: installation
title: Installation
---

All `nebula.js` modules are available on the public npm registry as npm packages and can be installed through either npm or as a script import.

`@nebula.js/stardust` is the primary module that you will be using and is required when integrating `nebula.js` on the web.

## Script import

The easiest way to load the module is from a CDN like `jsdelivr`:

```html
<script src="https://cdn.jsdelivr.net/npm/@nebula.js/stardust" crossorigin></script>
```

When imported using the script tag, it will add the variable `stardust` to the global namespace.

For production, it is recommended to use a specific version of the module to avoid surprises from newer or breaking versions of the APIs:

```html
<script src="https://cdn.jsdelivr.net/npm/@nebula.js/stardust@0.6.0" crossorigin></script>
```

## Npm or yarn

If you are building your own web project using Webpack, Rollup, Parcel or similar you can install the package with npm:

```bash
$ npm install @nebula.js/stardust
```

or yarn:

```bash
$ yarn add @nebula.js/stardust
```

and then import `{ embed }` wherever you intend to embed a visualization:

```js
import { embed } from '@nebula.js/stardust';
```

## CLI

`nebula.js` provides a CLI for quickly getting started with a project and provides a development server to help you during the
development phase.

```bash
$ npm install @nebula.js/cli
```

## Development builds

Some modules are available as a development build which provide more errors and warnings when detecting potentially bad usage of the APIs.
You should only use these during the development phase of your project, never in production.

```html
<script src="https://cdn.jsdelivr.net/npm/@nebula.js/stardust@0.6.0/dist/stardust.dev.js" crossorigin></script>
```

## Linking Nebula packages to your own repository

When you use Nebula.js as a dependency in your project, and you want to edit or debug the Nebula.js source code, you can use either `npm link` or `yarn link` to accomplish this.

### Linking Nebula when using `nebula serve`

With `npm`: When using `nebula serve` to serve your project's files, you must run `npm link` in the folder: `nebula.js/commands/serve`.
Then use it in your own repo by running `npm link @nebula.js/cli-serve` (run this in your own repo).
To include source maps, so you can easier debug the Nebula.js code, you should also run `yarn build:dev` in the `nebula.js/commands/serve` folder.

With `yarn`: Same as for `npm` but replace `npm` with `yarn` in the commands above.

In your browser's debugging tool you should now be able to see the Nebula.js source code and to add breakpoints inside of the Nebula.js files.
