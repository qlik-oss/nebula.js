import React, { forwardRef, useImperativeHandle } from 'react';
import { create, act } from 'react-test-renderer';

const TestHook = forwardRef(({ hook, hookProps }, ref) => {
  const result = hook(...hookProps);
  useImperativeHandle(ref, () => ({
    result,
  }));
  return null;
});

describe('useExistingModel', () => {
  let sandbox;
  let useExistingModel;
  let useModelStoreMock;
  let app;
  let setMock;
  let getMock;
  let renderer;
  let render;
  let ref;

  beforeEach(() => {
    sandbox = sinon.createSandbox({ useFakeTimers: true });

    setMock = sandbox.stub();
    getMock = sandbox.stub();
    app = {
      getObject: sandbox.stub().resolves({ id: 'generic-id' }),
    };
    useModelStoreMock = sandbox.stub().returns([
      {
        set: setMock,
        get: getMock,
      },
    ]);

    [{ default: useExistingModel }] = aw.mock(
      [
        [
          require.resolve('../../../../stores/model-store'),
          () => ({
            useModelStore: useModelStoreMock,
          }),
        ],
      ],
      ['../useExistingModel']
    );

    ref = React.createRef();
    render = async (hook, ...hookProps) => {
      await act(async () => {
        renderer = create(<TestHook ref={ref} hook={hook} hookProps={hookProps} />);
      });
    };
  });

  afterEach(() => {
    sandbox.reset();
    renderer.unmount();
  });

  it('providing a qId should give a model fetched from the app', async () => {
    await render(useExistingModel, { app, qId: 'generic-id' });
    expect(getMock).to.have.been.calledWith('generic-id');
    expect(setMock).to.have.been.calledWith('generic-id', { id: 'generic-id' });
    expect(ref.current.result).to.deep.equal({ id: 'generic-id' });
  });

  it('providing sessionModel should simply use that model', async () => {
    await render(useExistingModel, { options: { sessionModel: { id: 'session-model' } } });
    expect(ref.current.result).to.deep.equal({ id: 'session-model' });
  });
});
