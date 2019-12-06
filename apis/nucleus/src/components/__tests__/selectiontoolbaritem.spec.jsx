import React from 'react';
import { create, act } from 'react-test-renderer';
import { IconButton, Button, MenuItem } from '@material-ui/core';

const SvgIcon = () => 'svgicon';

const [{ default: SelectionToolbarItem }] = aw.mock(
  [
    [require.resolve('@nebula.js/ui/theme'), () => ({ makeStyles: () => () => ({ icon: 'icon' }) })],
    [require.resolve('@nebula.js/ui/icons/SvgIcon'), () => SvgIcon],
  ],
  ['../SelectionToolbarItem']
);

describe('<SelectionToolbarItem />', () => {
  let sandbox;
  let renderer;
  let render;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    render = async (item, layout) => {
      await act(async () => {
        renderer = create(<SelectionToolbarItem item={item} layout={layout} />);
      });
    };
  });
  afterEach(() => {
    sandbox.restore();
    renderer.unmount();
  });
  it('should render default', async () => {
    const action = sandbox.spy();
    await render({ action });
    const types = renderer.root.findAllByType(IconButton);
    expect(types).to.have.length(1);
    types[0].props.onClick();
    expect(action.callCount).to.equal(1);
  });
  it('should listen on changed', async () => {
    const action = sandbox.spy();
    const getSvgIconShape = sandbox.spy();
    const on = sandbox.spy();
    const removeListener = sandbox.spy();
    const enabled = sandbox.stub().returns(true);
    await render({ on, removeListener, action, enabled, getSvgIconShape });
    const types = renderer.root.findAllByType(IconButton);
    expect(types).to.have.length(1);
    expect(types[0].props.disabled).to.equal(false);
    enabled.returns(false);
    on.callArg(1);
    expect(types[0].props.disabled).to.equal(true);
  });
  it('should render button', async () => {
    const action = sandbox.spy();
    await render({ type: 'button', label: 'foo', color: 'purple', action });
    const types = renderer.root.findAllByType(Button);
    expect(types).to.have.length(1);
    expect(types[0].props).to.containSubset({
      title: 'foo',
      variant: 'contained',
      style: {
        backgroundColor: 'purple',
      },
    });
    types[0].props.onClick();
    expect(action.callCount).to.equal(1);
  });
  it('should render button with svg icon', async () => {
    const getSvgIconShape = sandbox.spy();
    await render({ type: 'button', label: 'foo', color: 'purple', getSvgIconShape });
    const types = renderer.root.findAllByType(Button);
    expect(types[0].props.children).to.equal('svgicon');
  });
  it('should render menu icon button', async () => {
    const action = sandbox.spy();
    await render({ type: 'menu-icon-button', action });
    const types = renderer.root.findAllByType(MenuItem);
    expect(types).to.have.length(1);
    types[0].props.onClick();
    expect(action.callCount).to.equal(1);
  });
});
