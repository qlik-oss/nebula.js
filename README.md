<p align="center">
  <img width="500" src="./docs/assets/logos/nebula.png" alt="nebula.js logo" />
</p>
<p align="center">A new star on the rise</p>

# !!EXPERIMENTAL!!

NebulaJS is a collection of JavaScript libraries, charts and CLIs that helps developers build and integrate visualizations on top of Qlik's Associative Engine. The collection is organized under the `@nebula.js` npm scope.

The primary package is `@nebula.js/stardust` which contains APIs for integrating existing visualizations into mashups, as well as APIs for building custom visualizations.

## Roadmap

Since `stardust` is still in an early stage we are very much open to input and suggestions. If you think something is missing, an API is weird or have general opinions about anything, let us know.

_Your opinions, requirements and involvement is key to the success of this project._ Click on the linked issues below ([or create you own](https://github.com/qlik-oss/nebula.js/issues/new/choose)), voice your opinion and vote if you would like to see it get implemented.

**Documentation**

Documentation is about 60% complete and is temporarily hosted on https://rising-star-62d64c.netlify.app/ .

---

This is a draft of the roadmap ahead:

**Integration API (stardust)**

- theming ([#24](https://github.com/qlik-oss/nebula.js/issues/24))
- translations, localization ([#25](https://github.com/qlik-oss/nebula.js/issues/25))
- error handling
- export ([#26](https://github.com/qlik-oss/nebula.js/issues/26))
- take and consume snapshot ([#29](https://github.com/qlik-oss/nebula.js/issues/29))
- versioning ([#39](https://github.com/qlik-oss/nebula.js/issues/39))
- deduce data targets from properties
- type definitions ([#40](https://github.com/qlik-oss/nebula.js/issues/40))

**CLI**

- create
  - more templates ([#31](https://github.com/qlik-oss/nebula.js/issues/31))
- build
  - support more loaders ([#32](https://github.com/qlik-oss/nebula.js/issues/32))
- serve
  - assets ([#35](https://github.com/qlik-oss/nebula.js/issues/35))
  - generate property panel from properties ([#34](https://github.com/qlik-oss/nebula.js/issues/34))
  - developer hints
  - theme editor ([#37](https://github.com/qlik-oss/nebula.js/issues/37))
- sense
  - generate property panel definition based on initialProperties
  - adapt Sense theme to nebula ([#38](https://github.com/qlik-oss/nebula.js/issues/38))

## Try it out

### Prerequisites

- node.js `v8.0.0+`
- Access to Qlik Associative Engine
  - which comes bundled with one of the following products
    - Qlik Sense Desktop
  - or by running it in a Docker container through either
    - Qlik Core
    - or the `qlikcore/engine` image

### Creating a new project

The easiest way to get started is to create a new project using the nebula CLI through `npx`:

```sh
npx @nebula.js/cli create hello-sunshine
```

or by doing a global install and running the `nebula` command:

```sh
npm install @nebula.js/cli -g
nebula create hello-sunshine
```

This will create a directory called `hello-sunshine` with the following content:

```sh
hello-sunshine
├─ README.md
├─ package.json
├─ .editorconfig
├─ .eslintrc.json
├─ .gitignore
└─ src
   ├─ index.js
   └─ object-properties.js
```

The `package.json` contains a few built-in npm commands:

- `npm start`

  Starts a web development server.

  The server needs to connect to a running instance of Qlik Engine and by default assumes it's already running on port `9076`. If you don't have Qlik Sense desktop installed you can opt-in to start a Docker image of Qlik Engine by accepting the [Qlik Core EULA](https://core.qlik.com/eula/):

  ```sh
  cross-env ACCEPT_EULA=yes npm start
  ```

- `npm run build`

  Builds the supernova for production into the `dist` folder. At this stage you can publish the supernova to npm using the command `npm publish`.

- `npm lint`

  Checks for code syntax issues.

## Contributing

Please follow the instructions in our [contributing guide](./.github/CONTRIBUTING.md).

## Resources

| name             | status                       | description |
| ---------------- | ---------------------------- | ----------- |
| [sn-mekko-chart] | [![mekko-status]][mekko-npm] | Mekko chart |

[sn-mekko-chart]: https://github.com/qlik-oss/sn-mekko-chart
[mekko-status]: https://img.shields.io/npm/v/@nebula.js/sn-mekko-chart.svg
[mekko-npm]: https://www.npmjs.com/package/@nebula.js/sn-mekko-chart
