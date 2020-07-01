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
  let sandbox;
  let renderer;
  let render;
  let ref;
  let model;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    ref = React.createRef();
    model = {
      id: 'useRpc',
      getLayout: sandbox.stub().returns({ foo: 'bar' }),
      session: {
        getObjectApi: sandbox.stub().returns({ cancelRequest: sandbox.stub() }),
      },
    };
    render = async (hook, ...hookProps) => {
      await act(async () => {
        renderer = create(<TestHook ref={ref} hook={hook} hookProps={hookProps} />);
      });
    };
  });
  afterEach(() => {
    sandbox.restore();
    renderer.unmount();
    rpcRequestStore.clear('useRpc');
  });

  it('should call method', async () => {
    await render(useRpc, model, 'getLayout');
    expect(model.getLayout.callCount).to.equal(1);
  });

  it('should set result', async () => {
    await render(useRpc, model, 'getLayout');
    expect(ref.current.result[0]).to.deep.equal({ foo: 'bar' });
    expect(ref.current.result[1]).to.deep.equal({ validating: false, canCancel: false, canRetry: false });
  });

  it('should cache result', async () => {
    await render(useRpc, model, 'getLayout');
    expect(model.getLayout.callCount).to.equal(1);
    await render(useRpc, model, 'getLayout');
    await render(useRpc, model, 'getLayout');
    await render(useRpc, model, 'getLayout');
    expect(model.getLayout.callCount).to.equal(1);
  });

  it('should dispatch invalid', async () => {
    model.getLayout = sandbox.stub().returns(new Promise(() => {}));
    await render(useRpc, model, 'getLayout');
    expect(ref.current.result[1]).to.deep.equal({ validating: true, canCancel: true, canRetry: false });
  });

  it('should dispatch cancelled', async () => {
    await render(useRpc, model, 'getLayout');
    await act(async () => ref.current.result[2].cancel());
    expect(ref.current.result[0]).to.deep.equal({ foo: 'bar' });
    expect(ref.current.result[1]).to.deep.equal({
      validating: false,
      canCancel: false,
      canRetry: true,
    });
  });

  it('should retry', async () => {
    model.getLayout = sandbox.stub().returns(new Promise(() => {}));
    await render(useRpc, model, 'getLayout');
    ref.current.result[2].cancel();
    await render(useRpc, model, 'getLayout');
    model.getLayout = sandbox.stub().returns({ success: true });
    ref.current.result[2].retry();
    await render(useRpc, model, 'getLayout');
    expect(ref.current.result[0]).to.deep.equal({ success: true });
    expect(ref.current.result[1]).to.deep.equal({ validating: false, canCancel: false, canRetry: false });
  });
});
