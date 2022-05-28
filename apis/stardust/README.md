# stardust

Stardust is a JavaScript library for building and embedding visualizations on top of Qlik's Associative Engine.

## Installation

```sh
npm install @nebula.js/stardust
```

## Example usage

```js
import { embed } from '@nebula.js/stardust';
import mekko from '@nebula.js/sn-mekko-chart';

const orion = embed.createConfiguration({
  types: [{
    name: 'mekko',
    load: () => Promise.resolve(mekko);
  }]
})(app);

orion.render({
  element,
  type: 'mekko',
  fields: ['Product', 'Region', 'Sales']
});
```

## Typescript

Stardust comes with typescript definitions. It references the Qlik's Engine definitions published at @types/qlik-engineapi.

When installing Stardust it also installs the package @types/qlik-engineapi. Use [overrides](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#overrides) in your package.json if the installed version deviates from the Qlik Engine you are using:

```json
{
  "overrides": {
    "@types/qlik-engineapi": "<your-engine-version>"
  },
  ...
}
```
