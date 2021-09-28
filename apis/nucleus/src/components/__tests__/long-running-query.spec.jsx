import React from 'react';
import { create, act } from 'react-test-renderer';
import { Grid, Button } from '@mui/material';

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
  let api;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    api = {
      cancel: sandbox.spy(),
      retry: sandbox.spy(),
    };
    render = async (canCancel, canRetry) => {
      await act(async () => {
        renderer = create(
          <InstanceContext.Provider value={{ translator: { get: (s) => s } }}>
            <LongRunningQuery canCancel={canCancel} canRetry={canRetry} api={api} />
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
    const canCancel = true;
    await render(canCancel);
    const types = renderer.root.findAllByType(Cancel);
    expect(types).to.have.length(1);
    const p = renderer.root.findAllByType(Progress);
    expect(p).to.have.length(1);
    const cancelBtn = renderer.root.findByType(Button);
    cancelBtn.props.onClick();
    expect(api.cancel.callCount).to.equal(1);
  });
  it('should handle retry', async () => {
    const canRetry = true;
    await render(undefined, canRetry);
    const types = renderer.root.findAllByType(Retry);
    expect(types).to.have.length(1);
    const p = renderer.root.findAllByType(Progress);
    expect(p).to.have.length(0);
    const retryBtn = renderer.root.findByType(Button);
    retryBtn.props.onClick();
    expect(api.retry.callCount).to.equal(1);
  });
});
