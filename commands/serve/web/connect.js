import enigma from 'enigma.js';
import qixSchema from 'enigma.js/schemas/12.2015.0.json';
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
    engine: {
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
          engine: {
            ...info.engine,
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
      const rootPath = `${info.engine.secure ? 'https' : 'http'}://${info.engine.host}`;
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
  try {
    const response = await getItems({ resourceType: 'app', limit: 30, sort: '-updatedAt' });
    const { data = [] } = response.data;
    return data.map((d) => ({ qDocId: d.resourceId, qTitle: d.name }));
  } catch (error) {
    throw new Error('Failed to fetch app list', { cause: error });
  }
};

const connect = async () => {
  try {
    const {
      clientId,
      webIntegrationId,
      engine: engineConfig,
      engine: { host },
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
      `https://${engineConfig.host}${engineConfig.prefix ? `/${engineConfig.prefix}` : ''}`
    );
    const scheme = engineConfig.secure !== false ? 'wss' : 'ws';
    const port = engineConfig.port ? `:${engineConfig.port}` : '';
    const prefix = engineConfig.prefix ? `/${engineConfig.prefix}` : '';
    const url = `${scheme}://${engineConfig.host}${port}${prefix}?qlik-csrf-token=${csrfToken}`;

    return enigma.create({ schema: qixSchema, url }).open();
  } catch (error) {
    throw new Error('Failed to return enigma instance', { cause: error });
  }
};

const openApp = async (id) => {
  try {
    const {
      clientId,
      webIntegrationId,
      engine: engineConfig,
      engine: { host },
    } = await getConnectionInfo();

    if (webIntegrationId) {
      return openAppSession({
        appId: id,
        hostConfig: { authType: 'cookie', webIntegrationId, host },
      }).getDoc();
    }

    if (clientId) {
      return openAppSession({
        appId: id,
        hostConfig: {
          authType: 'oauth2',
          clientId,
          host,
          redirectUri: `${window.location.origin}/auth/login/callback`,
          accessTokenStorage: 'session',
        },
      }).getDoc();
    }

    // Local / no-auth engine (e.g. qlik-core, docker engine)
    const scheme = engineConfig.secure !== false ? 'https' : 'http';
    const localHost = `${scheme}://${engineConfig.host}${engineConfig.port ? `:${engineConfig.port}` : ''}`;
    return openAppSession({
      appId: id,
      hostConfig: { authType: 'noauth', host: localHost },
    }).getDoc();
  } catch (error) {
    throw new Error('Failed to open app!', { cause: error });
  }
};

export { connect, openApp, getParams, getConnectionInfo, setHostConfig, parseEngineURL };
