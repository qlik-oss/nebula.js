/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { create, act } from 'react-test-renderer';
import { MenuItem, ListItemIcon } from '@mui/material';
import * as SVGIconModule from '@nebula.js/ui/icons/SvgIcon';
import ActionsToolbarMore from '../ActionsToolbarMore';

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Popover: (p) => p.children,
}));

const SvgIconMock = '<div>/div>';

describe('<ActionsToolbarMore />', () => {
  let renderer;
  let render;
  let alignTo;
  let onCloseOrActionClick;

  beforeEach(() => {
    jest.spyOn(SVGIconModule, 'default').mockReturnValue(SvgIconMock);
    onCloseOrActionClick = jest.fn();
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
    renderer.unmount();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should render default', async () => {
    await render();
    expect(Object.entries(renderer.root.props).length).toBe(0);
  });

  test('should render actions', async () => {
    const actions = [1, 2, 3, 4, 5].map((key) => ({
      key,
      enabled: true,
      action: jest.fn(),
    }));
    await render({ actions, alignTo });
    const items = renderer.root.findAllByType(MenuItem);
    expect(items.length).toBe(5);
  });

  test('should render svg icon', async () => {
    const item = {
      key: 'svg',
      enabled: true,
      action: jest.fn(),
      getSvgIconShape: () => 'svg',
    };
    const actions = [item];
    await render({ actions, alignTo });
    const lii = renderer.root.findByType(ListItemIcon);
    expect(lii.props.children).toEqual(SvgIconMock);
  });

  test('should not render hidden actions', async () => {
    const actions = [1, 2, 3, 4, 5].map((key) => ({
      key,
      enabled: true,
      action: jest.fn(),
      hidden: key % 2 === 0,
    }));
    await render({ actions, alignTo });
    const items = renderer.root.findAllByType(MenuItem);
    expect(items.length).toBe(3);
  });

  test('should handle action click and trigger callback', async () => {
    const item = {
      key: 1,
      enabled: true,
      action: jest.fn(),
    };
    const actions = [item];
    await render({ actions, alignTo, onCloseOrActionClick });
    const mi = renderer.root.findByType(MenuItem);
    const someEvtObject = { someEvt: '#someEvt' };
    mi.props.onClick(someEvtObject);
    expect(item.action).toHaveBeenCalledWith();
    expect(onCloseOrActionClick).toHaveBeenCalledWith(someEvtObject);
  });

  test('should handle action click with default callback', async () => {
    const item = {
      key: 1,
      enabled: true,
      action: jest.fn(),
    };
    const actions = [item];
    await render({ actions, alignTo });
    const mi = renderer.root.findByType(MenuItem);
    mi.props.onClick();
    expect(item.action).toHaveBeenCalledWith();
  });
});
