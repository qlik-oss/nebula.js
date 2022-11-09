import React, { forwardRef, useImperativeHandle } from 'react';
import { create, act } from 'react-test-renderer';

import useRect from '../useRect';

const TestHook = forwardRef(({ hook, hookProps = [] }, ref) => {
  const result = hook(...hookProps);
  useImperativeHandle(ref, () => ({
    result,
  }));
  return null;
});

describe('useRect - window resize', () => {
  let addEventListener;
  let removeEventListener;
  let windowSpy;
  let renderer;
  let render;
  let ref;
  beforeEach(() => {
    windowSpy = jest.spyOn(window, 'window', 'get');
    addEventListener = jest.fn();
    removeEventListener = jest.fn();
    windowSpy.mockImplementation(() => ({
      addEventListener,
      removeEventListener,
    }));

    ref = React.createRef();
    render = async (rendererOptions = null) => {
      await act(async () => {
        renderer = create(<TestHook ref={ref} hook={useRect} />, rendererOptions);
      });
    };
  });

  afterEach(() => {
    windowSpy.mockRestore();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should set initial rect', async () => {
    await render();
    act(() => {
      ref.current.result[0]({
        getBoundingClientRect: () => ({ left: 100, top: 200, width: 300, height: 400 }),
      });
    });
    expect(ref.current.result[1]).toEqual({ left: 100, top: 200, width: 300, height: 400 });
  });

  test('should set rect', async () => {
    await render();

    const resizeEvent = new Event('resize');
    dispatchEvent(resizeEvent);

    act(() => {
      ref.current.result[0]({
        getBoundingClientRect: () => ({ left: 100, top: 200, width: 300, height: 400 }),
      });
    });

    expect(addEventListener).toHaveBeenCalledTimes(1);
    expect(ref.current.result[1]).toEqual({ left: 100, top: 200, width: 300, height: 400 });
  });

  test('should cleanup listeners', async () => {
    await render();
    act(() => {
      ref.current.result[0]({
        getBoundingClientRect: () => ({ left: 100, top: 200, width: 300, height: 400 }),
      });
    });
    renderer.unmount();
    expect(removeEventListener).toHaveBeenCalledTimes(1);
  });
});

describe('useRect - resize observer', () => {
  let observer;
  let handleResize;
  let renderer;
  let render;
  let ref;

  beforeEach(() => {
    observer = {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    };
    global.ResizeObserver = function Mock(fn) {
      handleResize = fn;
      return observer;
    };

    ref = React.createRef();
    render = async (rendererOptions = null) => {
      await act(async () => {
        renderer = create(<TestHook ref={ref} hook={useRect} />, rendererOptions);
      });
    };
  });
  afterEach(() => {
    renderer.unmount();
  });

  test('should set rect', async () => {
    await render();

    act(() => {
      ref.current.result[0]({
        getBoundingClientRect: () => ({ left: 100, top: 200, width: 300, height: 400 }),
      });
    });

    act(() => {
      handleResize();
    });
    expect(ref.current.result[1]).toEqual({ left: 100, top: 200, width: 300, height: 400 });
  });

  test('should cleanup listeners', async () => {
    await render();
    act(() => {
      ref.current.result[0]({
        getBoundingClientRect: () => ({ left: 100, top: 200, width: 300, height: 400 }),
      });
    });

    renderer.unmount();

    expect(observer.unobserve).toHaveBeenCalledTimes(1);
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });
});
