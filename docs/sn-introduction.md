---
id: sn-introduction
title: Introduction
---

## What is a supernova?

A supernova in the context of this API represents the visual output of some underlying data stored in Qlik's Associative Data Model. It could be almost anything you want it to be and is traditionally developed to show the data in the shape of a chart, table, kpi etc.

## Composition

A supernova has two main parts: a backend _Generic Object_ that describes the _properties_ of the supernova and is persisted in the data model, and a frontend visual part that renders the _layout_ of the _Generic Object_.

## Definition

The minimal supernova that doesn't contain any data nor renders anything looks like this:

```js
export default function () {
  return {
    qae: {
      /* */
    },
    component() {},
  };
}
```

The `component()` is where you render the visual part, while `qae` is where you define the properties and data handled by Qlik's Associative Engine (QAE).
