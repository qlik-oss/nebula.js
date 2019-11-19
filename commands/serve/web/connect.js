import enigma from 'enigma.js';
import qixSchema from 'enigma.js/schemas/12.34.11.json';
import SenseUtilities from 'enigma.js/sense-utilities';

import { requireFrom } from 'd3-require';

const params = (() => {
  const opts = {};
  const { pathname } = window.location;
  const am = pathname.match(/\/app\/([^/?&]+)/);
  if (am) {
    opts.app = decodeURIComponent(am[1]);
  }
  window.location.search
    .substring(1)
    .split('&')
    .forEach(pair => {
      const idx = pair.indexOf('=');
      const name = pair.substr(0, idx);
      let value = decodeURIComponent(pair.substring(idx + 1));
      if (name === 'cols') {
        value = value.split(',');
      }
      opts[name] = value;
    });

  return opts;
})();

const getModule = name => requireFrom(async n => `/pkg/${encodeURIComponent(n)}`)(name);

const hotListeners = {};

const lightItUp = name => {
  if (!hotListeners[name]) {
    return;
  }
  hotListeners[name].forEach(fn => fn());
};

const onHotChange = (name, fn) => {
  if (!hotListeners[name]) {
    hotListeners[name] = [];
  }

  hotListeners[name].push(fn);
  if (window[name]) {
    fn();
  }
  return () => {
    // removeListener
    const idx = hotListeners[name].indexOf(fn);
    hotListeners[name].splice(idx, 1);
  };
};

window.onHotChange = onHotChange;

const initiateWatch = info => {
  const ws = new WebSocket(`ws://localhost:${info.sock.port}`);

  const update = () => {
    getModule(info.supernova.name).then(mo => {
      window[info.supernova.name] = mo;
      lightItUp(info.supernova.name);
    });
  };

  ws.onmessage = () => {
    update();
  };

  update();
};

const requestInfo = fetch('/info')
  .then(response => response.json())
  .then(async info => {
    initiateWatch(info);
    const { webIntegrationId } = info;
    const rootPath = `${info.enigma.secure ? 'https' : 'http'}://${info.enigma.host}`;
    let headers = {};
    if (webIntegrationId) {
      const csrfToken = new Map(
        (
          await fetch(`${rootPath}/api/v1/csrf-token`, {
            credentials: 'include',
            headers: { 'qlik-web-integration-id': webIntegrationId },
          })
        ).headers
      ).get('qlik-csrf-token');
      headers = {
        'qlik-web-integration-id': webIntegrationId,
        'qlik-csrf-token': csrfToken,
      };
    }
    return {
      ...info,
      rootPath,
      headers,
    };
  });

const defaultConfig = {
  host: window.location.hostname || 'localhost',
  port: 9076,
  secure: false,
};

let connection;
const connect = () => {
  if (!connection) {
    connection = requestInfo.then(async info => {
      const { webIntegrationId, rootPath, headers } = info;
      if (webIntegrationId) {
        return {
          getDocList: async () => {
            const { data = [] } = await (
              await fetch(`${rootPath}/api/v1/items?limit=30&sort=-updatedAt`, {
                credentials: 'include',
                headers: { ...headers, 'content-type': 'application/json' },
              })
            ).json();
            return data.map(d => ({
              qDocId: d.resourceId,
              qTitle: d.name,
            }));
          },
        };
      }
      const url = SenseUtilities.buildUrl({
        ...defaultConfig,
        ...info.enigma,
      });
      return enigma
        .create({
          schema: qixSchema,
          url,
        })
        .open();
    });
  }

  return connection;
};

const openApp = id =>
  requestInfo.then(async info => {
    const { webIntegrationId, headers } = info;
    let urlParams = {};
    if (webIntegrationId) {
      urlParams = {
        ...headers,
      };
    }
    const url = SenseUtilities.buildUrl({
      ...defaultConfig,
      ...info.enigma,
      urlParams,
      appId: id,
    });
    return enigma
      .create({
        schema: qixSchema,
        url,
      })
      .open()
      .then(global => global.openDoc(id));
  });

export { connect, openApp, params, requestInfo as info };
