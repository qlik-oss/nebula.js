import { renderHook, act } from '@testing-library/react';
import { useCachedConnections } from '../useCachedConnections';

describe('useCachedConnection()', () => {
  let storageGet;
  let storageSave;
  let storage;
  let renderResult;
  let cachedConn;
  let info;
  let clientId;
  let webIntegrationId;
  let engineUrl;

  beforeEach(() => {
    clientId = 'xxx__client_id__xxx';
    webIntegrationId = 'xxx__web_integration_id__xxx';
    engineUrl = 'some.engine.in.eu.qlikdev.com';

    storageGet = jest.fn();
    storageSave = jest.fn();
    storage = { get: storageGet, save: storageSave };
    cachedConn = ['conn#01', 'conn#02'];
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should return expected schema as result if it could not find any cached connection', async () => {
    await act(async () => {
      renderResult = renderHook(() => useCachedConnections({ storage }));
    });

    expect(renderResult.result.current).toMatchObject({
      cachedConnections: [],
      removeCachedConnection: expect.any(Function),
      addCachedConnections: expect.any(Function),
    });
  });

  test('should return correct cached connection if it finds any', async () => {
    storageGet.mockReturnValue(cachedConn);
    await act(async () => {
      renderResult = renderHook(() => useCachedConnections({ storage }));
    });

    expect(renderResult.result.current.cachedConnections).toEqual(cachedConn);
  });

  test('should be able to remove item from cached connections', async () => {
    storageGet.mockReturnValue(cachedConn);
    await act(async () => {
      renderResult = renderHook(() => useCachedConnections({ storage }));
    });

    // check first to has correct items
    expect(renderResult.result.current.cachedConnections).toBe(cachedConn);

    // remove and then check again
    const { removeCachedConnection } = renderResult.result.current;
    await act(() => removeCachedConnection('conn#02'));
    expect(renderResult.result.current.cachedConnections).toEqual(cachedConn.slice(0, 1));
  });

  describe('should be able to add item from cached connections', () => {
    test('should be able to cache connection from localhost', async () => {
      storageGet.mockReturnValue(cachedConn);
      await act(async () => {
        renderResult = renderHook(() => useCachedConnections({ storage }));
      });

      // check first to has correct items
      expect(renderResult.result.current.cachedConnections).toBe(cachedConn);

      // remove and then check again
      const { addCachedConnections } = renderResult.result.current;
      info = { enigma: { secure: false, host: 'localhost', port: 9000 } };
      await act(() => addCachedConnections({ info }));
      expect(storageSave).toHaveBeenCalledTimes(1);
      expect(storageSave).toHaveBeenCalledWith('connections', [...cachedConn, 'ws://localhost:9000']);
      expect(renderResult.result.current.cachedConnections).toEqual([...cachedConn, 'ws://localhost:9000']);
    });

    test('should be able to cache connection from SDE with web integration id', async () => {
      storageGet.mockReturnValue(cachedConn);
      await act(async () => {
        renderResult = renderHook(() => useCachedConnections({ storage }));
      });

      // check first to has correct items
      expect(renderResult.result.current.cachedConnections).toBe(cachedConn);

      // remove and then check again
      const { addCachedConnections } = renderResult.result.current;
      info = { enigma: { secure: true, host: engineUrl }, webIntegrationId };
      await act(() => addCachedConnections({ info }));
      expect(storageSave).toHaveBeenCalledTimes(1);
      expect(storageSave).toHaveBeenCalledWith('connections', [
        ...cachedConn,
        `wss://${engineUrl}/?qlik-web-integration-id=${webIntegrationId}`,
      ]);
      expect(renderResult.result.current.cachedConnections).toEqual([
        ...cachedConn,
        `wss://${engineUrl}/?qlik-web-integration-id=${webIntegrationId}`,
      ]);
    });

    test('should be able to cache connection from SDE with client id', async () => {
      storageGet.mockReturnValue(cachedConn);
      await act(async () => {
        renderResult = renderHook(() => useCachedConnections({ storage }));
      });

      // check first to has correct items
      expect(renderResult.result.current.cachedConnections).toBe(cachedConn);

      // remove and then check again
      const { addCachedConnections } = renderResult.result.current;
      info = { enigma: { secure: true, host: engineUrl }, clientId };
      await act(() => addCachedConnections({ info }));
      expect(storageSave).toHaveBeenCalledTimes(1);
      expect(storageSave).toHaveBeenCalledWith('connections', [
        ...cachedConn,
        `wss://${engineUrl}/?qlik-client-id=${clientId}`,
      ]);
      expect(renderResult.result.current.cachedConnections).toEqual([
        ...cachedConn,
        `wss://${engineUrl}/?qlik-client-id=${clientId}`,
      ]);
    });
  });
});
