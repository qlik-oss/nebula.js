import { renderHook, act } from '@testing-library/react';
import * as ENIGMA from 'enigma.js';
import * as SenseUtilities from 'enigma.js/sense-utilities';
import qixSchema from 'enigma.js/schemas/12.2015.0.json';
import { openAppSession } from '@qlik/api/qix';
import { useOpenApp } from '../useOpenApp';
import * as connectModule from '../../connect';
import * as getCsrfToken from '../../utils/getCsrfToken';

jest.mock('enigma.js');
jest.mock('enigma.js/sense-utilities');
jest.mock('../../utils/getCsrfToken', () => jest.fn());

jest.mock('@qlik/api/qix', () => ({
  openAppSession: jest.fn(),
}));

describe('useOpenApp()', () => {
  let renderResult;
  let app;
  let info;
  let buildUrlMock;

  let enigmaOpenDocMock;
  let enigmaOpenMock;
  let enigmaCreateMock;

  let setHostConfigMock;
  let getDocMock;
  let appSessionMock;

  let host;
  let appId;
  let clientId;
  let webIntegrationId;

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

    setHostConfigMock = jest.fn();
    jest.spyOn(connectModule, 'setHostConfig').mockImplementation(setHostConfigMock);

    getDocMock = jest.fn().mockResolvedValue(undefined);
    appSessionMock = { getDoc: getDocMock };
    openAppSession.mockReturnValue(appSessionMock);

    getCsrfToken.mockResolvedValue('A-CSRF-TOKEN');
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

    expect(enigmaCreateMock).not.toHaveBeenCalled();
    expect(enigmaOpenMock).not.toHaveBeenCalled();
    expect(enigmaOpenDocMock).not.toHaveBeenCalled();
  });

  test('should return expected result from hook when trying to connect with localhost', async () => {
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

  test('should call setHostConfig and openAppSession when connecting with web integration id', async () => {
    app = { isSDEwithIntegrationId: true };
    getDocMock.mockResolvedValue(app);
    info = { webIntegrationId, enigma: { appId, host } };

    await act(async () => {
      renderResult = renderHook(() => useOpenApp({ info }));
    });

    expect(setHostConfigMock).toHaveBeenCalledWith({ webIntegrationId, clientId: undefined, host });
    expect(openAppSession).toHaveBeenCalledWith({ appId });
    expect(getDocMock).toHaveBeenCalledTimes(1);
    expect(renderResult.result.current).toEqual({
      waiting: false,
      setApp: expect.any(Function),
      app,
    });
  });

  test('should call setHostConfig and openAppSession when connecting with client id', async () => {
    app = { isSDEwithClientId: true };
    getDocMock.mockResolvedValue(app);
    info = { clientId, enigma: { appId, host } };

    await act(async () => {
      renderResult = renderHook(() => useOpenApp({ info }));
    });

    expect(setHostConfigMock).toHaveBeenCalledWith({ webIntegrationId: undefined, clientId, host });
    expect(openAppSession).toHaveBeenCalledWith({ appId });
    expect(getDocMock).toHaveBeenCalledTimes(1);
    expect(renderResult.result.current).toEqual({
      waiting: false,
      setApp: expect.any(Function),
      app,
    });
  });
});
