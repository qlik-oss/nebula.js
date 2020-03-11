---
id: installation
title: Installation
---

All `nebula.js` modules are available on the public npm registry as npm packages and can be installed through either npm or as a script import.

`@nebula.js/supernova` and `@nebula.js/nucleus` are the two core modules that you will be using and are required when integrating `nebula.js` on the web.

## Script import

The easiest way to load the modules is from a CDN like `jsdelivr`:

```html
<script src="https://cdn.jsdelivr.net/npm/@nebula.js/supernova" crossorigin></script>
<script src="https://cdn.jsdelivr.net/npm/@nebula.js/nucleus" crossorigin></script>
```

Both are UMD packages and will add the variables `supernova` and `nucleus` to the global namespace.

For production, it is recommended to use a specific version of each module to avoid surprises from newer or breaking versions of the APIs:

```html
<script src="https://cdn.jsdelivr.net/npm/@nebula.js/supernova@0.1.1" crossorigin></script>
<script src="https://cdn.jsdelivr.net/npm/@nebula.js/nucleus@0.1.1" crossorigin></script>
```

## Npm or yarn

If you are building your own web project using Webpack, Rollup, Parcel or similar you can install the packages with npm:

```bash
$ npm install @nebula.js/supernova @nebula.js/nucleus
```

or yarn:

```bash
$ yarn add @nebula.js/supernova @nebula.js/nucleus
```

and then import `nucleus` wherever you're using it:

```js
import nucleus from '@nebula.js/nucleus';
```

You should not need to import `@nebula.js/supernova` yourself, it is a dependency to most charts and will be resolved automatically by the bundling tool when needed.

## CLI

`nebula.js` provides a CLI for quickly getting started with a supernova project and provides a development server to help you during the
development phase.

```bash
$ npm install @nebula.js/cli
```

## Development builds

Some modules are available as a development build which provide more errors and warnings when detecting potentially bad usage of the APIs.
You should only use these during the development phase of your project, never in production.

```html
<script src="https://cdn.jsdelivr.net/npm/@nebula.js/supernova@0.1.1/dist/supernova.dev.js" crossorigin></script>
<script src="https://cdn.jsdelivr.net/npm/@nebula.js/nucleus@0.1.1/dist/nucleus.dev.js" crossorigin></script>
```
