# @nebula.js/enigma-mocker

The purpose of the Enigma mocker is to be able to render visualizations without a connected engine. This is useful for example when running rendering tests or to make runnable code examples.

## Installation

```sh
npm install @nebula.js/enigma-mocker
```

## Example usage

```js
import { embed } from '@nebula.js/stardust';
import EnigmaMocker from '@nebula.js/enigma-mocker';
import mekko from '@nebula.js/sn-mekko-chart';

const genericObject = {
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
const app = await EnigmaMocker.fromGenericObjects(genericObject);

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

## Generic objects

The mocked enigma app can be created from one or more generic objects using `EnigmaMocker.fromGenericObjects(genericObjects)`. Each generic object represents one visulization and specifies how it behaves. For example, what layout to use the data to present.

The generic object is represented by a Javascript object with a number of properties. The name of the property correlates to the name in the Enigma model for `app.getObject(id)`. For example, the property `getLayout` in the generic object is used to define `app.getObject(id).getLayout()`. Any property can be added to the fixture (just make sure it exists and behaves as in the Enigma model!).

Structure of mocked enigma app:

```js
{
  id: ...,
  getObject(id) {
    // Properties of generic object is added here
  },
};
```

The value for each property is either fixed (string / boolean / number / object) or a function. Arguments are forwarded to the function to allow for greater flexibility. For example, this can be used to return different hypercube data when scrolling in the chart.

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
