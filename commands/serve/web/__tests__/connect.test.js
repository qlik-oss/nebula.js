import { /*getHeaders,*/ connect } from '../connect';
import * as ConnectUtils from '../connect';
import * as SDK from '@qlik/sdk';

jest.mock('@qlik/sdk');

describe('connect.js', () => {
  // describe('getHeaders()', () => {
  //   let authInstance = {};

  //   beforeEach(() => {
  //     authInstance = {
  //       config: {
  //         webIntegrationId: '#someIngerationId',
  //         csrfToken: '#someCSRFToken',
  //       },
  //     };
  //   });

  //   test('should return 401 status code if there is no `authInstance has passed`', () => {
  //     expect(getHeaders()).toBe(401);
  //   });

  //   test('should return correct `qlik-web-integration-id` and `qlik-csrf-token`', () => {
  //     const result = getHeaders(authInstance);
  //     expect(result).toHaveProperty('qlik-web-integration-id');
  //     expect(result).toHaveProperty('qlik-csrf-token');
  //     expect(result).toEqual({
  //       'qlik-web-integration-id': authInstance.config.webIntegrationId,
  //       'qlik-csrf-token': authInstance.config.csrfToken,
  //     });
  //   });
  // });

  describe('connect()', () => {
    describe('connectiong with webIntegration flow', () => {
      let authConfig = {};
      let isAuthenticatedMock;
      let authenticateMock;
      let restCallMock;

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
        jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                webIntegrationId: '#someId',
                enigma: {
                  secure: true,
                  host: 'some.eu.tenant.pte.qlikdev.com',
                },
              }),
          })
        );
        SDK.Auth.mockImplementation(() => {
          return {
            config: authConfig,
            isAuthenticated: isAuthenticatedMock,
            authenticate: authenticateMock,
            rest: restCallMock,
          };
        });
      });

      afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
      });

      test('should not call `Auth.authenticate()` if user is already logged in', async () => {
        isAuthenticatedMock.mockImplementationOnce(() => true);
        await connect();
        expect(SDK.Auth).toHaveBeenCalledTimes(1);
        expect(isAuthenticatedMock).toHaveBeenCalledTimes(1);
        expect(authenticateMock).toHaveBeenCalledTimes(0);
      });

      test('should call `Auth.authenticate()` if user is not logged in', async () => {
        console.log('cccc', { connection: ConnectUtils.connection });
        ConnectUtils.connection = undefined;
        console.log('cccc2', { connection: ConnectUtils.connection });
        isAuthenticatedMock.mockImplementationOnce(() => false);
        await connect();
        expect(SDK.Auth).toHaveBeenCalledTimes(1);
        // expect(isAuthenticatedMock).toHaveBeenCalledTimes(1);
        // expect(authenticateMock).toHaveBeenCalledTimes(1);
      });

      // test('should return `getDocList()` and `getConfiguration()`', async () => {
      //   await connect();
      // });

      // test.only('should call `Auth.rest("/items")` to get apps list', async () => {
      //   await connect();
      //   expect(SDK.Auth).toHaveBeenCalledTimes(1);
      //   expect(restCallMock).toHaveBeenCalledTimes(1);
      // });
    });

    // describe('connectiong with Local Engine flow', () => {
    //   test('should pass', () => {
    //     expect(1).toBe(1);
    //   });
    // });
  });
});
