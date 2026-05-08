import enigma from 'enigma.js';
import qixSchema from 'enigma.js/schemas/12.2015.0.json';
import SenseUtilities from 'enigma.js/sense-utilities';
import auth from '@qlik/api/auth';
import { getItems } from '@qlik/api/items';
import { openAppSession } from '@qlik/api/qix';
import getCsrfToken from './utils/getCsrfToken';

const getParams = () => {
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
};

// These URLS are fully constructed later using the sdk
// QCS:       wss://<tenant-url>.<region>.qlikcloud.com/app/<app-GUID>
// QSEoW:     wss://<host>/<virtual-proxy-prefix>/app/<app-GUID>

// matches the wss://<host>/<virtual-proxy-prefix>/
const urlRegex = /(wss?):\/\/([^/:?&]+)(?::(\d+))?/;
const appRegex = /\/app\/([^?&#:]+)/;
// The prefix must be unique for all virtual proxies used by the same proxy service,
// as this differentiates the virtual proxies and will be a part of the URL (https://[node]/[prefix]/).
// Valid characters for prefix are "a-z", "0-9", "-", ".", "_", "~".
const prefixRegx = /(wss?):\/\/([^/:?&]+)(?::(\d+))?\/?([a-z0-9-._~]+)?/;

const parseEngineURL = (url) => {
  const match = urlRegex.exec(url);
  if (!match) {
    return {
      engineUrl: url,
      invalid: true,
    };
  }

  let appId;
  const trimmedUrl = url.trim();
  let engineUrl = trimmedUrl;
  let appUrl;

  const appMatch = appRegex.exec(trimmedUrl);

  if (appMatch) {
    [, appId] = appMatch;
    engineUrl = trimmedUrl.substring(0, appMatch.index);
    appUrl = trimmedUrl;
  }

  const engineMatch = prefixRegx.exec(engineUrl);

  if (!engineMatch) {
    return {
      engineUrl: url,
      invalid: true,
    };
  }
  return {
    enigma: {
      secure: match[1] === 'wss',
      host: match[2],
      port: match[3] || undefined,
      prefix: engineMatch[4] || undefined,
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
      const params = getParams();
      if (params.engine_url) {
        info = {
          ...info,
          // TODO:
          // instead of calling "/info" and then parsing url inside of `getConnectionInfo()`
          // we can have a hook which listens on location.search and provides this information for us
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
      if (params['qlik-client-id']) {
        info.clientId = params['qlik-client-id'];
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

const setHostConfig = ({ webIntegrationId, clientId, host }) => {
  if (webIntegrationId) {
    auth.setDefaultHostConfig({ authType: 'cookie', webIntegrationId, host });
  } else if (clientId) {
    auth.setDefaultHostConfig({
      authType: 'oauth2',
      clientId,
      host,
      redirectUri: `${window.location.origin}/auth/login/callback`,
      accessTokenStorage: 'session',
    });
  }
};

const buildDocList = async () => {
  const response = await getItems({ resourceType: 'app', limit: 30, sort: '-updatedAt' });
  const { data = [] } = response.data;
  return data.map((d) => ({ qDocId: d.resourceId, qTitle: d.name }));
};

const connect = async () => {
  try {
    const {
      clientId,
      webIntegrationId,
      enigma: enigmaInfo,
      enigma: { host },
    } = await getConnectionInfo();

    if (webIntegrationId) {
      setHostConfig({ webIntegrationId, host });
      return {
        getDocList: buildDocList,
        getConfiguration: async () => ({}),
      };
    }

    if (clientId) {
      setHostConfig({ clientId, host });
      return {
        getDocList: buildDocList,
        getConfiguration: async () => ({}),
      };
    }

    const csrfToken = await getCsrfToken(
      `https://${enigmaInfo.host}${enigmaInfo.prefix ? `/${enigmaInfo.prefix}` : ''}`
    );
    const url = SenseUtilities.buildUrl({
      secure: false,
      ...enigmaInfo,
      ...{ urlParams: { 'qlik-csrf-token': csrfToken } },
    });

    return enigma.create({ schema: qixSchema, url }).open();
  } catch (error) {
    throw new Error('Failed to return enigma instance');
  }
};

const openApp = async (id) => {
  try {
    const {
      clientId,
      webIntegrationId,
      enigma: enigmaInfo,
      enigma: { host },
    } = await getConnectionInfo();

    if (webIntegrationId || clientId) {
      setHostConfig({ webIntegrationId, clientId, host });
      return openAppSession({ appId: id }).getDoc();
    }

    const url = SenseUtilities.buildUrl(enigmaInfo);
    const enigmaGlobal = await enigma.create({ schema: qixSchema, url }).open();
    return enigmaGlobal.openDoc(id);
  } catch (error) {
    throw new Error('Failed to open app!');
  }
};

export { connect, openApp, getParams, getConnectionInfo, setHostConfig, parseEngineURL };
