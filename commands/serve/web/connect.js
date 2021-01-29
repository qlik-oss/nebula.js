import enigma from 'enigma.js';
import qixSchema from 'enigma.js/schemas/12.34.11.json';
import SenseUtilities from 'enigma.js/sense-utilities';

const params = (() => {
  const opts = {};
  window.location.search
    .substring(1)
    .split('&')
    .forEach((pair) => {
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

// Qlik Core:  ws://<host>:<port>/app/<data-folder>/<app-name>
// QCS:       wss://<tenant-url>.<region>.qlikcloud.com/app/<app-GUID>
// QSEoK:     wss://<host>/app/<app-GUID>
// QSEoW:     wss://<host>/<virtual-proxy-prefix>/app/<app-GUID>
const RX = /(wss?):\/\/([^/:?&]+)(?::(\d+))?/;
const parseEngineURL = (url) => {
  const m = RX.exec(url);

  if (!m) {
    return {
      engineUrl: url,
      invalid: true,
    };
  }

  let appId;
  const trimmedUrl = url.trim();
  let engineUrl = trimmedUrl;
  let appUrl;

  const rxApp = /\/app\/([^?&#:]+)/.exec(trimmedUrl);

  if (rxApp) {
    [, appId] = rxApp;
    engineUrl = trimmedUrl.substring(0, rxApp.index);
    appUrl = trimmedUrl;
  }

  return {
    enigma: {
      secure: m[1] === 'wss',
      host: m[2],
      port: m[3] || undefined,
      appId,
    },
    engineUrl,
    appUrl,
  };
};

const connectionInfo = fetch('/info')
  .then((response) => response.json())
  .then(async (n) => {
    let info = n;
    if (params.engine_url) {
      info = {
        ...info,
        ...parseEngineURL(params.engine_url),
      };
    } else if (params.app) {
      info = {
        ...info,
        enigma: {
          ...info.enigma,
          appId: params.app,
        },
      };
    }
    if (params['qlik-web-integration-id']) {
      info.webIntegrationId = params['qlik-web-integration-id'];
    }
    if (params.flags) {
      const flags = {};
      params.flags.split('+').forEach((f) => {
        flags[f] = true;
      });
      info.flags = flags;
    }
    if (info.invalid) {
      return info;
    }
    const rootPath = `${info.enigma.secure ? 'https' : 'http'}://${info.enigma.host}`;
    return {
      ...info,
      rootPath,
    };
  });

let headers;

const getHeaders = async ({ webIntegrationId, rootPath }) => {
  const response = await fetch(`${rootPath}/api/v1/csrf-token`, {
    credentials: 'include',
    headers: { 'qlik-web-integration-id': webIntegrationId },
  });
  if (response.status === 401) {
    const loginUrl = new URL(`${rootPath}/login`);
    loginUrl.searchParams.append('returnto', window.location.href);
    loginUrl.searchParams.append('qlik-web-integration-id', webIntegrationId);
    window.location.href = loginUrl;
    return 401;
  }
  const csrfToken = new Map(response.headers).get('qlik-csrf-token');
  headers = {
    'qlik-web-integration-id': webIntegrationId,
    'qlik-csrf-token': csrfToken,
  };

  return headers;
};

const defaultConfig = {
  secure: false,
};

let connection;
const connect = () => {
  if (!connection) {
    connection = connectionInfo.then(async (info) => {
      const { webIntegrationId, rootPath } = info;
      if (webIntegrationId) {
        if (!headers) {
          headers = await getHeaders(info);
        }
        if (headers === 401) {
          return { status: 401 };
        }
        return {
          getDocList: async () => {
            const { data = [] } = await (
              await fetch(`${rootPath}/api/v1/items?limit=30&sort=-updatedAt`, {
                credentials: 'include',
                headers: { ...headers, 'content-type': 'application/json' },
              })
            ).json();
            return data.map((d) => ({
              qDocId: d.resourceId,
              qTitle: d.name,
            }));
          },
          getConfiguration: async () => ({}),
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

const openApp = (id) =>
  connectionInfo.then(async (info) => {
    let urlParams = {};
    if (info.webIntegrationId) {
      if (!headers) {
        headers = await getHeaders(info);
      }
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
      .then((global) => global.openDoc(id));
  });

export { connect, openApp, params, connectionInfo as info };
