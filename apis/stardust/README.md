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
