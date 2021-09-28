/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { create, act } from 'react-test-renderer';
import { MenuList, MenuItem, ListItemIcon, Typography } from '@mui/material';

import makeStyles from '@mui/styles/makeStyles';

const Popover = (p) => p.children;
const SvgIconMock = '<div>/div>';

const [{ default: ActionsToolbarMore }] = aw.mock(
  [
    [require.resolve('@nebula.js/ui/icons/SvgIcon'), () => () => SvgIconMock],
    [
      require.resolve('@mui/material'),
      () => ({
        makeStyles,
        MenuList,
        MenuItem,
        ListItemIcon,
        Typography,
        Popover,
      }),
    ],
  ],
  ['../ActionsToolbarMore']
);

describe('<ActionsToolbarMore />', () => {
  let sandbox;
  let renderer;
  let render;
  let alignTo;
  let onCloseOrActionClick;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    onCloseOrActionClick = sandbox.spy();
    alignTo = {
      current: {},
    };
    render = async (props) => {
      await act(async () => {
        renderer = create(<ActionsToolbarMore {...props} />);
      });
    };
  });
  afterEach(() => {
    sandbox.restore();
    renderer.unmount();
  });

  it('should render default', async () => {
    await render();
    expect(renderer.root.props).to.be.empty;
  });

  it('should render actions', async () => {
    const actions = [1, 2, 3, 4, 5].map((key) => ({
      key,
      enabled: true,
      action: sandbox.spy(),
    }));
    await render({ actions, alignTo });
    const items = renderer.root.findAllByType(MenuItem);
    expect(items).to.have.length(5);
  });

  it('should render svg icon', async () => {
    const item = {
      key: 'svg',
      enabled: true,
      action: sandbox.spy(),
      getSvgIconShape: () => 'svg',
    };
    const actions = [item];
    await render({ actions, alignTo });
    const lii = renderer.root.findByType(ListItemIcon);
    expect(lii.props.children).to.equal(SvgIconMock);
  });

  it('should not render hidden actions', async () => {
    const actions = [1, 2, 3, 4, 5].map((key) => ({
      key,
      enabled: true,
      action: sandbox.spy(),
      hidden: key % 2 === 0,
    }));
    await render({ actions, alignTo });
    const items = renderer.root.findAllByType(MenuItem);
    expect(items).to.have.length(3);
  });

  it('should handle action click and trigger callback', async () => {
    const item = {
      key: 1,
      enabled: true,
      action: sandbox.spy(),
    };
    const actions = [item];
    await render({ actions, alignTo, onCloseOrActionClick });
    const mi = renderer.root.findByType(MenuItem);
    mi.props.onClick();
    expect(item.action).to.have.been.calledWithExactly();
    expect(onCloseOrActionClick).to.have.been.calledWithExactly();
  });

  it('should handle action click with default callback', async () => {
    const item = {
      key: 1,
      enabled: true,
      action: sandbox.spy(),
    };
    const actions = [item];
    await render({ actions, alignTo });
    const mi = renderer.root.findByType(MenuItem);
    mi.props.onClick();
    expect(item.action).to.have.been.calledWithExactly();
  });
});
