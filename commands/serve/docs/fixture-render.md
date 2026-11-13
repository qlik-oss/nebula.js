# Render visualization from fixture

Nebula serve supports rendering a visualization from a fixture. The fixture specifies which visualization to render and how it should look and behave. See `fixture-format.md` for details about fixtures.

Render a visualization by providing the fixture parameter value to the rendering service.

Example: `http://localhost:8000/render?fixture=scenario-1.fix.js`

## Specify a fixture

Use the serve config `--fixturePath` to specify where your fixtures are located (starting from the working directory). Without it, no fixtures are available.

For example, with `--fixturePath test/component` and the fixture parameter in the URL set to `scenario-1.fix.js`, the fixture will be expected to be found at `<work-dir>/test/component/scenario-1.fix.js`. Note that the file name of the fixture needs to end with `.fix.js`.

Given the project structure:

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

...and `package.json` including test script launching Nebula serve with `--fixturePath test/rendering/__fixtures__` the URL to launch a fixture is:

```
http://localhost:8000/render?fixture=scenario-1.fix.js
```

## Additional configurations

The fixture includes information about how to render the visualization. In some cases it's useful to reuse the fixtures but slightly alter how it's rendered. For example, render the chart with different themes or in various languages.

This can be achieved by specifying URL query parameters. See below for supported parameters.

### `theme`

Theme to use when rendering visualization.

Specify an array of available themes in the instance config. Provide the `id` of theme to use as the parameter value.

### `language`

Language to use when rendering visualization.

### `rerenders`

Number of destroy-and-re-render cycles to run after the initial render. After each cycle `data-render-count` on `#chart-container` is incremented, so when it reaches `N` all cycles are complete.

Intended for memory leak testing. The recommended pattern is two separate navigations: first load the fixture without `rerenders` and take a baseline heap snapshot, then reload with `rerenders=N` and take the after-snapshot once `#chart-container[data-render-count='N']` is present.

Example: `http://localhost:8000/render?fixture=scenario-1.fix.js&rerenders=20`

### `simulatedMemLeakKB`

Wraps the fixture's `getLayout` to accumulate approximately the given number of kilobytes of plain JS objects per render cycle, pinned to the DOM so the garbage collector cannot reclaim them. Use together with `rerenders` to verify that your memory measurement infrastructure can detect a real leak before trusting clean-chart results.

This parameter has no effect unless `rerenders` is also set.

Example leaking 500 KB per cycle: `http://localhost:8000/render?fixture=scenario-1.fix.js&rerenders=20&simulatedMemLeakKB=500`
