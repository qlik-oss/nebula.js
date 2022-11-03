import React, { forwardRef, useImperativeHandle } from 'react';
import { create, act } from 'react-test-renderer';

const TestHook = forwardRef(({ hook, hookProps }, ref) => {
  const result = hook(...hookProps);
  useImperativeHandle(ref, () => ({
    result,
  }));
  return null;
});

describe('useClickOutside', () => {
  let sandbox;
  let useClickOutside;
  let render;
  let renderer;
  let ref;

  beforeEach(() => {
    sandbox = sinon.createSandbox({ useFakeTimers: true });

    [{ default: useClickOutside }] = aw.mock([], ['../useClickOutside']);

    render = async (hook, ...hookProps) => {
      await act(async () => {
        renderer = create(<TestHook ref={ref} hook={hook} hookProps={hookProps} />);
      });
    };

    global.document = {
      contains: () => true,
      addEventListener: sandbox.stub(),
      removeEventListener: sandbox.stub(),
    };
  });

  afterEach(() => {
    sandbox.reset();
    renderer.unmount();
  });

  it('should trigger the listener sent in on click outside', async () => {
    // test initial states
    const element = {
      contains: sandbox.stub().returns(false),
    };
    const props = {
      elements: element,
      handler: sandbox.stub(),
    };
    await render(useClickOutside, props);
    expect(global.document.addEventListener).calledOnce;
    const [args] = global.document.addEventListener.args;
    expect(args[0]).to.equal('mousedown');
    const argHandler = args[1];
    const target = 'target';

    expect(props.handler).not.called;
    argHandler({ target });
    expect(props.handler).calledOnce.calledWithExactly({ target });

    // test unmount
    expect(global.document.removeEventListener).not.called;
    await act(() => {
      renderer.unmount();
    });
    expect(global.document.removeEventListener).calledOnce;
    const [rArgs] = global.document.removeEventListener.args;
    expect(rArgs[0]).to.equal('mousedown');
  });

  it('should not trigger the listener when clicking within the element', async () => {
    const element = {
      current: {
        contains: sandbox.stub().returns(true),
      },
    };
    const props = {
      elements: element,
      handler: sandbox.stub(),
    };
    await render(useClickOutside, props);
    const [args0] = global.document.addEventListener.args;
    const argHandler = args0[1];
    const target = 'target';

    expect(props.handler).not.called;
    argHandler({ target });
    expect(props.handler, 'since we click inside (contains returns true)').not.called;
  });

  it('should not be fooled to think that a click is outside when it in fact has been removed from the DOM', async () => {
    global.document.contains = () => false; // simulate element removed from DOM

    const element = {
      current: {
        contains: sandbox.stub().returns(false),
      },
    };
    const props = {
      elements: element,
      handler: sandbox.stub(),
    };
    await render(useClickOutside, props);
    const [args0] = global.document.addEventListener.args;
    const argHandler = args0[1];
    const target = 'target';

    expect(props.handler).not.called;
    argHandler({ target });
    expect(props.handler).not.called;
  });
});
