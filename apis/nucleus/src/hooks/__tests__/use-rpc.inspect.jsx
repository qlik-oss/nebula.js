import React, { forwardRef, useImperativeHandle } from 'react';
import { create, act } from 'react-test-renderer';

import useRpc from '../useRpc';
import { rpcRequestStore } from '../../stores/model-store';

const TestHook = forwardRef(({ hook, hookProps }, ref) => {
  const result = hook(...hookProps);
  useImperativeHandle(ref, () => ({
    result,
  }));
  return null;
});

describe('useRpc', () => {
  let renderer;
  let render;
  let ref;
  let model;

  beforeEach(() => {
    ref = React.createRef();
    model = {
      id: 'useRpc',
      getLayout: jest.fn().mockReturnValue({ foo: 'bar' }),
      session: {
        getObjectApi: jest.fn().mockReturnValue({ cancelRequest: jest.fn() }),
      },
    };
    render = async (hook, ...hookProps) => {
      await act(async () => {
        renderer = create(<TestHook ref={ref} hook={hook} hookProps={hookProps} />);
      });
    };
  });

  afterEach(() => {
    renderer.unmount();
    rpcRequestStore.clear('useRpc');
  });

  test('should call method', async () => {
    await render(useRpc, model, 'getLayout');
    expect(model.getLayout).toHaveBeenCalledTimes(1);
  });

  test('should set result', async () => {
    await render(useRpc, model, 'getLayout');
    expect(ref.current.result[0]).toEqual({ foo: 'bar' });
    expect(ref.current.result[1]).toEqual({ validating: false, canCancel: false, canRetry: false });
  });

  test('should cache result', async () => {
    await render(useRpc, model, 'getLayout');
    expect(model.getLayout).toHaveBeenCalledTimes(1);
    await render(useRpc, model, 'getLayout');
    await render(useRpc, model, 'getLayout');
    await render(useRpc, model, 'getLayout');
    expect(model.getLayout).toHaveBeenCalledTimes(1);
  });

  test('should dispatch invalid', async () => {
    model.getLayout = jest.fn().mockResolvedValue(new Promise(() => {}));
    await render(useRpc, model, 'getLayout');
    expect(ref.current.result[1]).toEqual({ validating: true, canCancel: true, canRetry: false });
  });

  test('should dispatch cancelled', async () => {
    await render(useRpc, model, 'getLayout');
    await act(async () => ref.current.result[2].cancel());
    expect(ref.current.result[0]).toEqual({ foo: 'bar' });
    expect(ref.current.result[1]).toEqual({
      validating: false,
      canCancel: false,
      canRetry: true,
    });
  });

  test('should retry', async () => {
    model.getLayout = jest.fn().mockReturnValue(new Promise(() => {}));
    await render(useRpc, model, 'getLayout');
    act(() => {
      ref.current.result[2].cancel();
    });
    await render(useRpc, model, 'getLayout');
    model.getLayout = jest.fn().mockReturnValue({ success: true });
    act(() => {
      ref.current.result[2].retry();
    });
    await render(useRpc, model, 'getLayout');
    expect(ref.current.result[0]).toEqual({ success: true });
    expect(ref.current.result[1]).toEqual({ validating: false, canCancel: false, canRetry: false });
  });
});
