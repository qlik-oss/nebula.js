# Render visualization from fixture

Nebula serve supports rendering a visualization from a fixture. The fixture specifies which visualization to render and how it should look and behave. See `fixture-format.md` for details about fixtures.

Render a visualization by providing the fixture parameter value to the rendering service.

Example: `http://localhost:8000/render?fixture=scenario-1.fix.js`

## Specify a fixture

By default Nebula serve looks for fixtures within the path `test/component` (starting from the working directory).

For example, if the fixture parameter in the URL is set to `scenario-1.fix.js` the fixture will be expected to be found at `<work-dir>/test/componet/scenario-1.fix.js`.

Use the serve config `--fixturePath` to specify where your fixtures are located. Note that file name of the fixture needs to end with `.fix.js`.

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

### `langauge`

Language to use when rendering visualization.
