import enigma from 'enigma.js';
import qixSchema from 'enigma.js/schemas/12.936.0.json';
import SenseUtilities from 'enigma.js/sense-utilities';
import { Auth, AuthType } from '@qlik/sdk';

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

const getConnectionInfo = () =>
  fetch('/info')
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
      if (info.invalid) {
        return info;
      }
      const rootPath = `${info.enigma.secure ? 'https' : 'http'}://${info.enigma.host}`;
      return {
        ...info,
        rootPath,
      };
    });

const getAuthInstance = ({ webIntegrationId, host }) => {
  const authInstance = new Auth({
    webIntegrationId,
    autoRedirect: true,
    authType: AuthType.WebIntegration,
    host,
  });
  if (!authInstance.isAuthenticated()) authInstance.authenticate();
  return authInstance;
};

const connect = async () => {
  try {
    const {
      webIntegrationId,
      enigma: enigmaInfo,
      enigma: { host },
    } = await getConnectionInfo();

    if (webIntegrationId) {
      const authInstance = getAuthInstance({ webIntegrationId, host });

      return {
        getDocList: async () => {
          const url = `/items?resourceType=app&limit=30&sort=-updatedAt`;
          const { data = [] } = await (await authInstance.rest(url)).json();
          return data.map((d) => ({
            qDocId: d.resourceId,
            qTitle: d.name,
          }));
        },
        getConfiguration: async () => ({}),
      };
    }
    const url = SenseUtilities.buildUrl({
      secure: false,
      ...enigmaInfo,
    });

    return enigma
      .create({
        schema: qixSchema,
        url,
      })
      .open();
  } catch (error) {
    throw new Error('Failed to return enigma instance');
  }
};

const openApp = async (id) => {
  try {
    const {
      webIntegrationId,
      enigma: enigmaInfo,
      enigma: { host },
    } = await getConnectionInfo();

    if (webIntegrationId) {
      const authInstance = getAuthInstance({ webIntegrationId, host });
      const url = await authInstance.generateWebsocketUrl(id);
      const enigmaGlobal = await enigma.create({ schema: qixSchema, url }).open();
      return enigmaGlobal.openDoc(id);
    }

    const url = SenseUtilities.buildUrl({
      secure: false,
      ...enigmaInfo,
      urlParams: {},
      appId: id,
    });
    return enigma
      .create({ schema: qixSchema, url })
      .open()
      .then((global) => global.openDoc(id));
  } catch (error) {
    throw new Error('Failed to open app!');
  }
};

export { connect, openApp, params, getConnectionInfo, getAuthInstance };
