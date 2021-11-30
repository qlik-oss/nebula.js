# Fixture format

## Purpose

The fixture is a set of configurations which specifies the visualization to render and how it behaves. For example, type of visualization, what data to display, theme to use and which feature flags to activate.

Rendering a visualization from a fixture multiple times yields the same result. This makes fixture rendering ideal to use in tests to verify that the visualization works as expected.

## Example

```js
import gridChart from '@nebula.js/sn-grid-chart';

export default () => ({
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
});
```

## Fixture configurations

### `type`

Name of visualization. For example, `sn-grid-chart`.

### `load`

Function loading visualization to render.

Example using imports:

```js
import simpleVisualization from './simpleVisualization';
export default () => ({
  load: async () => simpleVisualization,
  ...
});
```

### `instanceConfig`

Configurations when initiating embed instance (`embed(app, instanceConfig)`).

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

Configurations when rendering supernova visualization (`nebbie.render(snConfig)`).

```js
export default () => ({
  snConfig: {
    options: {
      myOption: 'option',
    },
    // ...
  },
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

When starting Nebula serve a number of configurations may be added, e.g. type of visualization. These configurations are used as fallback values in case no value is present in the fixture. This is useful to reduce the amount of boilerplate config in the fixtures.

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

Specify feature flags to enable / disable.
