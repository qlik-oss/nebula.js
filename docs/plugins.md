---
id: plugins
title: Plugins
---

Plugins can be used to add or modify a visualization. Nebula provides a way to pass in plugins (through the `render` function of an `embed` instance), and to access provided plugins (through the `usePlugins` hook in the chart implementation).

## Render with plugins

```js
embed(app).render({
  element,
  type: 'my-chart',
  plugins: [plugin],
});
```

## How to implement a plugin

A plugin needs to be an object literal, including plugin info (`name`) and a function, `fn`, in which the plugin is implemented.

```js
const plugin = {
  info: {
    name: 'example-plugin',
  },
  fn: () => {
    // Plugin implementation goes here
  },
};
```

The `info` object is a suitable place to add more meta information if needed. Input and return value of the `fn` function is up to the plugin implementation to decide based on its purpose.

## Accessing plugins in chart implementation

Plugins passed at rendering can be accessed through the `usePlugins` hook in the following way:

```js
import { usePlugins } from '@nebula.js/stardust';
// ...
const plugins = usePlugins();
plugins.forEach((plugin) => {
  // Invoke plugin
  plugin.fn();
});
```
