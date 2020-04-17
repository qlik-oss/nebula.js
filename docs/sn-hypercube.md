---
id: sn-hypercube
title: HyperCube introduction
---

The `HyperCubeDef` is the fundamental structure which you configure before you are provided with the result in the form of a `HyperCube`. Don't let the name scare you, while it does contain a lot of properties and can be configured in many ways, in its most basic form it resembles a simple table with rows and columns.

## HyperCubeDef configuration

Not all properties are equally important, but there are a few key ones that you need to keep in mind when configuring the `HyperCubeDef`.

### qMode

While you may not need to set `qMode` explicitly since it defaults to the simplest mode `'S'`, it's important to know the impact it has on the data structure.

`qMode: 'P'`, or _pivot mode_, will give you a structure suitable for presenting pivot tables with groups in both vertical and horizontal directions, as well as a group for all measures.

`qMode: 'T'`, or _tree mode_, will give you a structure that resembles a tree and is suitable to use for rendering tree-like visualizations; treemap, circle packing, sunburst, dendrogram, trellising etc.

`qMode: 'S'`, or _straight mode_, is the simplest of them all and will give you a data structure that looks like a simple table with rows and columns. For the sake of simplicity in explaining the rest of the hypercube let's assume you are using this one.

### qDimensions and qMeasures

`qDimensions` and `qMeasures` are the columns of your "table", there is no explicit limit on the number of these you can add, but there is often a limitation on the number of dimensions and measure a certain chart can handle, and you need to keep the number of these in mind when you specify `qInitialDataFetch`.

### qInitialDataFetch

Qlik's Associative Engine is a memory based solution, meaning the amount of the data it can handle is based entirely on the memory resources it has access to. A such, it can contain billions of data values and the number of rows in the hypercube can therefore potentially reach billions as well.

To avoid cases where that huge amounts of data is transferred to the front end the hypercube by default does not include any rows at all. To control this you can set the number of rows and columns you want initially with `qInitialDataFetch`. This property allows you to set the _data pages_ you want to extract from the entire hypercube, so you can for example choose to get the first 50 rows:

```js
qHyperCubeDef: {
  qInitialDataFetch: [{ qLeft: 0, qTop: 0, qHeight: 50, qWidth: 4 }];
}
```

If you think of the straight table as a grid from which you want to extract some data, then `qLeft` and `qTop` are the upper left of the subset you want to extract, while `qHeight` and `qWidth` are the number of rows and columns.

There is however a maximum limit of 10 000 cells that you are allowed to fetch in one go, an amount larger than that will cause an error. You therefore need to keep track of the number of columns you may need to ensure the total does not exceed 10 000. If you for example know that you will never need more than 4 columns, then you can set `qHeight` to `10000/4`:

```js
qInitialDataFetch: [{ qLeft: 0, qTop: 0, qHeight: 2500, qWidth: 4 }];
```

The initial data fetch only specifies the largest possible subsection of the entire hypercube in the layout, if there are only 7 rows in the hypercube then you will not get more than 7. You can also dynamically fetch more data later on.

## Consuming the HyperCube

The output, or _layout_, of the `HyperCubeDef` is a [HyperCube](https://core.qlik.com/services/qix-engine/apis/qix/definitions/#hypercube). In the layout it's located in the same place as you defined it in your properties, but without the `Def`, e.g. the input:

```js
{
  properties: {
    qHyperCubeDef: {},
    another: {
      one: {
        qHyperCubeDef: {}
      }
    }
  }
}
```

will result in the output:

```js
{
  layout: {
    qHyperCube: {},
    another: {
      one: {
        qHyperCube: {}
      }
    }
  }
}
```

Next to the `qDimensionInfo` and `qMeasureInfo` properties which contain your dimensions and measures, the most important part of the hypercube are the _data pages_.

### Data pages

The data pages are where the actual data values of the hypercube are contained, where exactly and what structure they have depends on the `qMode` value you set earlier. For mode `'S'` that place is `qDataPages`, which in turn contains `qArea` and `qMatrix`.

Assuming the hypercube contains one dimension, _Movie title_, and one measure, _Average rating_, the content might look like this:

```js
qDataPages: [
  {
    qMatrix: [
      [
        // first row
        { qText: '2 Fast 2 Furious', qNum: 'NaN', qElemNumber: 447, qState: 'O' }, // NxCell
        { qText: '6.2', qNum: 6.2, qElemNumber: 0, qState: 'L' },
      ],
      [
        // second
        { qText: '2 Guns', qNum: 'NaN', qElemNumber: 681, qState: 'O' },
        { qText: '6.6', qNum: 6.6, qElemNumber: 0, qState: 'L' },
      ],
    ],
    qArea: { qTop: 0, qLeft: 0, qWidth: 2, qHeight: 2 },
  },
];
```

Besides the textual and numerical values, each [NxCell](https://core.qlik.com/services/qix-engine/apis/qix/definitions/#nxcell) contains a `qElemNumber` property known as the _rank_. The rank for a dimension cell can be seen as a property that uniquely identifies the textual value of it in its field, across the entire data model. You can leverage this property to provide consistent behaviour throughout your application, you can for example set persistent color of the dimension values in a field whenever and wherever they are used:

```js
// color scheme
const colors = ['#26A0A7', '#79D69F', '#F9EC86', '#EC983D'];

const cellColor = colors[cell.qElemNumber % colors.length];
```

This property is also something you need to keep track of when you want to make selections in your chart.

### Getting more data

Due to the limitation of the amount of data you can get in the initial layout, there will be situations when you need to get the rest of the data if you want to show more of it. You can do so by using the methods exposed on the _model_ of the Generic Object. Which method to use depends, again, on the `qMode` of the hypercube, for the `'S'` mode it's [GetHyperCubeData](https://core.qlik.com/services/qix-engine/apis/qix/genericobject/#gethypercubedata).

When paging data in straight mode, you should begin by looking at the `qHyperCubeDef.qSize` property which contains information on the width and height of the full hypercube. You can from that calculate the number of pages you need to fetch:

```js
import { useModel, useLayout, useEffect } from '@nebula.js/supernova';

const NUM_CELLS_PER_PAGE = 10000;
const MAX_PAGES = 10;
// ...
component() {
  const model = useModel();
  const layout = useLayout();

  const Y = layout.qHyperCube.qSize.qcy;
  const X = layout.qHyperCube.qSize.qcx;

  const HEIGHT_PER_PAGE = Math.ceil(NUM_CELLS_PER_PAGE / X);
  const NUM_PAGES = Math.floor(MAX_PAGES, Math.ceil(Y / HEIGHT_PER_PAGE));

  const pagesToFetch = [];
  for (let i = 0; i < NUM_PAGES; i++) {
    pagesToFetch.push({ qLeft: 0, qTop: i * HEIGHT_PER_PAGE, qHeight: HEIGHT_PER_PAGE, qWidth: X });
  }

  useEffect(() => {
    Promise.all(pagesToFetch.map((page) => model.getHyperCubeData('/qHyperCubeDef', [page]))).then((pages) => {
      console.log(pages);
    });
  }, [layout]);

}
```

You should however be **very** careful when dynamically fetching data like this, keep in mind that the size of the cube can be in the millions, fetching a data set that large could take time and create a very poor user experience. In the example above the number of pages is set to a maximum of 10 so that no more than 100 000 values are fetched in total.

You can also leverage other techniques to avoid fetching all data at once. _Virtual scrolling_ in combination with throttling of each request can boost performance tremendously. You should also consider using a reduced dataset if you don't need the exact values:

- [getHyperCubeBinnedData](https://core.qlik.com/services/qix-engine/apis/qix/genericobject/#gethypercubebinneddata) binns data points into groups and is great for heatmaps and 2d density plots.
- [getHyperCubeContinousData](https://core.qlik.com/services/qix-engine/apis/qix/genericobject/#gethypercubecontinuousdata) reduces the number of points in a continuous dimension and is great for temporal data.
- [getHyperCubeReducedData](https://core.qlik.com/services/qix-engine/apis/qix/genericobject/#gethypercubereduceddata) does some wavelet magic and is great for mini charts.
