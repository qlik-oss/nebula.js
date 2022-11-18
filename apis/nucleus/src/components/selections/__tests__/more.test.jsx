/* eslint-disable no-use-before-define */
/* eslint-disable no-import-assign */
import React from 'react';
import { create, act } from 'react-test-renderer';
import { Grid, Typography, ListItem, Box } from '@mui/material';
import * as NebulaThemeModule from '@nebula.js/ui/theme';
import * as MultiStateModule from '../MultiState';
import * as OneFieldModule from '../OneField';
import More from '../More';

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Popover,
}));

jest.mock('@nebula.js/ui/theme', () => ({
  ...jest.requireActual('@nebula.js/ui/theme'),
  useTheme: jest.fn(),
}));

const Popover = (props) => props.children || 'popover';

describe('<More />', () => {
  let renderer;
  let render;
  let multiStateField;
  let field;
  let api;
  let items;
  let MultiState;
  let OneField;
  beforeEach(() => {
    jest.spyOn(NebulaThemeModule, 'useTheme').mockImplementation(() => ({
      palette: { selected: {} },
      shape: { borderRadius: '2px' },
    }));

    MultiState = jest.fn().mockImplementation(() => 'MultiState');
    OneField = jest.fn().mockImplementation(() => 'OneField');

    MultiStateModule.default = MultiState;
    OneFieldModule.default = OneField;

    multiStateField = {
      selections: [
        {
          qField: 'my-field',
          qTotal: 12,
          qStateCounts: {
            qSelected: 3,
            qLocked: 3,
            qExcluded: 0,
            qLockedExcluded: 3,
            qSelectedExcluded: 3,
            qAlternative: 0,
          },
        },
        {
          qField: 'my-field',
          qTotal: 12,
          qStateCounts: {
            qSelected: 1,
            qLocked: 5,
            qExcluded: 0,
            qLockedExcluded: 3,
            qSelectedExcluded: 3,
            qAlternative: 0,
          },
        },
      ],
      states: ['$', 'foo'],
    };
    field = {
      selections: [
        {
          qField: 'my-field',
          qTotal: 12,
          qStateCounts: {
            qSelected: 3,
            qLocked: 3,
            qExcluded: 0,
            qLockedExcluded: 3,
            qSelectedExcluded: 3,
            qAlternative: 0,
          },
        },
      ],
      states: ['$'],
    };
    api = {
      clearField: jest.fn(),
    };
    items = [field, multiStateField];
    render = async (rendererOptions = null) => {
      await act(async () => {
        // eslint-disable-next-line react/jsx-props-no-spreading
        renderer = create(<More items={items} api={api} />, rendererOptions);
      });
    };
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    renderer.unmount();
  });
  test('should render', async () => {
    await render();
    const box = renderer.root.findByType(Box);
    const t = box.findByType(Typography);
    expect(t.props.children).toEqual(['+', 2]);
  });

  test('should show more items', async () => {
    await render();
    const grid = renderer.root.findByType(Grid);
    await act(async () => grid.props.onClick({ currentTarget: { contains: jest.fn().mockReturnValue(true) } }));

    const popover = renderer.root.findByType(Popover);
    const ms = popover.findAllByType(MultiState);
    const of = popover.findAllByType(OneField);
    expect(ms.length).toBe(1);
    expect(of.length).toBe(1);
  });

  test('should close more items', async () => {
    await render();
    const grid = renderer.root.findByType(Grid);
    await act(async () => grid.props.onClick({ currentTarget: { contains: jest.fn().mockReturnValue(true) } }));
    const popover = renderer.root.findByType(Popover);
    await act(async () => popover.props.onClose());
    expect(() => renderer.root.findByType(Popover)).toThrow();
  });

  test('should show item <OneField />', async () => {
    await render();
    const grid = renderer.root.findByType(Grid);
    await act(async () => grid.props.onClick({ currentTarget: { contains: jest.fn().mockReturnValue(true) } }));
    const popover = renderer.root.findByType(Popover);
    const lis = popover.findAllByType(ListItem);
    await act(async () => lis[0].props.onClick({ stopPropagation: jest.fn() }));
    renderer.root.findByType(OneField);
    expect(() => renderer.root.findByType(Popover)).toThrow();
    expect(() => popover.findByType(MultiState)).toThrow();
  });

  test('should close item <OneField />', async () => {
    await render();
    const grid = renderer.root.findByType(Grid);
    await act(async () => grid.props.onClick({ currentTarget: { contains: jest.fn().mockReturnValue(true) } }));
    const popover = renderer.root.findByType(Popover);
    const lis = popover.findAllByType(ListItem);
    await act(async () => lis[0].props.onClick({ stopPropagation: jest.fn() }));
    const of = renderer.root.findByType(OneField);
    await act(async () => of.props.onClose());
    expect(() => renderer.root.findByType(OneField)).toThrow();
  });

  test('should show item <MultiState />', async () => {
    await render();
    const grid = renderer.root.findByType(Grid);
    await act(() => {
      grid.props.onClick({ currentTarget: { contains: jest.fn().mockReturnValue(true) } });
    });
    const popover = renderer.root.findByType(Popover);
    const lis = popover.findAllByType(ListItem);
    await act(async () => lis[1].props.onClick({ stopPropagation: jest.fn() }));
    renderer.root.findByType(MultiState);
    expect(() => renderer.root.findByType(Popover)).toThrow();
    expect(() => popover.findByType(OneField)).toThrow();
  });

  test('should close item <MultiState />', async () => {
    await render();
    const grid = renderer.root.findByType(Grid);
    await act(async () => grid.props.onClick({ currentTarget: { contains: jest.fn().mockReturnValue(true) } }));
    const popover = renderer.root.findByType(Popover);
    const lis = popover.findAllByType(ListItem);
    await act(async () => lis[1].props.onClick({ stopPropagation: jest.fn() }));
    const ms = renderer.root.findByType(MultiState);
    await act(async () => ms.props.onClose());
    expect(() => renderer.root.findByType(MultiState)).toThrow();
  });
});
