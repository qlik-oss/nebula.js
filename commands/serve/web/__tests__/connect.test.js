import * as SDK from '@qlik/sdk';
import * as ENIGMA from 'enigma.js';
import qixSchema from 'enigma.js/schemas/12.936.0.json';
import * as SenseUtilities from 'enigma.js/sense-utilities';
import { connect, openApp } from '../connect';

jest.mock('@qlik/sdk');
jest.mock('enigma.js');
jest.mock('enigma.js/sense-utilities');

describe('connect.js', () => {
  let appId;
  let authConfig = {};
  let isAuthenticatedMock;
  let authenticateMock;
  let restCallMock;
  let jsonResponseMock;
  let generateWebsocketUrlMock;

  beforeEach(() => {
    appId = '#someAppId';
    authConfig = {
      authType: 'WebIntegration',
      autoRedirect: 'true',
      host: 'some.eu.tenant.pte.qlikdev.com',
      webIntegrationId: '#someId',
    };
    isAuthenticatedMock = jest.fn();
    authenticateMock = jest.fn();
    restCallMock = jest.fn();
    jsonResponseMock = jest.fn();
    generateWebsocketUrlMock = jest.fn();
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: jsonResponseMock,
      })
    );
    SDK.Auth.mockImplementation(() => ({
      config: authConfig,
      isAuthenticated: isAuthenticatedMock,
      authenticate: authenticateMock,
      rest: restCallMock,
      generateWebsocketUrl: generateWebsocketUrlMock,
    }));
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

    describe('connectiong with `webIntegrationId` flow', () => {
      beforeEach(() => {
        jsonResponseMock.mockImplementation(() =>
          Promise.resolve({
            webIntegrationId: '#someId',
            enigma: {
              secure: false,
              host: 'some.eu.tenant.pte.qlikdev.com',
            },
          })
        );
      });

      test('should not call `Auth.authenticate()` if user is already logged in', async () => {
        isAuthenticatedMock.mockImplementationOnce(() => true);
        await connect();
        expect(SDK.Auth).toHaveBeenCalledTimes(1);
        expect(isAuthenticatedMock).toHaveBeenCalledTimes(1);
        expect(authenticateMock).toHaveBeenCalledTimes(0);
      });

      test('should call `Auth.authenticate()` if user is not logged in', async () => {
        isAuthenticatedMock.mockImplementationOnce(() => false);
        await connect();
        expect(SDK.Auth).toHaveBeenCalledTimes(1);
        expect(isAuthenticatedMock).toHaveBeenCalledTimes(1);
        expect(authenticateMock).toHaveBeenCalledTimes(1);
      });

      test('should return `getDocList()` and `getConfiguration()`', async () => {
        const result = await connect();
        expect(result).toMatchObject({
          getDocList: expect.any(Function),
          getConfiguration: expect.any(Function),
        });
      });
    });

    describe('connectiong with Local Engine flow', () => {
      let connectionResponse = {};
      let buildUrlMock;
      let enigmaOpenMock;
      let enigmaCreateMock;

      beforeEach(() => {
        connectionResponse = {
          webIntegrationId: undefined,
          enigma: {
            secure: false,
            host: 'localhost:1234/app/engineData',
          },
        };
        jsonResponseMock.mockImplementation(() => Promise.resolve(connectionResponse));

        buildUrlMock = jest.fn().mockReturnValue(`ws://${connectionResponse.enigma.host}`);
        jest.spyOn(SenseUtilities, 'buildUrl').mockImplementation(buildUrlMock);

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

      test('should call buildUrl with proper arguments', async () => {
        await connect();
        expect(buildUrlMock).toHaveBeenCalledTimes(1);
        expect(buildUrlMock).toHaveBeenCalledWith(connectionResponse.enigma);
      });

      test('should call `enigma.create` with proper arguments', async () => {
        await connect();
        expect(enigmaCreateMock).toHaveBeenCalledTimes(1);
        expect(enigmaCreateMock).toHaveBeenCalledWith({
          schema: qixSchema,
          url: `ws://${connectionResponse.enigma.host}`,
        });
      });

      test('should call `enigma.create().open()` one time', async () => {
        await connect();
        expect(enigmaOpenMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('openApp()', () => {
    test('should throw error if fails to open app', async () => {
      jsonResponseMock.mockImplementation(() => Promise.reject(new Error('failed')));
      try {
        await openApp();
      } catch (err) {
        expect(err.message).toBe('Failed to open app!');
      }
    });

    describe('Open app flows', () => {
      let connectionResponse = {};
      let buildUrlMock;
      let enigmaOpenDocMock;
      let enigmaOpenMock;
      let enigmaCreateMock;

      beforeEach(() => {
        enigmaOpenDocMock = jest.fn();
        enigmaOpenMock = jest.fn().mockReturnValue({
          openDoc: enigmaOpenDocMock,
        });
        enigmaCreateMock = jest.fn().mockReturnValue({
          open: enigmaOpenMock,
        });
        ENIGMA.create.mockImplementation(enigmaCreateMock);
      });

      describe('open app with `webIntegrationId` flow', () => {
        let webSocketURL;

        beforeEach(() => {
          jsonResponseMock.mockImplementation(() =>
            Promise.resolve({
              webIntegrationId: '#someId',
              enigma: {
                secure: false,
                host: 'some.eu.tenant.pte.qlikdev.com',
              },
            })
          );
          webSocketURL = `wss://${authConfig.host}/apps/${appId}?qlik-csrf-token=SOME_CSRF_TOKEN&qlik-web-integration-id=${authConfig.webIntegrationId}`;
          generateWebsocketUrlMock.mockReturnValue(webSocketURL);
        });

        test('should not call `Auth.authenticate()` if user is already logged in', async () => {
          isAuthenticatedMock.mockImplementationOnce(() => true);
          await openApp(appId);
          expect(SDK.Auth).toHaveBeenCalledTimes(1);
          expect(isAuthenticatedMock).toHaveBeenCalledTimes(1);
          expect(authenticateMock).toHaveBeenCalledTimes(0);
        });

        test('should call `Auth.authenticate()` if user is not logged in', async () => {
          isAuthenticatedMock.mockImplementationOnce(() => false);
          await openApp(appId);
          expect(SDK.Auth).toHaveBeenCalledTimes(1);
          expect(isAuthenticatedMock).toHaveBeenCalledTimes(1);
          expect(authenticateMock).toHaveBeenCalledTimes(1);
        });

        test('should call `enigma.create` with proper arguments', async () => {
          await openApp(appId);
          expect(enigmaCreateMock).toHaveBeenCalledTimes(1);
          expect(enigmaCreateMock).toHaveBeenCalledWith({
            schema: qixSchema,
            url: webSocketURL,
          });
        });

        test('should call `enigma.create().open()` one time', async () => {
          await openApp(appId);
          expect(enigmaOpenMock).toHaveBeenCalledTimes(1);
        });

        test('should call `enigma.create().open().openDoc()` one time with proper app id', async () => {
          await openApp(appId);
          expect(enigmaOpenDocMock).toHaveBeenCalledTimes(1);
          expect(enigmaOpenDocMock).toHaveBeenCalledWith(appId);
        });
      });

      describe('with Local engine flow', () => {
        beforeEach(() => {
          connectionResponse = {
            webIntegrationId: undefined,
            enigma: {
              secure: false,
              host: 'localhost:1234/app/engineData',
            },
          };
          jsonResponseMock.mockImplementation(() => Promise.resolve(connectionResponse));
          buildUrlMock = jest.fn().mockReturnValue(`ws://${connectionResponse.enigma.host}`);
          jest.spyOn(SenseUtilities, 'buildUrl').mockImplementation(buildUrlMock);
        });

        test('should call buildUrl with proper arguments', async () => {
          await openApp(appId);
          expect(buildUrlMock).toHaveBeenCalledTimes(1);
          expect(buildUrlMock).toHaveBeenCalledWith(connectionResponse.enigma);
        });

        test('should call `enigma.create` with proper arguments', async () => {
          await openApp(appId);
          expect(enigmaCreateMock).toHaveBeenCalledTimes(1);
          expect(enigmaCreateMock).toHaveBeenCalledWith({
            schema: qixSchema,
            url: `ws://${connectionResponse.enigma.host}`,
          });
        });

        test('should call `enigma.create().open()` one time', async () => {
          await openApp(appId);
          expect(enigmaOpenMock).toHaveBeenCalledTimes(1);
        });

        test('should call `enigma.create().open().openDoc()` one time with proper app id', async () => {
          await openApp(appId);
          expect(enigmaOpenDocMock).toHaveBeenCalledTimes(1);
          expect(enigmaOpenDocMock).toHaveBeenCalledWith(appId);
        });
      });
    });
  });
});
