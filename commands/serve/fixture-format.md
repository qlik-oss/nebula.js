# Fixture format

## Purpose

...

## Example

```js
import gridChart from '@nebula.js/grid-chart';

export default () => {
  return {
    type: 'sn-grid-chart',
    load: async () => gridChart,
    instanceConfig: {
      context: {
        theme: 'dark',
      }
    },
    snConfig: {
      ...
    },
    genericObjects: [ ... ]
  };
}
```

## Options

### `type`

Name of visualization. For example, `sn-grid-chart`.

### `load`

Function loading visualization to render.

Example using imports:

```js
import gridChart from '@nebula.js/grid-chart';
export default () => ({
  load: async () => gridChart,
  ...
});
```

Example:

```js
const visuzalition = (env) => ({
  qae: {
    properties: {
      qHyperCubeDef: {},
      simpleMath: {
        qValueExpression: {
          qExpr: '1+1'
        }
      }
    },
  },
  component() {
    const layout = useLayout();
    console.log(layout); // { qHyperCube: , simpleMath: 2 }
  },
});

export default () => ({
  load: async () => visualization,
  ...
});
```

### `instanceConfig`

Configurations when initating embed instance (`embed(app, instanceConfig)`).

```js
export default () => ({
  context: {
    theme: 'dark'
  },
  ...
});
```

```js
export default () => ({
  context: {
    constraints: {
      select: true
    },
    flags: {
      IMPROVED_GRID_CHART: true
    }
  },
  ...
});
```

### `snConfig`

Configurations when rendering supernova visualization (`nebbie.render({ snConfig })`).

```js
export default () => ({
  snConfig: {
    examples: {
      ...
    }
  },
  ...
});
```

### `genericObjects`

Generic objects to render visualization with. The objects are used as input to `EnigmaMocker` to base mock upon. See `@nebula.js/enigma-mocker` for more details.

```js
export default () => ({
  genericObjects: [{
    getLayout() {
      return {
        qInfo: { qId: 'uttss2' }
      };
    }
    getHyperCubeData() {
      return [ ... ];
    }
  }]
});
```

## Serve configurations

When starting Nebula serve a number of configurations may be added, e.g. type of visualization. These configurations are used as fallback values in case no value is present in the fixture.

### `type`

Specify type of visualization.

```sh
nebula serve --type sn-grid-chart
```

### `entry`

Specify visualization artifact / project to render. When registering the visualization type the supplied artifact will be used to render it.

```sh
nebula serve --entry ./dist/sn-grid-chart.js
```

### `flags`

## URL query params

### `theme`

### `langauge`

## Render fixture

Base url: `http://host:port/render`

Provide fixture as query param. The fixture param value is relative path to the working directory where `nebula serve` is run.

Given project structure:

```
sn-grid-chart
│   README.md
│   package.json
│
└───src
│   │   index.js
│   │   ...
│
└───test
    └───rendering
        │   └───__fixtures__
        │       │   scenario-1.fix.js
        │       │   scenario-2.fix.js
        │       │   ...
        |
        │   grid-chart.spec.js
```

...and `package.json` including test script launching Nebula serve the URL to launch a fixture is:

```
http://localhost:8000/render?fixture=./test/rendering/__fixtures__/scenario-1.fix.js
```

Improvement: Provide path to fixture location as Nebula serve config
