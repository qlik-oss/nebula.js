import enigma from 'enigma.js';
import qixSchema from 'enigma.js/schemas/12.34.11.json';

import nucleus from '@nebula.js/nucleus';
import mekko from '@nebula.js/sn-mekko-chart';

const openApp = id =>
  enigma
    .create({
      schema: qixSchema,
      url: `wss://apps.core.qlik.com/app/${id}`,
    })
    .open()
    .then(global => global.getActiveDoc());

const appCache = (window.appCache = window.appCache || {});

export default function init({ appId, fields, objectId }) {
  if (!appCache[appId]) {
    appCache[appId] = openApp(appId);
  }

  appCache[appId].then(app => {
    const nebbie = nucleus(app, {
      load: () => Promise.resolve(mekko),
    });
    nebbie.selections().then(s => s.mount(document.getElementById('selections')));
    nebbie.types.clearFromCache('dummy');

    const params = {
      element: document.getElementById('object'),
    };

    if (objectId) {
      nebbie.get(
        {
          type: 'dummy',
          id: objectId,
        },
        params
      );
    } else {
      nebbie.create(
        {
          type: 'dummy',
          fields,
        },
        params
      );
    }
  });
}
