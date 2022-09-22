import * as SDK from '@qlik/sdk';
import * as ENIGMA from 'enigma.js';
import qixSchema from 'enigma.js/schemas/12.936.0.json';
import * as SenseUtilities from 'enigma.js/sense-utilities';
import { connect } from '../connect';

jest.mock('@qlik/sdk');
jest.mock('enigma.js');
jest.mock('enigma.js/sense-utilities');

describe('connect.js', () => {
  describe('connect()', () => {
    let authConfig = {};
    let isAuthenticatedMock;
    let authenticateMock;
    let restCallMock;
    let jsonResponseMock;

    beforeEach(() => {
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
      }));
    });

    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

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

      test('should not cal `Auth.authenticate()` if user is already logged in', async () => {
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
      let enigmaCreateMock;
      let enigmaOpenMock;

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
});
