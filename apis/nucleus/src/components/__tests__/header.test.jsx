/* eslint-disable no-import-assign */
import React from 'react';
import { create, act } from 'react-test-renderer';
import { Typography } from '@mui/material';
import Header from '../Header';
import * as ActionsToolbarModule from '../ActionsToolbar';
import * as useRectModule from '../../hooks/useRect';

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Popover: (p) => p.children,
}));

describe('<Header />', () => {
  let renderer;
  let render;
  let rect;
  let ActionsToolbar;

  beforeEach(() => {
    rect = { width: 900 };
    ActionsToolbar = jest.fn().mockReturnValue('ActionsToolbar');
    jest.spyOn(useRectModule, 'default').mockImplementation(() => [() => {}, rect]);
    ActionsToolbarModule.default = ActionsToolbar;

    render = async (layout = {}, sn = { component: {}, selectionToolbar: {} }, focusHandler = {}) => {
      await act(async () => {
        renderer = create(<Header layout={layout} sn={sn} focusHandler={focusHandler} />);
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
    const types = renderer.root.findAllByType(Typography);
    expect(types).toHaveLength(0);
  });
  test('should render title', async () => {
    await render({ showTitles: true, title: 'foo' });
    const types = renderer.root.findAllByType(Typography);
    expect(types).toHaveLength(1);
    expect(types[0].props.children).toBe('foo');
  });
  test('should render subtitle', async () => {
    await render({ showTitles: true, subtitle: 'bar' });
    const types = renderer.root.findAllByType(Typography);
    expect(types).toHaveLength(1);
    expect(types[0].props.children).toBe('bar');
  });
  test('should render selection toolbar', async () => {
    await render({ qSelectionInfo: { qInSelections: true } }, { component: {}, selectionToolbar: {} });
    const types = renderer.root.findAllByType(ActionsToolbar);
    expect(types).toHaveLength(1);
  });
});
