---
id: web-integration
title: Web integration
---

Integrating `nebula.js` with your project requires the following steps:

1. Connect to a Qlik Sense deployment
1. Load `nebula.js` core modules
1. Load chart modules
1. Configure nucleus
1. Render charts

## Connect to Qlik

The majority of communication between the web and a Qlik Sense deployment happens with a WebSocket connection, how you authenticate and create such a connection depends on the type of deployment you want to connect to. The examples will assume you are connecting to your own Qlik Cloud Services tenant and have already [configured it to allow web integrations](https://help.qlik.com/en-US/cloud-services/Subsystems/Hub/Content/Sense_Hub/Admin/mc-adminster-web-integrations.htm).

The connection needs to be created using `enigma.js` which you should load first:

```html
<script src="https://cdn.jsdelivr.net/npm/enigma.js" crossorigin></script>
```

Before creating the connection, you need to fetch a `schema` which helps `enigma.js` understand how and what methods you can use to communicate with Qlik:

```js
async function connect() {
  const schema = await (await fetch('https://cdn.jsdelivr.net/npm/enigma.js@2.6.3/schemas/12.170.2.json')).json();
}
```

To create the connection you need to know your QCS tenant url, the `qlik-web-integration-id` and the GUID of the document you want to open:

```js
async function connect() {
  const schema = await (await fetch('https://cdn.jsdelivr.net/npm/enigma.js@2.6.3/schemas/12.170.2.json')).json();

  const enigmaGlobal = await enigma
    .create({
      schema,
      url: 'wss://<tenant>.us.qlikcloud.com/app/<GUID>?qlik-web-integration-id=<qlik-web-integration-id>',
    })
    .open();

  const enigmaApp = await enigmaGlobal.openDoc('<GUID>');
}
```

Read more:

- [Connecting to various Qlik Sense deployments](#)
- [enigma.js](#)

## Load nebula core modules

Load the two core `nebula.js` modules:

```html
<script src="https://cdn.jsdelivr.net/npm/@nebula.js/supernova" crossorigin></script>
<script src="https://cdn.jsdelivr.net/npm/@nebula.js/nucleus" crossorigin></script>
```

## Load chart modules

The core modules do not contain any charts by themselves, each chart is its own separate module and needs to be loaded and registered before it can be used.

Official supernova chart modules from Qlik are published under the `@nebula.js` scope and are prefixed with `sn-`.
The available charts are as follows:

- Bar chart: `@nebula.js/sn-bar-chart`
- Line chart: `@nebula.js/sn-line-chart`
- Pie chart: `@nebula.js/sn-pie-chart`
- Sankey chart: `@nebula.js/sn-sankey-chart`
- Funnel chart: `@nebula.js/sn-funnel-chart`
- Mekko chart: `@nebula.js/sn-mekko-chart`

You can load a chart through a `<script>` tag:

```html
<script src="https://cdn.jsdelivr.net/npm/@nebula.js/sn-bar-chart" crossorigin></script>
```

which makes it available to you on the global `window` object as `@nebula.js/sn-bar-chart`.

## Render charts

Before rendering the chart you need to configure `nucleus` with the supernova types you want to support:

```js
const n = nucleus.createConfiguration({
  types: [
    {
      type: 'barchart',
      load: () => Promise.resolve(window['@nebula.js/sn-bar-chart']),
    },
  ],
});
```

You can then render a chart on the fly in an `HTMLElement` that has a fixed size and provide the initial `fields` to it:

```js
n(enigmaApp).render({
  element: document.querySelector('#chart'),
  type: 'barchart',
  fields: ['Product', '=sum(Sales)'],
});
```

If the `GenericObject` already exists in the app you opened, you can render it by providing its `id`:

```js
n(enigmaApp).render({
  element: document.querySelector('#chart'),
  id: '<ObjectID>',
});
```
