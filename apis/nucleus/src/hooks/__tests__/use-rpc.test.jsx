import { renderHook, act, waitFor } from '@testing-library/react';

import useRpc from '../useRpc';
import initializeStores from '../../stores/new-model-store';

describe('useRpc', () => {
  let model;

  const modelStoreModule = initializeStores('appId');
  const { rpcRequestStore } = modelStoreModule;

  beforeEach(() => {
    model = {
      id: 'useRpc',
      getLayout: jest.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ foo: 'bar' }), 20);
          })
      ),
      session: {
        getObjectApi: jest.fn().mockReturnValue({ cancelRequest: jest.fn() }),
      },
    };
  });

  afterEach(() => {
    rpcRequestStore.clear('useRpc');
  });

  test('should call method', async () => {
    renderHook(() => useRpc(model, 'getLayout'));
    expect(model.getLayout).toHaveBeenCalledTimes(1);
  });

  test('should set result', async () => {
    const { result } = renderHook(() => useRpc(model, 'getLayout'));
    await waitFor(() => {
      expect(result?.current?.[0]).toEqual({ foo: 'bar' });
      expect(result?.current?.[1]).toEqual({ validating: false, canCancel: false, canRetry: false });
    });
  });

  test('should cache result', async () => {
    renderHook(() => useRpc(model, 'getLayout'));
    expect(model.getLayout).toHaveBeenCalledTimes(1);
    renderHook(() => useRpc(model, 'getLayout'));
    renderHook(() => useRpc(model, 'getLayout'));
    renderHook(() => useRpc(model, 'getLayout'));
    expect(model.getLayout).toHaveBeenCalledTimes(1);
  });

  test('should dispatch invalid', async () => {
    model.getLayout = jest.fn().mockResolvedValue(new Promise(() => {}));
    const { result } = renderHook(() => useRpc(model, 'getLayout'));
    await waitFor(() => {
      expect(result.current[1]).toEqual({ validating: true, canCancel: true, canRetry: false });
    });
  });

  test('should dispatch cancelled', async () => {
    const { result } = renderHook(() => useRpc(model, 'getLayout'));

    await act(async () => {
      await result.current[2].cancel();
    });

    await waitFor(() => {
      expect(result.current[1]).toEqual({
        validating: false,
        canCancel: false,
        canRetry: true,
      });
    });
  });

  test('should retry', async () => {
    model.getLayout = jest.fn().mockReturnValue(new Promise(() => {}));
    let result;
    ({ result } = renderHook(() => useRpc(model, 'getLayout')));
    await act(async () => {
      result.current[2].cancel();
    });
    ({ result } = renderHook(() => useRpc(model, 'getLayout')));
    model.getLayout = jest.fn().mockReturnValue({ success: true });
    await act(async () => {
      result.current[2].retry();
    });
    ({ result } = renderHook(() => useRpc(model, 'getLayout')));
    await waitFor(() => {
      expect(result.current[0]).toEqual({ success: true });
      expect(result.current[1]).toEqual({ validating: false, canCancel: false, canRetry: false });
    });
  });
});
