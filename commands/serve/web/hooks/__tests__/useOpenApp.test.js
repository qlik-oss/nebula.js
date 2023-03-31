import { renderHook, act } from '@testing-library/react';
import * as ENIGMA from 'enigma.js';
import * as SenseUtilities from 'enigma.js/sense-utilities';
import qixSchema from 'enigma.js/schemas/12.1657.0.json';
import { useOpenApp } from '../useOpenApp';
import * as getAuthInstanceModule from '../../connect';

jest.mock('enigma.js');
jest.mock('enigma.js/sense-utilities');

describe('useOpenApp()', () => {
  let renderResult;
  let app;
  let info;
  let buildUrlMock;

  let enigmaOpenDocMock;
  let enigmaOpenMock;
  let enigmaCreateMock;

  let getAuthInstanceMock;
  let generateWebsocketUrlMock;

  let clientId;
  let webIntegrationId;
  let host;
  let appId;
  let windowFetchSpy;

  beforeEach(() => {
    host = 'some.host.in.eu.qlikdev.com';
    clientId = 'xxx__client_id__xxx';
    webIntegrationId = 'xxx__web_integration_id__xxx';
    appId = 'SOME_APP_ID';

    info = {};
    buildUrlMock = jest.fn().mockReturnValue('ws://someGeneratedUrl:withPort');
    jest.spyOn(SenseUtilities, 'buildUrl').mockImplementation(buildUrlMock);

    enigmaOpenDocMock = jest.fn().mockReturnValue();
    enigmaOpenMock = jest.fn().mockReturnValue({
      openDoc: enigmaOpenDocMock,
    });
    enigmaCreateMock = jest.fn().mockReturnValue({
      open: enigmaOpenMock,
    });
    jest.spyOn(ENIGMA, 'create').mockImplementation(enigmaCreateMock);

    generateWebsocketUrlMock = jest
      .fn()
      .mockResolvedValue(
        `wss://${host}/app=${appId}&qlik-csrf-token=SOME_CSRF_TOKEN&qlik-web-integration-id=${webIntegrationId}`
      );
    getAuthInstanceMock = jest.fn().mockResolvedValue({
      generateWebsocketUrl: generateWebsocketUrlMock,
    });
    jest.spyOn(getAuthInstanceModule, 'getAuthInstance').mockImplementation(getAuthInstanceMock);
    windowFetchSpy = jest.spyOn(window, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  test('should not try to open app if there was no info', async () => {
    app = { isLocalApp: true };
    enigmaOpenDocMock.mockReturnValue(app);

    await act(async () => {
      renderResult = renderHook(() => useOpenApp({ info: null }));
    });

    expect(enigmaCreateMock).not.toBeCalled();
    expect(enigmaOpenMock).not.toBeCalled();
    expect(enigmaOpenDocMock).not.toBeCalled();
  });

  test('should return expected result from hook when tring to connect with localhost', async () => {
    app = { isLocalApp: true };
    enigmaOpenDocMock.mockReturnValue(app);
    info = {
      enigma: {
        appId: 'someAppID',
      },
    };
    await act(async () => {
      renderResult = renderHook(() => useOpenApp({ info }));
    });

    expect(enigmaCreateMock).toHaveBeenCalledTimes(1);
    expect(enigmaCreateMock).toHaveBeenCalledWith({ schema: qixSchema, url: 'ws://someGeneratedUrl:withPort' });
    expect(enigmaOpenMock).toHaveBeenCalledTimes(1);
    expect(enigmaOpenDocMock).toHaveBeenCalledTimes(1);
    expect(enigmaOpenDocMock).toHaveBeenCalledWith(info.enigma.appId);
    expect(renderResult.result.current).toEqual({
      waiting: false,
      setApp: expect.any(Function),
      app,
    });
  });

  test('should return expected result from hook when tring to connect with web integration id', async () => {
    app = { isSDEwithIntegrationId: true };
    enigmaOpenDocMock.mockReturnValue(app);
    info = { webIntegrationId, enigma: { appId, host } };
    await act(async () => {
      renderResult = renderHook(() => useOpenApp({ info }));
    });

    expect(enigmaCreateMock).toHaveBeenCalledTimes(1);
    expect(enigmaCreateMock).toHaveBeenCalledWith({
      schema: qixSchema,
      url: `wss://${host}/app=${appId}&qlik-csrf-token=SOME_CSRF_TOKEN&qlik-web-integration-id=${webIntegrationId}`,
    });
    expect(enigmaOpenMock).toHaveBeenCalledTimes(1);
    expect(enigmaOpenDocMock).toHaveBeenCalledTimes(1);
    expect(enigmaOpenDocMock).toHaveBeenCalledWith(info.enigma.appId);
    expect(renderResult.result.current).toEqual({
      waiting: false,
      setApp: expect.any(Function),
      app,
    });
  });

  test('should return expected result from hook when tring to connect with client id', async () => {
    const webSocketUrl = `wss://${host}/app=${appId}&qlik-csrf-token=SOME_CSRF_TOKEN&qlik-client-id=${clientId}`;
    windowFetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ webSocketUrl }),
    });
    app = { isSDEwithClientId: true };
    enigmaOpenDocMock.mockReturnValue(app);
    info = { clientId, enigma: { appId, host } };
    await act(async () => {
      renderResult = renderHook(() => useOpenApp({ info }));
    });

    expect(enigmaCreateMock).toHaveBeenCalledTimes(1);
    expect(enigmaCreateMock).toHaveBeenCalledWith({
      schema: qixSchema,
      url: webSocketUrl,
    });
    expect(enigmaOpenMock).toHaveBeenCalledTimes(1);
    expect(enigmaOpenDocMock).toHaveBeenCalledTimes(1);
    expect(enigmaOpenDocMock).toHaveBeenCalledWith(info.enigma.appId);
    expect(renderResult.result.current).toEqual({
      waiting: false,
      setApp: expect.any(Function),
      app,
    });
  });
});
