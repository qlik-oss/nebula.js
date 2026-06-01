import * as ENIGMA from 'enigma.js';

import auth from '@qlik/api/auth';
import { getItems } from '@qlik/api/items';
import { openAppSession } from '@qlik/api/qix';
import * as getCsrfToken from '../utils/getCsrfToken';
import { connect, openApp, getConnectionInfo, getParams, parseEngineURL } from '../connect';

jest.mock('../utils/getCsrfToken', () => jest.fn());

jest.mock('@qlik/api/auth', () => ({
  __esModule: true,
  default: { setDefaultHostConfig: jest.fn() },
}));

jest.mock('@qlik/api/items', () => ({
  getItems: jest.fn(),
}));

jest.mock('@qlik/api/qix', () => ({
  openAppSession: jest.fn(),
}));

jest.mock('enigma.js');

describe('connect.js', () => {
  let appId;
  let authConfig = {};
  let jsonResponseMock;

  beforeEach(() => {
    appId = 'someAppId';
    authConfig = {
      authType: 'cookie',
      host: 'some.eu.tenant.pte.qlikdev.com',
      webIntegrationId: 'someIntegrationId',
    };
    jsonResponseMock = jest.fn();
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: jsonResponseMock,
      })
    );
    getCsrfToken.mockResolvedValue('A-CSRF-TOKEN');
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('connect()', () => {
    test('should throw error if fails to get enigma instance', async () => {
      jsonResponseMock.mockImplementation(() => Promise.reject(new Error('failed')));
      try {
        await connect();
      } catch (err) {
        expect(err.message).toBe('Failed to return enigma instance');
      }
    });

    describe('connecting with `webIntegrationId` flow', () => {
      beforeEach(() => {
        jsonResponseMock.mockImplementation(() =>
          Promise.resolve({
            webIntegrationId: 'someIntegrationId',
            engine: {
              secure: false,
              host: 'some.eu.tenant.pte.qlikdev.com',
            },
          })
        );
      });

      test('should call `auth.setDefaultHostConfig` with cookie authType', async () => {
        await connect();
        expect(auth.setDefaultHostConfig).toHaveBeenCalledTimes(1);
        expect(auth.setDefaultHostConfig).toHaveBeenCalledWith(
          expect.objectContaining({
            authType: 'cookie',
            webIntegrationId: 'someIntegrationId',
          })
        );
      });

      test('should return `getDocList()` and `getConfiguration()`', async () => {
        const result = await connect();
        expect(result).toMatchObject({
          getDocList: expect.any(Function),
          getConfiguration: expect.any(Function),
        });
      });

      test('getDocList should call getItems and map results', async () => {
        getItems.mockResolvedValue({
          data: {
            data: [{ resourceId: 'app-1', name: 'My App' }],
          },
        });
        const result = await connect();
        const docList = await result.getDocList();
        expect(getItems).toHaveBeenCalledWith(expect.objectContaining({ resourceType: 'app', limit: 30 }));
        expect(docList).toEqual([{ qDocId: 'app-1', qTitle: 'My App' }]);
      });

      test('getDocList should propagate errors from getItems', async () => {
        getItems.mockRejectedValue(new Error('network error'));
        const result = await connect();
        await expect(result.getDocList()).rejects.toThrow('Failed to fetch app list');
      });
    });

    describe('connecting with `clientId` (OAuth2) flow', () => {
      beforeEach(() => {
        jsonResponseMock.mockImplementation(() =>
          Promise.resolve({
            clientId: 'someClientId',
            engine: {
              secure: true,
              host: 'some.eu.tenant.pte.qlikdev.com',
            },
          })
        );
      });

      test('should call `auth.setDefaultHostConfig` with oauth2 authType', async () => {
        await connect();
        expect(auth.setDefaultHostConfig).toHaveBeenCalledTimes(1);
        expect(auth.setDefaultHostConfig).toHaveBeenCalledWith(
          expect.objectContaining({
            authType: 'oauth2',
            clientId: 'someClientId',
          })
        );
      });

      test('should return `getDocList()` and `getConfiguration()`', async () => {
        const result = await connect();
        expect(result).toMatchObject({
          getDocList: expect.any(Function),
          getConfiguration: expect.any(Function),
        });
      });
    });

    describe('connecting with Local Engine flow', () => {
      let connectionResponse = {};
      let enigmaOpenMock;
      let enigmaCreateMock;

      beforeEach(() => {
        connectionResponse = {
          webIntegrationId: undefined,
          engine: {
            secure: false,
            host: 'localhost',
            port: '1234',
          },
        };
        jsonResponseMock.mockImplementation(() => Promise.resolve(connectionResponse));

        enigmaOpenMock = jest.fn();
        enigmaCreateMock = jest.fn().mockReturnValue({
          open: enigmaOpenMock,
        });
        ENIGMA.create.mockImplementation(enigmaCreateMock);
      });

      afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
      });

      test('should call `enigma.create` with manually constructed ws URL including csrf token', async () => {
        await connect();
        expect(enigmaCreateMock).toHaveBeenCalledTimes(1);
        expect(enigmaCreateMock).toHaveBeenCalledWith({
          schema: expect.any(Object),
          url: 'ws://localhost:1234?qlik-csrf-token=A-CSRF-TOKEN',
        });
      });

      test('should call `enigma.create` with wss when secure is true', async () => {
        connectionResponse.engine.secure = true;
        await connect();
        expect(enigmaCreateMock).toHaveBeenCalledWith(
          expect.objectContaining({ url: 'wss://localhost:1234?qlik-csrf-token=A-CSRF-TOKEN' })
        );
      });

      test('should call `enigma.create().open()` one time', async () => {
        await connect();
        expect(enigmaOpenMock).toHaveBeenCalledTimes(1);
      });

      test('should include prefix in URL when provided', async () => {
        connectionResponse.engine.prefix = 'myprefix';
        await connect();
        expect(enigmaCreateMock).toHaveBeenCalledWith(
          expect.objectContaining({ url: 'ws://localhost:1234/myprefix?qlik-csrf-token=A-CSRF-TOKEN' })
        );
      });
    });
  });

  describe('openApp()', () => {
    let getDocMock;
    let appSessionMock;

    beforeEach(() => {
      getDocMock = jest.fn().mockResolvedValue({ id: appId });
      appSessionMock = { getDoc: getDocMock };
      openAppSession.mockReturnValue(appSessionMock);
    });

    test('should throw error if fails to open app', async () => {
      jsonResponseMock.mockImplementation(() => Promise.reject(new Error('failed')));
      try {
        await openApp();
      } catch (err) {
        expect(err.message).toBe('Failed to open app!');
      }
    });

    describe('open app with `webIntegrationId` flow', () => {
      beforeEach(() => {
        jsonResponseMock.mockImplementation(() =>
          Promise.resolve({
            webIntegrationId: 'someIntegrationId',
            engine: {
              secure: false,
              host: 'some.eu.tenant.pte.qlikdev.com',
            },
          })
        );
      });

      test('should call `openAppSession` with cookie hostConfig', async () => {
        await openApp(appId);
        expect(openAppSession).toHaveBeenCalledWith({
          appId,
          hostConfig: {
            authType: 'cookie',
            webIntegrationId: 'someIntegrationId',
            host: 'some.eu.tenant.pte.qlikdev.com',
          },
        });
      });

      test('should call `getDoc` and return the document', async () => {
        const result = await openApp(appId);
        expect(getDocMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id: appId });
      });

      test('should not call enigma directly', async () => {
        await openApp(appId);
        expect(ENIGMA.create).not.toHaveBeenCalled();
      });
    });

    describe('open app with clientId (OAuth2) flow', () => {
      beforeEach(() => {
        jsonResponseMock.mockImplementation(() =>
          Promise.resolve({
            clientId: 'someClientId',
            engine: {
              secure: true,
              host: 'some.eu.tenant.pte.qlikdev.com',
            },
          })
        );
      });

      test('should call `openAppSession` with oauth2 hostConfig', async () => {
        await openApp(appId);
        expect(openAppSession).toHaveBeenCalledWith({
          appId,
          hostConfig: {
            authType: 'oauth2',
            clientId: 'someClientId',
            host: 'some.eu.tenant.pte.qlikdev.com',
            redirectUri: `${window.location.origin}/auth/login/callback`,
            accessTokenStorage: 'session',
          },
        });
      });

      test('should call `getDoc` and return the document', async () => {
        const result = await openApp(appId);
        expect(getDocMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id: appId });
      });

      test('should not call enigma directly', async () => {
        await openApp(appId);
        expect(ENIGMA.create).not.toHaveBeenCalled();
      });
    });

    describe('open app with Local engine flow', () => {
      beforeEach(() => {
        jsonResponseMock.mockImplementation(() =>
          Promise.resolve({
            webIntegrationId: undefined,
            engine: {
              secure: false,
              host: 'localhost',
              port: '9076',
            },
          })
        );
      });

      test('should call `openAppSession` with noauth hostConfig', async () => {
        await openApp(appId);
        expect(openAppSession).toHaveBeenCalledWith({
          appId,
          hostConfig: { authType: 'noauth', host: 'http://localhost:9076' },
        });
      });

      test('should call `openAppSession` with https when engine is secure', async () => {
        jsonResponseMock.mockImplementation(() =>
          Promise.resolve({
            engine: { secure: true, host: 'myengine.internal' },
          })
        );
        await openApp(appId);
        expect(openAppSession).toHaveBeenCalledWith({
          appId,
          hostConfig: { authType: 'noauth', host: 'https://myengine.internal' },
        });
      });

      test('should call `getDoc` and return the document', async () => {
        const result = await openApp(appId);
        expect(getDocMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id: appId });
      });

      test('should not call enigma directly', async () => {
        await openApp(appId);
        expect(ENIGMA.create).not.toHaveBeenCalled();
      });
    });
  });

  describe('getConnectionInfo()', () => {
    beforeEach(() => {
      jsonResponseMock.mockImplementation(() =>
        Promise.resolve({
          webIntegrationId: 'someIntegrationId',
          engine: {
            secure: false,
            host: 'some.eu.tenant.pte.qlikdev.com',
          },
        })
      );
    });

    test('should parse engine url while connecting into SDE', async () => {
      window.location.assign(
        `/some-url?engine_url=wss://${authConfig.host}&qlik-web-integration-id=${authConfig.webIntegrationId}`
      );
      const result = await getConnectionInfo();
      expect(result).toEqual(
        expect.objectContaining({
          appUrl: undefined,
          engine: expect.objectContaining({
            secure: true, // since it is "wss"
            host: authConfig.host,
            port: undefined, // since we are providing link
            appId: undefined, // since we are providing link
          }),
          engineUrl: `wss://${authConfig.host}`,
          rootPath: `https://${authConfig.host}`,
        })
      );
    });

    test('should pass `qlik-web-integration-id` if it is provided in url', async () => {
      window.location.assign(
        `/some-url?engine_url=wss://${authConfig.host}&qlik-web-integration-id=${authConfig.webIntegrationId}`
      );
      const result = await getConnectionInfo();
      expect(result).toEqual(
        expect.objectContaining({
          appUrl: undefined,
          webIntegrationId: authConfig.webIntegrationId,
          engineUrl: `wss://${authConfig.host}`,
          rootPath: `https://${authConfig.host}`,
        })
      );
    });

    test('should parse engine url while connecting to local docker engine', async () => {
      window.location.assign('/?engine_url=ws://localhost:1234');
      const result = await getConnectionInfo();
      expect(result).toEqual(
        expect.objectContaining({
          engine: expect.objectContaining({
            secure: false, // since it is "ws"
            host: 'localhost',
            port: '1234',
            appId: undefined, // there is no appId
          }),
          engineUrl: 'ws://localhost:1234',
          appUrl: undefined,
        })
      );
    });

    test('should pass appId if it is provided in url', async () => {
      window.location.assign('/?app=SOME_APP_ID');
      const result = await getConnectionInfo();
      expect(result).toEqual(
        expect.objectContaining({
          engine: expect.objectContaining({
            secure: false, // since it is "ws"
            host: authConfig.host,
            appId: 'SOME_APP_ID',
          }),
          webIntegrationId: authConfig.webIntegrationId,
        })
      );
    });

    test('should return invalid if url was not matching anything', async () => {
      jsonResponseMock.mockImplementation(() =>
        Promise.resolve({
          invalid: true,
        })
      );
      const result = await getConnectionInfo();
      expect(result).toEqual({
        invalid: true,
      });
    });
  });

  describe('getParams()', () => {
    test('should detect engine url and integration id from provided link', () => {
      window.location.assign(
        `/some-url?engine_url=wss://${authConfig.host}&qlik-web-integration-id=${authConfig.webIntegrationId}`
      );
      expect(getParams()).toEqual({
        engine_url: `wss://${authConfig.host}`,
        'qlik-web-integration-id': authConfig.webIntegrationId,
      });
    });

    test('should separate columns in to an array in case of any `cols` params in link', () => {
      window.location.assign('/?engine_url=ws://localhost:1234&cols=col_01,col_02,col_03');
      expect(getParams()).toEqual({
        engine_url: 'ws://localhost:1234',
        cols: ['col_01', 'col_02', 'col_03'],
      });
    });
  });

  describe('parseEngineURL()', () => {
    let url;

    test('should return invalid object if there was no match', () => {
      url = '/?someParam=https://localhost:1234';
      const result = parseEngineURL(url);
      expect(result).toEqual({
        engineUrl: url,
        invalid: true,
      });
    });

    test('should return expected info from SDE url', () => {
      url = `/some-url?engine_url=wss://${authConfig.host}&qlik-web-integration-id=${authConfig.webIntegrationId}`;
      const result = parseEngineURL(url);
      expect(result).toMatchObject({
        engine: expect.objectContaining({
          secure: expect.any(Boolean),
          host: expect.any(String),
          port: undefined, // because of providing a link
          appId: undefined, // since there is not appid in link
          prefix: undefined,
        }),
        engineUrl: expect.any(String),
        appUrl: undefined, // because no app has been provided
      });
    });

    test('should return expected info from Local Docker url', () => {
      url = '/?engine_url=ws://localhost:1234';
      const result = parseEngineURL(url);
      expect(result).toMatchObject({
        engine: expect.objectContaining({
          secure: expect.any(Boolean),
          host: expect.any(String),
          port: expect.any(String),
          appId: undefined, // since there is not appid in link
          prefix: undefined,
        }),
        engineUrl: expect.any(String),
        appUrl: undefined, // because no app has been provided
      });
    });

    test('should find app url param from provided link', () => {
      url = `engine_url=wss://${authConfig.host}/app/SOME_APP_ID/`;
      const result = parseEngineURL(url);
      expect(result).toMatchObject({
        engine: expect.objectContaining({
          secure: expect.any(Boolean),
          host: expect.any(String),
          port: undefined, // because of providing a link
          appId: 'SOME_APP_ID/', // since there is an appid in link
          prefix: undefined,
        }),
        engineUrl: `engine_url=wss://${authConfig.host}`,
        appUrl: url,
      });
    });

    test('should match prefix correctly', () => {
      url = `engine_url=wss://${authConfig.host}/prefix`;
      const result = parseEngineURL(url);
      expect(result).toMatchObject({
        engine: expect.objectContaining({
          secure: expect.any(Boolean),
          host: expect.any(String),
          port: undefined,
          appId: undefined,
          prefix: 'prefix',
        }),
        engineUrl: `engine_url=wss://${authConfig.host}/prefix`,
        appUrl: undefined,
      });
    });
    test('should match prefix correctly with app', () => {
      url = `wss://${authConfig.host}/prefix/app/SOME_APP_ID/`;
      const result2 = parseEngineURL(url);
      expect(result2).toMatchObject({
        engine: expect.objectContaining({
          secure: expect.any(Boolean),
          host: expect.any(String),
          port: undefined, // because of providing a link
          appId: 'SOME_APP_ID/', // since there is an appid in link
          prefix: 'prefix',
        }),
        engineUrl: expect.any(String),
        appUrl: url,
      });
    });
    test('should match app correctly without prefix', () => {
      url = `wss://${authConfig.host}/app/SOME_APP_ID/`;
      const result2 = parseEngineURL(url);
      expect(result2).toMatchObject({
        engine: expect.objectContaining({
          secure: expect.any(Boolean),
          host: expect.any(String),
          port: undefined, // because of providing a link
          appId: 'SOME_APP_ID/', // since there is an appid in link
          prefix: undefined,
        }),
        engineUrl: expect.any(String),
        appUrl: url,
      });
    });

    test('should match localhost app correctly with prefix and port', () => {
      url = `wss://localhost:4455/prefix/app/SOME_APP_ID/`;
      const result2 = parseEngineURL(url);
      expect(result2).toMatchObject({
        engine: expect.objectContaining({
          secure: expect.any(Boolean),
          host: expect.any(String),
          port: '4455', // because of providing a link
          appId: 'SOME_APP_ID/', // since there is an appid in link
          prefix: 'prefix',
        }),
        engineUrl: `wss://localhost:4455/prefix`,
        appUrl: url,
      });
    });

    test('should match localhost app correctly with prefix and no port', () => {
      url = `wss://localhost/prefix/app/SOME_APP_ID/`;
      const result2 = parseEngineURL(url);
      expect(result2).toMatchObject({
        engine: expect.objectContaining({
          secure: expect.any(Boolean),
          host: expect.any(String),
          port: undefined, // because of providing a link
          appId: 'SOME_APP_ID/', // since there is an appid in link
          prefix: 'prefix',
        }),
        engineUrl: `wss://localhost/prefix`,
        appUrl: url,
      });
    });

    test('should match app and prefix with all allowed characters', () => {
      url = `wss://${authConfig.host}/prefix123456789-._~/app/SOME_APP_ID/`;
      const result2 = parseEngineURL(url);
      expect(result2).toMatchObject({
        engine: expect.objectContaining({
          secure: expect.any(Boolean),
          host: expect.any(String),
          port: undefined, // because of providing a link
          appId: 'SOME_APP_ID/', // since there is an appid in link
          prefix: 'prefix123456789-._~',
        }),
        engineUrl: expect.any(String),
        appUrl: url,
      });
    });
  });
});
