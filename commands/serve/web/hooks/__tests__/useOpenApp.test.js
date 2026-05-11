import { renderHook, act } from '@testing-library/react';
import { openAppSession } from '@qlik/api/qix';
import { useOpenApp } from '../useOpenApp';

jest.mock('@qlik/api/qix', () => ({
  openAppSession: jest.fn(),
}));

describe('useOpenApp()', () => {
  let renderResult;
  let app;
  let info;

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

    getDocMock = jest.fn().mockResolvedValue(undefined);
    appSessionMock = { getDoc: getDocMock };
    openAppSession.mockReturnValue(appSessionMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  test('should not try to open app if there was no info', async () => {
    await act(async () => {
      renderResult = renderHook(() => useOpenApp({ info: null }));
    });

    expect(openAppSession).not.toHaveBeenCalled();
    expect(renderResult.result.current).toEqual({
      waiting: true,
      setApp: expect.any(Function),
      app: null,
    });
  });

  test('should call openAppSession with noauth hostConfig when connecting with local engine', async () => {
    app = { isLocalApp: true };
    getDocMock.mockResolvedValue(app);
    info = {
      engine: {
        appId,
        host: 'localhost',
        port: 9076,
        secure: false,
      },
    };

    await act(async () => {
      renderResult = renderHook(() => useOpenApp({ info }));
    });

    expect(openAppSession).toHaveBeenCalledTimes(1);
    expect(openAppSession).toHaveBeenCalledWith({
      appId,
      hostConfig: { authType: 'noauth', host: 'http://localhost:9076' },
    });
    expect(getDocMock).toHaveBeenCalledTimes(1);
    expect(renderResult.result.current).toEqual({
      waiting: false,
      setApp: expect.any(Function),
      app,
    });
  });

  test('should call openAppSession with noauth hostConfig when connecting with secure local engine', async () => {
    app = { isLocalApp: true };
    getDocMock.mockResolvedValue(app);
    info = {
      engine: {
        appId,
        host: 'myengine.internal',
      },
    };

    await act(async () => {
      renderResult = renderHook(() => useOpenApp({ info }));
    });

    expect(openAppSession).toHaveBeenCalledWith({
      appId,
      hostConfig: { authType: 'noauth', host: 'https://myengine.internal' },
    });
  });

  test('should call openAppSession with cookie hostConfig when connecting with web integration id', async () => {
    app = { isSDEwithIntegrationId: true };
    getDocMock.mockResolvedValue(app);
    info = { webIntegrationId, engine: { appId, host } };

    await act(async () => {
      renderResult = renderHook(() => useOpenApp({ info }));
    });

    expect(openAppSession).toHaveBeenCalledTimes(1);
    expect(openAppSession).toHaveBeenCalledWith({
      appId,
      hostConfig: { authType: 'cookie', webIntegrationId, host },
    });
    expect(getDocMock).toHaveBeenCalledTimes(1);
    expect(renderResult.result.current).toEqual({
      waiting: false,
      setApp: expect.any(Function),
      app,
    });
  });

  test('should call openAppSession with oauth2 hostConfig when connecting with client id', async () => {
    app = { isSDEwithClientId: true };
    getDocMock.mockResolvedValue(app);
    info = { clientId, engine: { appId, host } };

    await act(async () => {
      renderResult = renderHook(() => useOpenApp({ info }));
    });

    expect(openAppSession).toHaveBeenCalledTimes(1);
    expect(openAppSession).toHaveBeenCalledWith({
      appId,
      hostConfig: {
        authType: 'oauth2',
        clientId,
        host,
        redirectUri: `${window.location.origin}/auth/login/callback`,
        accessTokenStorage: 'session',
      },
    });
    expect(getDocMock).toHaveBeenCalledTimes(1);
    expect(renderResult.result.current).toEqual({
      waiting: false,
      setApp: expect.any(Function),
      app,
    });
  });

  test('should throw if appId is missing', async () => {
    info = { engine: { host } };
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await act(async () => {
      renderResult = renderHook(() => useOpenApp({ info }));
    });

    expect(openAppSession).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    expect(renderResult.result.current.app).toBeNull();
    consoleSpy.mockRestore();
  });
});
