/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable no-use-before-define */
/* eslint-disable no-import-assign */
/* eslint-disable no-underscore-dangle */
import React from 'react';
import { create, act } from 'react-test-renderer';
import { IconButton, Divider, Grid } from '@mui/material';
import * as InstanceContextModule from '../../contexts/InstanceContext';
import * as useDefaultSelectionActionsModule from '../../hooks/useDefaultSelectionActions';
import * as ActionsToolbarMoreModule from '../ActionsToolbarMore';
import ActionsToolbar from '../ActionsToolbar';

const nebulaUIThemeModule = require('@nebula.js/ui/theme');

jest.mock('@mui/material', () => ({ ...jest.requireActual('@mui/material'), Popover }));
jest.mock('@nebula.js/ui/theme', () => ({ ...jest.requireActual('@nebula.js/ui/theme') }));

const Popover = (props) => props.children || 'popover';
const InstanceContext = React.createContext();

const createButton = (levels = 0) => ({
  classList: {
    contains: jest.fn().mockReturnValue(true),
    add: jest.fn(),
    remove: jest.fn(),
  },
  setAttribute: jest.fn(),
  blur: jest.fn(),
  focus: jest.fn(),
  querySelectorAll: jest.fn().mockReturnValue([]),
  querySelector: jest.fn().mockReturnValue(levels <= 0 ? {} : createButton(levels - 1)),
  closest: jest.fn().mockReturnValue(levels <= 0 ? {} : createButton(levels - 1)),
});

describe('<ActionsToolbar />', () => {
  let renderer;
  let render;
  let update;
  let selections;

  beforeEach(() => {
    // if spied function is a getter -> you need to use jest.mock(...)
    // and spread jest.requireActual(<MODULE>) in order to mock it
    // check here: https://github.com/facebook/jest/issues/6914#issue-355205927
    jest.spyOn(nebulaUIThemeModule, 'useTheme').mockImplementation(() => ({
      spacing: () => {},
      palette: { btn: { active: 'someColor' } },
    }));
    jest
      .spyOn(useDefaultSelectionActionsModule, 'default')
      .mockImplementation(() => [{ label: 'clear ' }, { label: 'cancel' }, { label: 'confirm' }]);
    InstanceContextModule.default = InstanceContext;
    ActionsToolbarMoreModule.default = Popover;

    selections = {
      show: false,
      api: {
        canClear: jest.fn(),
        clear: jest.fn(),
        canCancel: jest.fn(),
        cancel: jest.fn(),
        canConfirm: jest.fn(),
        confirm: jest.fn(),
      },
      onConfirm: jest.fn(),
      onCancel: jest.fn(),
    };
    render = async (p) => {
      const props = {
        actions: [],
        ...p,
      };
      await act(async () => {
        renderer = create(
          <InstanceContext.Provider value={{ translator: { get: (s) => s }, keyboardNavigation: true }}>
            <ActionsToolbar {...props} />
          </InstanceContext.Provider>
        );
      });
    };
    update = async (props) => {
      await act(async () => {
        renderer.update(
          <InstanceContext.Provider value={{ translator: { get: (s) => s }, keyboardNavigation: true }}>
            <ActionsToolbar {...props} />
          </InstanceContext.Provider>
        );
      });
    };
  });

  afterEach(() => {
    renderer.unmount();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  test('should render default', async () => {
    await render();
    expect(renderer.root.props).toEqual({ actions: [] });
  });

  test('should render default selection actions', async () => {
    selections.show = true;
    await render({ selections });
    const selItems = renderer.root.findAllByType(IconButton);
    expect(selItems).toHaveLength(3);
  });

  test('should render custom actions', async () => {
    const action = jest.fn();
    const actions = [
      {
        key: 'foo',
        label: 'bar',
        enabled: true,
        action,
      },
    ];
    await render({ actions });
    const IconButtons = renderer.root.findAllByType(IconButton);
    expect(IconButtons).toHaveLength(1);
  });

  test('should not render hidden custom actions', async () => {
    const actions = [1, 2, 3, 4, 5].map((key) => ({
      key,
      enabled: true,
      action: jest.fn(),
      hidden: true,
    }));
    await render({ actions, selections });
    expect(() => renderer.root.findByType(IconButton)).toThrow();
  });

  test('should render more', async () => {
    const actions = [1, 2, 3, 4, 5].map((key) => ({
      key,
      enabled: true,
      action: jest.fn(),
    }));
    await render({ actions });
    const items = renderer.root.findAllByType(IconButton);
    const more = items[items.length - 1];
    expect(more.props).toMatchObject({
      title: 'Menu.More',
    });
    expect(items).toHaveLength(3);
  });

  test('should render divider', async () => {
    selections.show = true;
    const actions = [1, 2, 3, 4, 5].map((key) => ({
      key,
      enabled: true,
      action: jest.fn(),
    }));
    await render({ actions, selections });
    const _divider = renderer.root.findByType(Divider);
    expect(_divider).not.toBeNull();
  });

  test('should render more items', async () => {
    const actions = [1, 2, 3, 4, 5].map((key) => ({
      key,
      enabled: true,
      action: jest.fn(),
    }));
    await render({ actions });
    const items = renderer.root.findAllByType(IconButton);
    const more = items[items.length - 1];
    act(() => {
      more.props.onClick();
    });
    const _popover = renderer.root.findByType(Popover);
    expect(_popover).not.toBeNull();
  });

  test.skip('should set spacing', async () => {
    const validate = (cnt) => {
      const items = renderer.root.findAllByType(Grid).filter((i) => i.props.className);
      expect(items).to.have.length(cnt);
      items.forEach((item, ix) => {
        if (ix === 0) {
          expect(item.props.className).to.match(/^makeStyles-firstItemSpacing-\d+$/);
        }
        if (ix === items.length - 1) {
          expect(item.props.className).to.match(/^makeStyles-lastItemSpacing-\d+$/);
        }
        if (ix !== 0 && ix !== items.length - 1) {
          expect(item.props.className).to.match(/^makeStyles-itemSpacing-\d+$/);
        }
      });
    };

    const actions = [1, 2, 3, 4, 5].map((key) => ({
      key,
      label: key,
      enabled: true,
      action: jest.fn(),
    }));
    await render({ actions, selections });
    // 2 custom actions + more
    validate(3);

    selections.show = true;
    await render({ actions, selections });
    // 2 custom actions + more + divider + 3 selection actions
    validate(7);

    // 1 custom action
    await render({ actions: [actions[0]] });
    expect(renderer.root.findAllByType(Grid).filter((i) => i.props.className)).to.have.length(0);
  });

  test('should render as popover', async () => {
    const actions = [1, 2, 3, 4, 5].map((key) => ({
      key,
      enabled: true,
      action: jest.fn(),
    }));
    await render({ actions, popover: { show: true } });
    const _popover = renderer.root.findByType(Popover);
    expect(_popover).not.toBeNull();
  });

  test('should always start with more menu closed in popover', async () => {
    const actions = [1, 2, 3, 4, 5].map((key) => ({
      key,
      enabled: true,
      action: jest.fn(),
    }));
    await render({ actions, popover: { show: true } });
    const items = renderer.root.findAllByType(IconButton);
    const more = items[items.length - 1];
    act(() => {
      more.props.onClick();
    });
    await update({ actions, popover: { show: false } });
    await update({ actions, popover: { show: true } });
    const popovers = renderer.root.findAllByType(Popover);
    expect(popovers).toHaveLength(1);
  });

  describe('keyboard navigation', () => {
    let buttonsMock;
    let focusHandler;
    let actions;
    let focusCallbacks;
    const actionsRefMock = { querySelectorAll: () => buttonsMock };

    beforeEach(() => {
      focusCallbacks = {};
      buttonsMock = ['target-0', 'target-1'];
      focusHandler = {
        refocusContent: jest.fn(),
        on: (name, cb) => {
          focusCallbacks[name] = cb;
        },
      };
      actions = [1, 2].map((key) => ({
        key,
        enabled: true,
        action: jest.fn(),
      }));
    });

    test('should call focusHandler.refocusContent when tabbing from last button', async () => {
      await render({ actions, focusHandler, actionsRefMock, popover: { show: true } });
      const container = renderer.root.findAllByType(Grid).find((i) => i.props && i.props.container);
      const event = {
        nativeEvent: {
          keyCode: 9, // tab
        },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: buttonsMock[1], // last button
      };
      container.props.onKeyDown(event);

      expect(focusHandler.refocusContent).toHaveBeenCalledTimes(1);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    });

    test('should call focusHandler.refocusContent when shift tabbing from first button', async () => {
      await render({ actions, focusHandler, actionsRefMock, popover: { show: true } });
      const container = renderer.root.findAllByType(Grid).find((i) => i.props && i.props.container);
      const event = {
        nativeEvent: {
          keyCode: 9, // tab
        },
        shiftKey: true,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: buttonsMock[0], // first button
      };
      container.props.onKeyDown(event);

      expect(focusHandler.refocusContent).toHaveBeenCalledTimes(1);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    });

    test('should not call focusHandler.refocusContent when shift tabbing from last button', async () => {
      await render({ actions, focusHandler, actionsRefMock, popover: { show: true } });
      const container = renderer.root.findAllByType(Grid).find((i) => i.props && i.props.container);
      const event = {
        nativeEvent: {
          keyCode: 9, // tab
        },
        shiftKey: true,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: buttonsMock[1], // first button
      };
      container.props.onKeyDown(event);

      expect(focusHandler.refocusContent).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(event.stopPropagation).not.toHaveBeenCalled();
    });

    test('should add event listeners to focusHandler, with callbacks that focus buttons', async () => {
      buttonsMock = [{ focus: jest.fn() }, { focus: jest.fn() }];
      await render({ actions, focusHandler, actionsRefMock, popover: { show: true } });
      focusCallbacks.focus_toolbar_first();
      focusCallbacks.focus_toolbar_last();

      expect(buttonsMock[0].focus).toHaveBeenCalledTimes(1);
      expect(buttonsMock[1].focus).toHaveBeenCalledTimes(1);
    });

    test('should focus the next focusable button to the right', async () => {
      const firstButton = {
        ...createButton(),
        closest: jest.fn().mockReturnValue({
          querySelectorAll: jest.fn().mockImplementation((selector) => {
            if (selector === '.njs-cell-action') {
              return realButtonsMock;
            }
            return [];
          }),
        }),
      };
      const realButtonsMock = [firstButton, createButton()];
      const actionsRef = { querySelectorAll: () => realButtonsMock };
      const mockQuerySelectorAll = jest.spyOn(document, 'querySelectorAll');
      mockQuerySelectorAll.mockImplementation(() => realButtonsMock);
      await render({ actions, focusHandler, actionsRefMock: actionsRef, popover: { show: true } });
      const container = renderer.root.findAllByType(Grid).find((i) => i.props && i.props.container);
      const event = {
        nativeEvent: {
          keyCode: 39, // arrow right
        },
        shiftKey: false,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        target: firstButton,
      };

      container.props.onKeyDown(event);

      expect(realButtonsMock[0].focus).not.toHaveBeenCalled();
      expect(realButtonsMock[1].focus).toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(event.stopPropagation).not.toHaveBeenCalled();
    });
  });
});
