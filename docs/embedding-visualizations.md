---
id: embedding-visualizations
title: Embedding visualizations
---

You can embed a visualization in two ways:

1. On the fly
1. From an existing object

Rendering is done using the `render()` method on the instance returned by the `embed` function, which at minimum requires the `HTMLElement` you want to render into:

```js
import { embed } from '@nebula.js/stardust';

const n = embed(enigmaApp);
n.render({
  element,
  // rest of the config
});
```

## Render on the fly

When rendering a visualization on the fly you need to specify the `type` you want to render:

```js
n.render({
  element,
  type: 'barchart',
});
```

Some visualizations have minimum requirements on the various properties and/or data it needs in order to render, in which case you might see something like this:

![Incomplete visualization](assets/supernova-incomplete.png)

To provide initial data to the visualization, add the data dimensions and measures into the `fields` property:

```js
n.render({
  element,
  type: 'barchart',
  fields: ['Region', '=sum(Sales)'],
});
```

You can also modify the initial properties:

```js
n.render({
  element,
  type: 'barchart',
  fields: ['Product', '=sum(Sales)'],
  properties: {
    title: 'Sales by region',
  },
});
```

![Bar chart](assets/supernova-barchart.png)

## Render from existing objects

If you already have created a generic object in your app and want to render it, you can do so by providing the object's `id`:

```js
n.render({
  element,
  id: '<ObjectID>',
});
```
