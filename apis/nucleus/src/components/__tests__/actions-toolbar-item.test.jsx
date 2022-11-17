import React from 'react';
import { create, act } from 'react-test-renderer';
import { IconButton } from '@mui/material';
import * as SVGIconModule from '@nebula.js/ui/icons/SvgIcon';
import ActionsToolbarItem from '../ActionsToolbarItem';

const nebulaUIThemeModule = require('@nebula.js/ui/theme');

jest.mock('@nebula.js/ui/theme', () => ({ ...jest.requireActual('@nebula.js/ui/theme') }));

describe('<ActionsToolbarItem />', () => {
  let renderer;
  let render;
  beforeEach(() => {
    // if spied function is a getter -> you need to use jest.mock(...)
    // and spread jest.requireActual(<MODULE>) in order to mock it
    // check here: https://github.com/facebook/jest/issues/6914#issue-355205927
    jest
      .spyOn(nebulaUIThemeModule, 'useTheme')
      .mockImplementation(() => ({ spacing: () => 0, palette: { btn: { active: 'pink' } } }));
    jest.spyOn(SVGIconModule, 'default').mockReturnValue('svgicon');
    render = async (item, addAnchor = false) => {
      await act(async () => {
        renderer = create(<ActionsToolbarItem item={item} addAnchor={addAnchor} />);
      });
    };
  });
  afterEach(() => {
    renderer.unmount();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should render default', async () => {
    const action = jest.fn();
    await render({ action });
    const item = renderer.root.findByType(IconButton);
    item.props.onClick();
    expect(action).toHaveBeenCalledTimes(1);
  });

  test('should render button', async () => {
    const action = jest.fn();
    await render({ label: 'foo', action });
    const item = renderer.root.findByType(IconButton);
    expect(item.props).toMatchObject({
      title: 'foo',
      style: {
        backgroundColor: undefined,
      },
      disabled: false,
    });
    item.props.onClick();
    expect(action).toHaveBeenCalledTimes(1);
  });

  test('should render button with svg icon', async () => {
    const getSvgIconShape = jest.fn();
    await render({ label: 'foo', getSvgIconShape });
    const item = renderer.root.findByType(IconButton);
    expect(item.props.children).toEqual(['svgicon', false]);
  });

  test('should render active icon button', async () => {
    const action = jest.fn();
    await render({ label: 'foo', action, active: true });
    const item = renderer.root.findByType(IconButton);
    expect(item.props).toMatchObject({
      title: 'foo',
      style: {
        backgroundColor: 'pink',
      },
    });
    item.props.onClick();
    expect(action).toHaveBeenCalledTimes(1);
  });

  test('should not render if hidden', async () => {
    const action = jest.fn();
    await render({ label: 'foo', action, hidden: true });
    expect(() => renderer.root.findByType(IconButton)).toThrow();
  });

  test('should render anchor', async () => {
    const action = jest.fn();
    await render({ label: 'foo', action }, true);
    const anchor = renderer.root.findByType('div');
    expect(anchor.props).toEqual({
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
