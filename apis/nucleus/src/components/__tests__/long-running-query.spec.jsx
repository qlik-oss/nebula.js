import React from 'react';
import { create, act } from 'react-test-renderer';
import { Grid, Button } from '@material-ui/core';

const Progress = () => 'progress';
const InstanceContext = React.createContext();

const [{ default: LongRunningQuery, Cancel, Retry }] = aw.mock(
  [
    [require.resolve('../Progress'), () => Progress],
    [require.resolve('../../contexts/InstanceContext'), () => InstanceContext],
  ],
  ['../LongRunningQuery']
);

describe('<LongRunningQuery />', () => {
  let sandbox;
  let renderer;
  let render;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    render = async (onCancel, onRetry) => {
      await act(async () => {
        renderer = create(
          <InstanceContext.Provider value={{ translator: { get: s => s } }}>
            <LongRunningQuery onCancel={onCancel} onRetry={onRetry} />
          </InstanceContext.Provider>
        );
      });
    };
  });
  afterEach(() => {
    sandbox.restore();
    renderer.unmount();
  });
  it('should render', async () => {
    await render();
    const types = renderer.root.findAllByType(Grid);
    expect(types).to.have.length(1);
  });
  it('should handle cancel', async () => {
    const onCancel = sandbox.spy();
    await render(onCancel);
    const types = renderer.root.findAllByType(Cancel);
    expect(types).to.have.length(1);
    let p = renderer.root.findAllByType(Progress);
    expect(p).to.have.length(1);
    const cancelBtn = renderer.root.findByType(Button);
    cancelBtn.props.onClick();
    p = renderer.root.findAllByType(Progress);
    expect(p).to.have.length(0);
  });
  it('should handle retry', async () => {
    const onRetry = sandbox.spy();
    await render(undefined, onRetry);
    const types = renderer.root.findAllByType(Retry);
    expect(types).to.have.length(1);
    let p = renderer.root.findAllByType(Progress);
    expect(p).to.have.length(0);
    const retryBtn = renderer.root.findByType(Button);
    retryBtn.props.onClick();
    p = renderer.root.findAllByType(Progress);
    expect(p).to.have.length(1);
  });
});
