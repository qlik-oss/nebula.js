import React from 'react';
import { create, act } from 'react-test-renderer';
import { IconButton } from '@material-ui/core';

const SvgIcon = () => 'svgicon';

const [{ default: ActionsToolbarItem }] = aw.mock(
  [
    [
      require.resolve('@nebula.js/ui/theme'),
      () => ({
        makeStyles: () => () => ({ icon: 'icon' }),
        useTheme: () => ({ spacing: () => 0, palette: { btn: { active: 'pink' } } }),
      }),
    ],
    [require.resolve('@nebula.js/ui/icons/SvgIcon'), () => SvgIcon],
  ],
  ['../ActionsToolbarItem']
);

describe.skip('<ActionsToolbarItem />', () => {
  let sandbox;
  let renderer;
  let render;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    render = async (item, addAnchor = false) => {
      await act(async () => {
        renderer = create(<ActionsToolbarItem item={item} addAnchor={addAnchor} />);
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
    const item = renderer.root.findByType(IconButton);
    item.props.onClick();
    expect(action.callCount).to.equal(1);
  });

  it('should render button', async () => {
    const action = sandbox.spy();
    await render({ label: 'foo', action });
    const item = renderer.root.findByType(IconButton);
    expect(item.props).to.containSubset({
      title: 'foo',
      style: {
        backgroundColor: undefined,
      },
      disabled: false,
    });
    item.props.onClick();
    expect(action.callCount).to.equal(1);
  });

  it('should render button with svg icon', async () => {
    const getSvgIconShape = sandbox.spy();
    await render({ label: 'foo', getSvgIconShape });
    const item = renderer.root.findByType(IconButton);
    expect(item.props.children).to.eql(['svgicon', false]);
  });

  it('should render active icon button', async () => {
    const action = sandbox.spy();
    await render({ label: 'foo', action, active: true });
    const item = renderer.root.findByType(IconButton);
    expect(item.props).to.containSubset({
      title: 'foo',
      style: {
        backgroundColor: 'pink',
      },
    });
    item.props.onClick();
    expect(action.callCount).to.equal(1);
  });

  it('should not render if hidden', async () => {
    const action = sandbox.spy();
    await render({ label: 'foo', action, hidden: true });
    expect(() => renderer.root.findByType(IconButton)).to.throw();
  });

  it('should render anchor', async () => {
    const action = sandbox.spy();
    await render({ label: 'foo', action }, true);
    const anchor = renderer.root.findByType('div');
    expect(anchor.props).to.eql({
      style: {
        bottom: -0,
        right: 0,
        position: 'absolute',
        width: '100%',
        height: 0,
      },
    });
  });
});
