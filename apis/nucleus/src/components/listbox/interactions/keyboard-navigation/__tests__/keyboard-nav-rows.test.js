import KEYS from '../../../../../keys';
import getRowsKeyboardNavigation from '../keyboard-nav-rows';
import { createElement } from './keyboard-nav-test-utils';

describe('keyboard navigation', () => {
  let actions;
  let handleKeyDownForRow;
  let setScrollPosition;
  let focusListItems;
  let keyboard;
  let isModal;

  const globalEvent = {
    nativeEvent: {},
    currentTarget: {
      ...createElement(0),
      getAttribute: jest.fn(() => '0'),
    },
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  };

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  beforeEach(() => {
    keyboard = {
      blur: jest.fn(),
      focus: jest.fn(),
      enabled: true,
      active: false,
      focusSelection: jest.fn(),
    };
    setScrollPosition = jest.fn();
    isModal = jest.fn();
    isModal.mockReturnValue(true);
    focusListItems = { setFirst: jest.fn(), setLast: jest.fn() };
    actions = {
      select: jest.fn(),
      cancel: jest.fn(),
      confirm: jest.fn(),
    };

    handleKeyDownForRow = getRowsKeyboardNavigation({
      select: actions.select,
      cancel: actions.cancel,
      confirm: actions.confirm,
      setScrollPosition,
      focusListItems,
      keyboard,
      isModal,
    });
  });

  describe('handle keyboard navigation on field level', () => {
    test('select values with Space', () => {
      expect(actions.select).not.toHaveBeenCalled();
      expect(actions.confirm).not.toHaveBeenCalled();
      expect(actions.cancel).not.toHaveBeenCalled();

      // Space should select values
      const event = {
        nativeEvent: { keyCode: KEYS.SPACE },
        currentTarget: { getAttribute: jest.fn().mockReturnValue(1) },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleKeyDownForRow(event);
      expect(actions.select).toHaveBeenCalledTimes(1);
      expect(actions.select).toHaveBeenCalledWith([1], false, event);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    });

    test('confirm selections with Enter', () => {
      const eventConfirm = {
        nativeEvent: { keyCode: KEYS.ENTER },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleKeyDownForRow(eventConfirm);
      expect(actions.confirm).toHaveBeenCalledTimes(1);
    });

    test('cancel selections with Escape', () => {
      const eventCancel = {
        nativeEvent: { keyCode: KEYS.ESCAPE },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleKeyDownForRow(eventCancel);
      expect(actions.cancel).toHaveBeenCalledTimes(1);
    });

    test('arrow up should move focus upwards', () => {
      const focus = jest.fn();
      const eventArrowUp = {
        nativeEvent: { keyCode: KEYS.ARROW_UP },
        currentTarget: {
          parentElement: {
            previousElementSibling: {
              querySelector: () => ({ focus }),
            },
          },
        },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleKeyDownForRow(eventArrowUp);
      expect(focus).toHaveBeenCalledTimes(1);
    });

    test('arrow down should move focus downwards', () => {
      const focus = jest.fn();
      const eventArrowDown = {
        nativeEvent: { keyCode: KEYS.ARROW_DOWN },
        currentTarget: {
          parentElement: {
            nextElementSibling: {
              querySelector: () => ({ focus }),
            },
          },
        },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleKeyDownForRow(eventArrowDown);
      expect(focus).toHaveBeenCalledTimes(1);
    });

    test('arrow down with Shift should range select values downwards (current and next element)', () => {
      const focus = jest.fn();
      expect(actions.select).not.toHaveBeenCalled();
      const eventArrowDown = {
        nativeEvent: { keyCode: KEYS.ARROW_DOWN, shiftKey: true },
        currentTarget: {
          parentElement: {
            nextElementSibling: {
              querySelector: () => ({ focus, getAttribute: jest.fn().mockReturnValue(2) }),
            },
          },
          getAttribute: jest.fn().mockReturnValue(1),
        },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleKeyDownForRow(eventArrowDown);
      expect(focus).toHaveBeenCalledTimes(1);
      expect(actions.select).toHaveBeenCalledTimes(1);
      expect(actions.select).toHaveBeenCalledWith([2], true);
    });

    test('arrow up with Shift should range select values upwards (current and previous element)', () => {
      const focus = jest.fn();
      expect(actions.select).not.toHaveBeenCalled();
      const eventArrowUp = {
        nativeEvent: { keyCode: KEYS.ARROW_UP, shiftKey: true },
        currentTarget: {
          getAttribute: jest.fn().mockReturnValue(2),
          parentElement: {
            previousElementSibling: {
              querySelector: () => ({ focus, getAttribute: jest.fn().mockReturnValue(1) }),
            },
          },
        },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleKeyDownForRow(eventArrowUp);
      expect(focus).toHaveBeenCalledTimes(1);
      expect(actions.select).toHaveBeenCalledTimes(1);
      expect(actions.select).toHaveBeenCalledWith([1], true);
    });

    test('should call setScrollPosition with "end" when keyCode is KEYS.END', () => {
      globalEvent.nativeEvent.keyCode = KEYS.END;
      handleKeyDownForRow(globalEvent);
      expect(setScrollPosition).toHaveBeenCalledWith('end');
    });

    test('should call setScrollPosition with "overflowEnd" when keyCode is KEYS.END and ctrlKey is true', () => {
      globalEvent.nativeEvent.keyCode = KEYS.END;
      globalEvent.nativeEvent.ctrlKey = true;
      handleKeyDownForRow(globalEvent);
      expect(setScrollPosition).toHaveBeenCalledWith('overflowEnd');
      globalEvent.nativeEvent.ctrlKey = false;
    });

    test('should call focusListItems.setLast with true when keyCode is KEYS.END', () => {
      globalEvent.nativeEvent.keyCode = KEYS.END;
      handleKeyDownForRow(globalEvent);
      expect(focusListItems.setLast).toHaveBeenCalledWith(true);
    });

    test('should call setScrollPosition with "start" when keyCode is KEYS.HOME', () => {
      globalEvent.nativeEvent.keyCode = KEYS.HOME;
      handleKeyDownForRow(globalEvent);
      expect(setScrollPosition).toHaveBeenCalledWith('start');
    });

    test('should call setScrollPosition with "overflowStart" when keyCode is KEYS.HOME and ctrlKey is true', () => {
      globalEvent.nativeEvent.keyCode = KEYS.HOME;
      globalEvent.nativeEvent.ctrlKey = true;
      handleKeyDownForRow(globalEvent);
      expect(setScrollPosition).toHaveBeenCalledWith('overflowStart');
      globalEvent.nativeEvent.ctrlKey = false;
    });

    test('should call focusListItems.setFirst with true when keyCode is KEYS.HOME', () => {
      globalEvent.nativeEvent.keyCode = KEYS.HOME;
      handleKeyDownForRow(globalEvent);
      expect(focusListItems.setFirst).toHaveBeenCalledWith(true);
    });
  });
});
