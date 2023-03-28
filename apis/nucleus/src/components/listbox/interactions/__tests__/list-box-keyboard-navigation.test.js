import KEYS from '../../../../keys';
import { getFieldKeyboardNavigation, getListboxInlineKeyboardNavigation } from '../listbox-keyboard-navigation';

const createElement = (levels = 3) => ({
  classList: {
    contains: jest.fn().mockReturnValue(false),
    add: jest.fn(),
    remove: jest.fn(),
  },
  setAttribute: jest.fn(),
  blur: jest.fn(),
  focus: jest.fn(),
  querySelectorAll: jest.fn().mockReturnValue([]),
  querySelector: jest.fn().mockReturnValue(levels <= 0 ? {} : createElement(levels - 1)),
  closest: jest.fn().mockReturnValue(levels <= 0 ? {} : createElement(levels - 1)),
});

describe('keyboard navigation', () => {
  let actions;
  let handleKeyDownForField;
  let handleKeyDownForListbox;
  let setScrollPosition;
  let focusListItems;
  let handleOnMouseEnter;
  let handleOnMouseLeave;
  let setHovering;
  let constraints;
  let app;
  let containerRef;
  let hovering;
  let updateKeyScroll;
  let currentScrollIndex;
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
    global.document = {};
    keyboard = {
      blur: jest.fn(),
      focus: jest.fn(),
      enabled: jest.fn(),
      active: jest.fn(),
      focusSelection: jest.fn(),
    };
    setScrollPosition = jest.fn();
    isModal = jest.fn();
    isModal.mockReturnValue(true);
    focusListItems = { setFirst: jest.fn(), setLast: jest.fn() };
    setHovering = jest.fn();
    constraints = {};
    containerRef = { current: createElement(0) };
    app = { isInModalSelection: () => false };
    hovering = true;
    updateKeyScroll = jest.fn();
    currentScrollIndex = { start: 0, stop: 10 };
    actions = {
      select: jest.fn(),
      cancel: jest.fn(),
      confirm: jest.fn(),
    };

    handleKeyDownForField = getFieldKeyboardNavigation({
      select: actions.select,
      cancel: actions.cancel,
      confirm: actions.confirm,
      setScrollPosition,
      focusListItems,
      keyboard,
      isModal,
    });

    ({
      handleKeyDown: handleKeyDownForListbox,
      handleOnMouseEnter,
      handleOnMouseLeave,
    } = getListboxInlineKeyboardNavigation({
      constraints,
      setHovering,
      app,
      containerRef,
      hovering,
      updateKeyScroll,
      currentScrollIndex,
      keyboard,
      isModal,
    }));
  });

  describe('handle keyboard navigation on field level', () => {
    test('select values with Space', () => {
      expect(actions.select).not.toHaveBeenCalled();
      expect(actions.confirm).not.toHaveBeenCalled();
      expect(actions.cancel).not.toHaveBeenCalled();

      // Space should select values
      const event = {
        nativeEvent: { keyCode: 32 },
        currentTarget: { getAttribute: jest.fn().mockReturnValue(1) },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleKeyDownForField(event);
      expect(actions.select).toHaveBeenCalledTimes(1);
      expect(actions.select).toHaveBeenCalledWith([1], false, event);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    });

    test('confirm selections with Enter', () => {
      const eventConfirm = {
        nativeEvent: { keyCode: 13 },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleKeyDownForField(eventConfirm);
      expect(actions.confirm).toHaveBeenCalledTimes(1);
    });

    test('cancel selections with Escape', () => {
      const eventCancel = {
        nativeEvent: { keyCode: 27 },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleKeyDownForField(eventCancel);
      expect(actions.cancel).toHaveBeenCalledTimes(1);
    });

    test('arrow up should move focus upwards', () => {
      const focus = jest.fn();
      const eventArrowUp = {
        nativeEvent: { keyCode: 38 },
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
      handleKeyDownForField(eventArrowUp);
      expect(focus).toHaveBeenCalledTimes(1);
    });

    test('arrow down should move focus downwards', () => {
      const focus = jest.fn();
      const eventArrowDown = {
        nativeEvent: { keyCode: 40 },
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
      handleKeyDownForField(eventArrowDown);
      expect(focus).toHaveBeenCalledTimes(1);
    });

    test('arrow down with Shift should range select values downwards (current and next element)', () => {
      const focus = jest.fn();
      expect(actions.select).not.toHaveBeenCalled();
      const eventArrowDown = {
        nativeEvent: { keyCode: 40, shiftKey: true },
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
      handleKeyDownForField(eventArrowDown);
      expect(focus).toHaveBeenCalledTimes(1);
      expect(actions.select).toHaveBeenCalledTimes(1);
      expect(actions.select).toHaveBeenCalledWith([2], true);
    });

    test('arrow up with Shift should range select values upwards (current and previous element)', () => {
      const focus = jest.fn();
      expect(actions.select).not.toHaveBeenCalled();
      const eventArrowUp = {
        nativeEvent: { keyCode: 38, shiftKey: true },
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
      handleKeyDownForField(eventArrowUp);
      expect(focus).toHaveBeenCalledTimes(1);
      expect(actions.select).toHaveBeenCalledTimes(1);
      expect(actions.select).toHaveBeenCalledWith([1], true);
    });

    test('should call setScrollPosition with "end" when keyCode is KEYS.END', () => {
      globalEvent.nativeEvent.keyCode = KEYS.END;
      handleKeyDownForField(globalEvent);
      expect(setScrollPosition).toHaveBeenCalledWith('end');
    });

    test('should call setScrollPosition with "overflowEnd" when keyCode is KEYS.END and ctrlKey is true', () => {
      globalEvent.nativeEvent.keyCode = KEYS.END;
      globalEvent.nativeEvent.ctrlKey = true;
      handleKeyDownForField(globalEvent);
      expect(setScrollPosition).toHaveBeenCalledWith('overflowEnd');
      globalEvent.nativeEvent.ctrlKey = false;
    });

    test('should call focusListItems.setLast with true when keyCode is KEYS.END', () => {
      globalEvent.nativeEvent.keyCode = KEYS.END;
      handleKeyDownForField(globalEvent);
      expect(focusListItems.setLast).toHaveBeenCalledWith(true);
    });

    test('should call setScrollPosition with "start" when keyCode is KEYS.HOME', () => {
      globalEvent.nativeEvent.keyCode = KEYS.HOME;
      handleKeyDownForField(globalEvent);
      expect(setScrollPosition).toHaveBeenCalledWith('start');
    });

    test('should call setScrollPosition with "overflowStart" when keyCode is KEYS.HOME and ctrlKey is true', () => {
      globalEvent.nativeEvent.keyCode = KEYS.HOME;
      globalEvent.nativeEvent.ctrlKey = true;
      handleKeyDownForField(globalEvent);
      expect(setScrollPosition).toHaveBeenCalledWith('overflowStart');
      globalEvent.nativeEvent.ctrlKey = false;
    });

    test('should call focusListItems.setFirst with true when keyCode is KEYS.HOME', () => {
      globalEvent.nativeEvent.keyCode = KEYS.HOME;
      handleKeyDownForField(globalEvent);
      expect(focusListItems.setFirst).toHaveBeenCalledWith(true);
    });
  });

  describe('handle keyboard navigation on listbox-inline level', () => {
    test('should focus value with Space', () => {
      const element = { focus: jest.fn() };
      const event = {
        currentTarget: {
          getAttribute: jest.fn().mockReturnValue(1),
          querySelector: jest.fn().mockReturnValue(element),
        },
        target: {
          classList: { contains: (c) => c === 'listbox-container' },
        },
        nativeEvent: { keyCode: 32 },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleKeyDownForListbox(event);
      expect(keyboard.focus).toHaveBeenCalledTimes(1);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(event.stopPropagation).not.toHaveBeenCalled();
    });

    test('should not focus value with Space when target is not listbox-container', () => {
      const element = { focus: jest.fn() };
      const event = {
        currentTarget: {
          querySelector: jest.fn().mockReturnValue(element),
        },
        target: {
          classList: { contains: (c) => c === 'listbox-container' },
        },
        nativeEvent: { keyCode: 32 },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleKeyDownForListbox(event);
      expect(keyboard.focus).toHaveBeenCalledTimes(1);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(event.stopPropagation).not.toHaveBeenCalled();
    });

    test('should focus value with Enter', () => {
      const element = { focus: jest.fn() };
      const event = {
        currentTarget: {
          querySelector: jest.fn().mockReturnValue(element),
        },
        target: {
          classList: { contains: (c) => c === 'listbox-container' },
        },
        nativeEvent: { keyCode: 13 },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleKeyDownForListbox(event);
      expect(keyboard.focus).toHaveBeenCalledTimes(1);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(event.stopPropagation).not.toHaveBeenCalled();
    });

    test('should change focus with Escape on a row', () => {
      const target = createElement();
      const currentTarget = createElement();
      const event = {
        target,
        currentTarget,
        nativeEvent: { keyCode: 27 },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleKeyDownForListbox(event);
      expect(target.classList.contains).toHaveBeenCalledTimes(1);
      expect(target.classList.contains).toHaveBeenCalledWith('listbox-container');
      expect(target.setAttribute).toHaveBeenCalledTimes(1);
      expect(target.setAttribute).toHaveBeenCalledWith('tabIndex', -1);
      expect(keyboard.blur).toHaveBeenCalledTimes(1);
      expect(target.focus).not.toHaveBeenCalled();
      expect(currentTarget.blur).not.toHaveBeenCalled();

      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(event.stopPropagation).not.toHaveBeenCalled();
    });
    test('should change focus with Escape on a listbox', () => {
      const target = {
        classList: { contains: jest.fn().mockReturnValue(true) },
        setAttribute: jest.fn(),
        blur: jest.fn(),
        focus: jest.fn(),
        closest: jest.fn().mockReturnValue({
          querySelector: jest.fn(),
          querySelectorAll: jest.fn().mockReturnValue([]),
          closest: jest.fn().mockReturnValue({
            querySelectorAll: jest.fn().mockReturnValue([]),
          }),
        }),
      };
      const currentTarget = {
        setAttribute: jest.fn(),
        blur: jest.fn(),
        focus: jest.fn(),
        closest: jest.fn().mockReturnValue({
          querySelector: jest.fn(),
          querySelectorAll: jest.fn().mockReturnValue([]),
        }),
      };
      const event = {
        target,
        currentTarget,
        nativeEvent: { keyCode: 27 },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleKeyDownForListbox(event);
      expect(target.classList.contains).toHaveBeenCalledTimes(1);
      expect(target.classList.contains).toHaveBeenCalledWith('listbox-container');
      expect(target.setAttribute).not.toHaveBeenCalled();
      expect(target.blur).not.toHaveBeenCalled();
      expect(target.focus).not.toHaveBeenCalled();

      expect(currentTarget.setAttribute).not.toHaveBeenCalled();
      expect(currentTarget.blur).not.toHaveBeenCalled();
      expect(currentTarget.focus).not.toHaveBeenCalled();

      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(event.stopPropagation).not.toHaveBeenCalled();
    });
    test('not matched key should not call event methods', () => {
      const element = { focus: jest.fn() };
      const event = {
        currentTarget: element,
        nativeEvent: { keyCode: 99 },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleKeyDownForListbox(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(event.stopPropagation).not.toHaveBeenCalled();
    });
    test('should handle mouse enter when allowed to focus', () => {
      isModal.mockReturnValue(false);
      handleOnMouseEnter();
      expect(containerRef.current.focus).toHaveBeenCalled();
    });
    test('should handle mouse enter when not allowed to focus', () => {
      app.isInModalSelection = () => true;
      handleOnMouseEnter();
      app.isInModalSelection = () => false;
    });
    test('should handle mouse leave', () => {
      handleOnMouseLeave();
      expect(setHovering).toHaveBeenCalledWith(false);
      expect(containerRef.current.blur).toHaveBeenCalled();
    });
    test('should update scroll on hover when UP is pressed', () => {
      const event = {
        nativeEvent: { keyCode: KEYS.ARROW_UP },
        preventDefault: jest.fn(),
      };
      handleKeyDownForListbox(event);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(updateKeyScroll).toHaveBeenCalledWith({ up: 1 });
    });
    test('should update scroll on hover when DOWN is pressed', () => {
      const event = {
        nativeEvent: { keyCode: KEYS.ARROW_DOWN },
        preventDefault: jest.fn(),
      };
      handleKeyDownForListbox(event);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(updateKeyScroll).toHaveBeenCalledWith({ down: 1 });
    });
    test('should update scroll on hover when PAGE_UP is pressed', () => {
      const event = {
        nativeEvent: { keyCode: KEYS.PAGE_UP },
        preventDefault: jest.fn(),
      };
      handleKeyDownForListbox(event);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(updateKeyScroll).toHaveBeenCalledWith({ up: 10 });
    });
    test('should update scroll on hover when PAGE_DOWN is pressed', () => {
      const event = {
        nativeEvent: { keyCode: KEYS.PAGE_DOWN },
        preventDefault: jest.fn(),
      };
      handleKeyDownForListbox(event);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(updateKeyScroll).toHaveBeenCalledWith({ down: 10 });
    });
    test('should update scroll on hover when HOME is pressed', () => {
      const event = {
        nativeEvent: { keyCode: KEYS.HOME },
        preventDefault: jest.fn(),
      };
      handleKeyDownForListbox(event);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(updateKeyScroll).toHaveBeenCalledWith({ scrollPosition: 'start' });
    });
    test('should update scroll on hover when CTRL+SHIFT+HOME is pressed', () => {
      const event = {
        nativeEvent: { keyCode: KEYS.HOME, ctrlKey: true, shiftKey: true },
        preventDefault: jest.fn(),
      };
      handleKeyDownForListbox(event);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(updateKeyScroll).toHaveBeenCalledWith({ scrollPosition: 'overflowStart' });
    });
    test('should update scroll on hover when END is pressed', () => {
      const event = {
        nativeEvent: { keyCode: KEYS.END },
        preventDefault: jest.fn(),
      };
      handleKeyDownForListbox(event);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(updateKeyScroll).toHaveBeenCalledWith({ scrollPosition: 'end' });
    });
    test('should update scroll on hover when CTRL+SHIFT+END is pressed', () => {
      const event = {
        nativeEvent: { keyCode: KEYS.END, ctrlKey: true, shiftKey: true },
        preventDefault: jest.fn(),
      };
      handleKeyDownForListbox(event);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(updateKeyScroll).toHaveBeenCalledWith({ scrollPosition: 'overflowEnd' });
    });
  });
});
