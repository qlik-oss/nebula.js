# @nebula.js/enigma-mocker

The purpose of the Enigma mocker is to be able to render charts without a connected engine. This is useful for example when running rendering tests or in code examples.

## Installation

```sh
npm install @nebula.js/enigma-mocker
```

## Example usage

```js
import { embed } from '@nebula.js/stardust';
import EnigmaMocker from '@nebula.js/enigma-mocker';
import mekko from '@nebula.js/sn-mekko-chart';

const fixture = {
  getLayout() {
    return {
      qInfo: {
        qId: 'qqj4zx',
        qType: 'sn-grid-chart'
      },
      ...
    }
   },
   getHyperCubeData(path, page) {
     return [ ... ];
   }
 };
const app = await EnigmaMocker.fromFixture(fixture);

const orion = embed(app, {
  types: [{
    name: 'mekko',
    load: () => Promise.resolve(mekko);
  }]
});

orion.render({
  element,
  type: 'mekko',
  fields: ['Product', 'Region', 'Sales']
});
```

## Fixture

The fixture specifies how the mock should behave. For example, what layout to use and the data to present.

The fixture is a JavaScript object with a number of properties. The name of the property correlates to the function name in Enigma. For example the property `getLayout` in the fixture is used to define `app.getObject().getLayout()` . Any property can be added to the fixture (just make sure it exists and behaves as in Enigma!).

The property value in the fixture is either fixed (string / boolean / number / object) or a function. Arguments are forwarded to the function to allow for greater flexibility. For example, this can be used to return different hypercube data when scrolling in the chart.

Example with fixed values:

```js
{
  getLayout: {
    qInfo: {
      qId: 'qqj4zx',
      qType: 'sn-grid-chart'
    }
  },
  getHyperCubeData: [ ... ]
}
```

Example with functions:

```js
{
  getLayout() {
    return {
      qInfo: {
        qId: 'qqj4zx',
        qType: 'sn-grid-chart'
      }
    }
  },
  getHyperCubeData(path, page) {
    return [ ... ];
  }
}
```
