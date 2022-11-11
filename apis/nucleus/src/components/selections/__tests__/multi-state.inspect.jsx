/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable no-use-before-define */
/* eslint-disable no-import-assign */
import React from 'react';
import { create, act } from 'react-test-renderer';
import { Badge, Grid, ListItem } from '@mui/material';
import * as NebulaThemeModule from '@nebula.js/ui/theme';
import MultiState from '../MultiState';
import * as InstanceContextModule from '../../../contexts/InstanceContext';
import * as OneFieldModule from '../OneField';
import * as ListBoxPopoverModule from '../../listbox/ListBoxPopover';

jest.mock('@nebula.js/ui/theme', () => ({
  ...jest.requireActual('@nebula.js/ui/theme'),
  useTheme: jest.fn(),
}));

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Popover,
}));

const Popover = (props) => props.children || 'popover';

describe('<MultiState />', () => {
  let renderer;
  let render;
  let field;
  let api;
  let InstanceContext;
  let OneField;
  let ListBoxPopover;

  beforeEach(() => {
    InstanceContext = React.createContext();

    jest.spyOn(NebulaThemeModule, 'useTheme').mockImplementation(() => ({
      palette: { selected: {} },
    }));
    OneField = jest.fn().mockImplementation(() => 'one-field');
    ListBoxPopover = jest.fn().mockImplementation(() => null);

    InstanceContextModule.default = InstanceContext;
    OneFieldModule.default = OneField;
    ListBoxPopoverModule.default = ListBoxPopover;

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
    api = {
      clearField: jest.fn(),
    };
    render = async (rendererOptions = null) => {
      await act(async () => {
        // eslint-disable-next-line react/jsx-props-no-spreading
        renderer = create(
          <InstanceContext.Provider value={{ translator: { get: () => '' } }}>
            <MultiState field={field} api={api} />
          </InstanceContext.Provider>,
          rendererOptions
        );
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
    expect(renderer.root.props).toEqual({ field, api });
    const res = renderer.root.findAllByType(Badge);
    expect(res.length).toBe(1);
  });

  test('should show fields', async () => {
    await render();
    const grid = renderer.root.findByType(Grid);
    await act(() => {
      grid.props.onClick({ currentTarget: { contains: jest.fn().mockReturnValue(true) } });
    });
    const popover = renderer.root.findByType(Popover);
    const items = popover.findAllByType(ListItem);
    expect(items.length).toBe(3);
  });

  test('should close show fields', async () => {
    await render();
    const grid = renderer.root.findByType(Grid);
    await act(() => {
      grid.props.onClick({ currentTarget: { contains: jest.fn().mockReturnValue(true) } });
    });
    const popover = renderer.root.findByType(Popover);
    await act(() => {
      popover.props.onClose();
    });
    expect(() => renderer.root.findByType(Popover)).toThrow();
  });

  test('should show field state', async () => {
    await render();
    const grid = renderer.root.findByType(Grid);
    await act(() => {
      grid.props.onClick({ currentTarget: { contains: jest.fn().mockReturnValue(true) } });
    });
    const popover = renderer.root.findByType(Popover);
    const items = popover.findAllByType(ListItem);
    // Show foo state
    await act(() => {
      items[2].props.onClick({ stopPropagation: jest.fn() }, 1);
    });
    const listboxPopover = renderer.root.findByType(ListBoxPopover);
    expect(listboxPopover.props.stateName).toBe('foo');
  });

  test('should close show field state', async () => {
    await render();
    const grid = renderer.root.findByType(Grid);
    await act(() => {
      grid.props.onClick({ currentTarget: { contains: jest.fn().mockReturnValue(true) } });
    });
    const popover = renderer.root.findByType(Popover);
    const items = popover.findAllByType(ListItem);
    // Show foo state
    await act(() => {
      items[2].props.onClick({ stopPropagation: jest.fn() }, 1);
    });
    const listboxPopover = renderer.root.findByType(ListBoxPopover);
    // Close foo state
    await act(() => {
      listboxPopover.props.close();
    });
    expect(() => renderer.root.findByType(ListBoxPopover)).toThrow();
  });
});
