import React from 'react';
import { create, act } from 'react-test-renderer';
import { IconButton } from '@material-ui/core';
// const SelectionToolbarItem = () => 'selectiontoolbaritem';
const InstanceContext = React.createContext();

const [{ default: SelectionToolbarWithDefault }] = aw.mock(
  [
    // [require.resolve('../SelectionToolbarItem'), () => SelectionToolbarItem],
    [
      require.resolve('@nebula.js/ui/theme'),
      () => ({
        makeStyles: () => () => ({ pallette: {} }),
        useTheme: () => ({}),
      }),
    ],
    [require.resolve('../../contexts/InstanceContext'), () => InstanceContext],
  ],
  ['../SelectionToolbar']
);

describe('<SelectionToolbarWithDefault />', () => {
  let sandbox;
  let renderer;
  let render;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    render = async (api, xItems, onCancel, onConfirm) => {
      await act(async () => {
        renderer = create(
          <InstanceContext.Provider value={{ translator: { get: s => s } }}>
            <SelectionToolbarWithDefault api={api} xItems={xItems} onCancel={onCancel} onConfirm={onConfirm} />
          </InstanceContext.Provider>
        );
      });
    };
  });
  afterEach(() => {
    sandbox.restore();
    renderer.unmount();
  });
  it('should render default', async () => {
    const api = {
      canClear: sandbox.stub(),
      clear: sandbox.stub(),
      canCancel: sandbox.stub(),
      cancel: sandbox.stub(),
      canConfirm: sandbox.stub(),
      confirm: sandbox.stub(),
    };
    await render(api);
    expect(api.canClear.callCount).to.equal(1);
    expect(api.canCancel.callCount).to.equal(1);
    expect(api.canConfirm.callCount).to.equal(1);
    const types = renderer.root.findAllByType(IconButton);
    expect(types).to.have.length(3);
  });
  it('should confirm', async () => {
    const api = {
      canClear: sandbox.stub(),
      clear: sandbox.stub(),
      canCancel: sandbox.stub(),
      cancel: sandbox.stub(),
      canConfirm: sandbox.stub(),
      confirm: sandbox.stub(),
    };
    const onConfirm = sandbox.spy();
    await render(api, [], undefined, onConfirm);
    expect(api.canClear.callCount).to.equal(1);
    expect(api.canCancel.callCount).to.equal(1);
    expect(api.canConfirm.callCount).to.equal(1);
    const confirm = renderer.root.findByProps({ title: 'Selection.Confirm' });
    confirm.props.onClick();
    expect(api.confirm.callCount).to.equal(1);
    expect(onConfirm.callCount).to.equal(1);
  });
  it('should cancel', async () => {
    const api = {
      canClear: sandbox.stub(),
      clear: sandbox.stub(),
      canCancel: sandbox.stub(),
      cancel: sandbox.stub(),
      canConfirm: sandbox.stub(),
      confirm: sandbox.stub(),
    };
    const onCancel = sandbox.spy();
    await render(api, [], onCancel);
    expect(api.canClear.callCount).to.equal(1);
    expect(api.canCancel.callCount).to.equal(1);
    expect(api.canConfirm.callCount).to.equal(1);
    const confirm = renderer.root.findByProps({ title: 'Selection.Cancel' });
    confirm.props.onClick();
    expect(api.cancel.callCount).to.equal(1);
    expect(onCancel.callCount).to.equal(1);
  });
  it('should clear', async () => {
    const api = {
      canClear: sandbox.stub(),
      clear: sandbox.stub(),
      canCancel: sandbox.stub(),
      cancel: sandbox.stub(),
      canConfirm: sandbox.stub(),
      confirm: sandbox.stub(),
    };
    await render(api);
    expect(api.canClear.callCount).to.equal(1);
    expect(api.canCancel.callCount).to.equal(1);
    expect(api.canConfirm.callCount).to.equal(1);
    const confirm = renderer.root.findByProps({ title: 'Selection.Clear' });
    confirm.props.onClick();
    expect(api.clear.callCount).to.equal(1);
  });
});
