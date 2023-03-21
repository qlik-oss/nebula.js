import enigma from 'enigma.js';
import qixSchema from 'enigma.js/schemas/12.1657.0.json';

import { embed } from '@nebula.js/stardust';
import mekko from '@nebula.js/sn-mekko-chart';

const openApp = (id) =>
  enigma
    .create({
      schema: qixSchema,
      url: `wss://apps.core.qlik.com/app/${id}`,
    })
    .open()
    .then((global) => global.getActiveDoc());

const appCache = (window.appCache = window.appCache || {});

export default function init({ appId, fields, objectId }) {
  if (!appCache[appId]) {
    appCache[appId] = openApp(appId);
  }

  appCache[appId].then((app) => {
    const nebbie = embed(app, {
      load: () => Promise.resolve(mekko),
    });
    nebbie.selections().then((s) => s.mount(document.getElementById('selections')));

    nebbie.render(
      objectid
        ? {
            type: 'dummy',
            id: objectId,
            element: document.getElementById('object'),
          }
        : {
            type: 'dummy',
            fields,
            element: document.getElementById('object'),
          }
    );
  });
}
