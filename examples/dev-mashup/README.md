# Nebula Development Mashup example

Example mashup for nebula development

## Install

To use a local nebula version, run this in the stardust folder to allow linking your local version.

```sh
yarn link
```

Update dependencies and link nebula

```sh
yarn
yarn link "@nebula.js/stardust"
```

## Run

Run parcel server

```sh
yarn start
```

Open you browser to http://localhost:1234

## Making local changes

The gitignore is setup to exclude a folder named `local-dev` in the root of this repository. So to make local changes to the mashup you can create that folder and copy all files into it.

## Render a chart in a local app

Assume that there is a local app named Ctrl-00.qvf and there is a bar chart with the id 'QmGpz' in that app. You can change the app and the chart id to match your app and chart id. If the chart is not a bar chart you need to import the correct chart (e.g. import linechart from '@nebula.js/sn-line-chart') otherwise an error will occur.

Replace connect.js with

```sh
import enigma from 'enigma.js';

export default function connect() {
  const loadSchema = () =>
    fetch('https://unpkg.com/enigma.js/schemas/12.936.0.json').then((response) => response.json());
  const localApp = '/apps/Ctrl-00.qvf';

  const createConnection = () =>
    loadSchema().then((schema) =>
      enigma
        .create({
          schema,
          url: `ws://${window.location.hostname || 'localhost'}:9076/app${localApp}`,
        })
        .open()
        .then((qix) => qix.openDoc(localApp))
    );
  return createConnection().then((app) => app);
}
```

Replace index.js with

```sh
import { embed } from '@nebula.js/stardust';
import bar from '@nebula.js/sn-bar-chart';
import connect from './connect';

const chartId = 'QmGpz';

function init() {
  connect().then((app) => {
    const nebbie = embed(app, {
      types: [
        {
          name: 'barchart',
          load: () => Promise.resolve(bar),
        },
      ],
    });

    document.querySelectorAll('.object').forEach((el) => {
      nebbie.render({
        element: el,
        id: chartId,
      });
    });
  });
}

init();
```
