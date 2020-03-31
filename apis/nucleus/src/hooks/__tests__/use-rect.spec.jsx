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
  let sandbox;
  let addEventListener;
  let removeEventListener;
  let renderer;
  let render;
  let ref;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    addEventListener = sandbox.spy();
    removeEventListener = sandbox.spy();
    global.window = {
      addEventListener,
      removeEventListener,
    };
    ref = React.createRef();
    render = async (rendererOptions = null) => {
      await act(async () => {
        renderer = create(<TestHook ref={ref} hook={useRect} />, rendererOptions);
      });
    };
  });
  afterEach(() => {
    sandbox.restore();
    renderer.unmount();
    delete global.window;
  });

  it('should set rect', async () => {
    await render();
    ref.current.result[0].current = {
      getBoundingClientRect: () => ({ left: 100, top: 200, width: 300, height: 400 }),
    };
    renderer.update(<TestHook ref={ref} hook={useRect} />);
    await act(async () => {
      global.window.addEventListener.callArg(1);
    });
    expect(ref.current.result[1]).to.deep.equal({ left: 100, top: 200, width: 300, height: 400 });
  });

  it('should cleanup listeners', async () => {
    await render();
    ref.current.result[0].current = {
      getBoundingClientRect: () => ({ left: 100, top: 200, width: 300, height: 400 }),
    };
    renderer.update(<TestHook ref={ref} hook={useRect} />);
    renderer.unmount();
    expect(removeEventListener.callCount).to.equal(1);
  });
});
describe('useRect - resize observer', () => {
  let sandbox;
  let observer;
  let handleResize;
  let renderer;
  let render;
  let ref;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    observer = {
      observe: sandbox.spy(),
      unobserve: sandbox.spy(),
      disconnect: sandbox.spy(),
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
    sandbox.restore();
    renderer.unmount();
    delete global.ResizeObserver;
  });

  it('should set rect', async () => {
    await render();
    ref.current.result[0].current = {
      getBoundingClientRect: () => ({ left: 100, top: 200, width: 300, height: 400 }),
    };
    renderer.update(<TestHook ref={ref} hook={useRect} />);
    handleResize();
    expect(ref.current.result[1]).to.deep.equal({ left: 100, top: 200, width: 300, height: 400 });
  });

  it('should cleanup listeners', async () => {
    await render();
    ref.current.result[0].current = {
      getBoundingClientRect: () => ({ left: 100, top: 200, width: 300, height: 400 }),
    };
    renderer.update(<TestHook ref={ref} hook={useRect} />);
    renderer.unmount();
    expect(observer.unobserve.callCount).to.equal(1);
    expect(observer.disconnect.callCount).to.equal(1);
  });
});
