---
id: sn-configure-data
title: Configuring data
---

The `qae` section of the definition is where you define the properties of the Generic Object and the shape of the data you expect to consume.

```json
{
  "qae": {
    "properties": {}
  }
}
```

## Generic Object

Every visualization is connected to the entire data model and Qlik's Associative Engine through a _Generic Object_. This is a JSON object containing _properties_ which result in a _layout_ that describe the state of the backend portion of the visualization.

Every time someone wants to render your visualization, an instance of the generic object will be created in the data model. If the creator has the right permissions, they can choose to store and persist this object in their data model.

### Properties

What properties you set is entirely up to you, it must however be a valid JSON object. Most properties are just settings that you may want to persist over time. If you are developing a bar chart you might want to store a setting that indicates whether it should be stacked, or what color the bars should have:

```json
{
  "isStacked": true,
  "barColor": "red"
}
```

These properties are _static_, what goes in comes out exactly the same. The true power of the Generic Object are the _dynamic_ properties you can set that enables you to leverage Qlik's Associative Engine and access the data inside it.

Dynamic properties have a specific structure that enables the backend to differentiate between dynamic properties and static. They also have a naming convention: they all begin with a `q` followed by a capital letter, this makes it easy for both humans and machines to distinguish between the two property types.

There are a lot of different [predefined](https://core.qlik.com/services/qix-engine/apis/qix/definitions/) dynamic properties for various purposes, you can for example use [ValueExpression](https://core.qlik.com/services/qix-engine/apis/qix/definitions/#valueexpression) to do simple calculations:

```json
{
  "simpleMath": {
    "qValueExpression": {
      "qExpr": "1+1"
    }
  }
}
```

### Layout

The _layout_ of the Generic Object is the result of the static and dynamic properties. The layout of the properties above will look like this:

```json
{
  "isStacked": true,
  "barColor": "red",
  "simpleMath": 2
}
```

Notice that the static properties remain exactly the same, while the dynamic property `simpleMath` now contains the calculated result of the ValueExpression.

Most dynamic properties have an input definition and a corresponding layout output; a [ListObjectDef](https://core.qlik.com/services/qix-engine/apis/qix/definitions/#listobjectdef) will result in a [ListObject](https://core.qlik.com/services/qix-engine/apis/qix/definitions/#listobject), a [SelectionObjectDef](https://core.qlik.com/services/qix-engine/apis/qix/definitions/#selectionobjectdef) will result in a [SelectionObject](https://core.qlik.com/services/qix-engine/apis/qix/definitions/#selectionobject), and so on.

## Data

The most common property definition you will be using is the [HyperCubeDef](https://core.qlik.com/services/qix-engine/apis/qix/definitions/#hypercubedef), this is the dynamic property that will provide you with data from the backend data model. You can place this in the root of the properties object, or on a deeper level, and you can have as many as you need:

```json
{
  "qHyperCubeDef": {},
  "anotherOne": {
    "qHyperCubeDef": {},
    "andAThird": {
      "qHyperCubeDef": {}
    }
  }
}
```

The primary input to the HyperCubeDef are _dimensions_ and _measures_:

```json
{
  "qHyperCubeDef": {
    "qDimensions": [{ "qLibraryId": "hdg534" }],
    "qMeasures": [{ "qLibraryId": "gt5dgd" }]
  }
}
```

In this case the dimensions and measures are hardcoded to a predefined value that might exist in a specific data model, which is rarely what you want. If you are developing a chart for others to use with any data model you need to make it possible to add those dynamically, you can do this be specifying _data targets_.

### Data targets

A data target is a way for you to define where the dynamic HyperCubeDefs are located in the Generic Object's properties. While `stardust` could traverse the properties and locate all usages of `qHyperCubeDef`, you may not want all of those to be dynamic, or you may generate them for internal use only.

You specify data targets with the `data.targets` key in `qae`, each target must have a `path` key which indicates the JSON path of the HyperCubeDef from the root of the properties object:

```js
qae: {
  properties: {
    qHyperCubeDef: {},
    my: {
      nested: {
        qHyperCubeDef: {}
      },
    }
  },
  data: {
    targets: [
      { path: '/qHyperCubeDef' },
      { path: '/my/nested/qHyperCubeDef' },
    ];
  }
}
```

You can for each data target specify additional details like the maximum/minimum amount of dimensions and measures, and make modifications when they are added.

This is useful when you know the limitations of what a chart can render, a pie chart for example is mostly usable when it has exactly one dimension and one measure, but you might also be implementing support for a second measure. This also saves you some code logic since `stardust` won't attempt to render a chart whose limitations have not been fulfilled, and will instead show that some fields are missing.

### Field limitations

To specify limitations on dimensions or measures, add each respective field type as an object as part of the data target:

```js
targets: [
  {
    path: '/qHyperCubeDef',
    dimensions: {
      min: 1,
      max: 1,
    },
    measures: {
      min: 1,
      max: 2,
    },
  },
];
```

### Field modifications

You can also modify an added or removed field just before the change is applied and sent to the backend, this is useful for things like setting sorting when a dimension is added, or adding additional properties that you know you will always need.

If you for example want to make sure that null values are suppressed since it's not something you can render or represent in a good way, you can set `qNullSuppression: true` when the dimension is added:

```js
dimensions: {
  added(dimension) {
    dimension.qNullSuppression = true;
  }
}
```
