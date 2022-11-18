import { getFieldKeyboardNavigation, getListboxInlineKeyboardNavigation } from '../listbox-keyboard-navigation';

describe('keyboard navigation', () => {
  let actions;
  let handleKeyDownForField;
  let handleKeyDownForListbox;
  let setKeyboardActive;

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  beforeEach(() => {
    global.document = {};
    setKeyboardActive = jest.fn();
    actions = {
      select: jest.fn(),
      cancel: jest.fn(),
      confirm: jest.fn(),
    };

    handleKeyDownForField = getFieldKeyboardNavigation(actions);
    handleKeyDownForListbox = getListboxInlineKeyboardNavigation({ setKeyboardActive });
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
      expect(actions.select).toHaveBeenCalledWith([1]);
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
  });

  describe('handle keyboard navigation on listbox-inline level', () => {
    test('should focus value with Space', () => {
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
      expect(element.focus).toHaveBeenCalledTimes(1);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(event.stopPropagation).not.toHaveBeenCalled();
      expect(setKeyboardActive).toHaveBeenCalledTimes(1);
      expect(setKeyboardActive).toHaveBeenCalledWith(true);
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
      expect(element.focus).toHaveBeenCalledTimes(1);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(event.stopPropagation).not.toHaveBeenCalled();
      expect(setKeyboardActive).toHaveBeenCalledTimes(1);
      expect(setKeyboardActive).toHaveBeenCalledWith(true);
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
      expect(element.focus).toHaveBeenCalledTimes(1);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(event.stopPropagation).not.toHaveBeenCalled();
      expect(setKeyboardActive).toHaveBeenCalledTimes(1);
      expect(setKeyboardActive).toHaveBeenCalledWith(true);
    });

    test('should focus container with Escape', () => {
      const element = { focus: jest.fn() };
      const event = {
        currentTarget: element,
        nativeEvent: { keyCode: 27 },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleKeyDownForListbox(event);
      expect(element.focus).toHaveBeenCalledTimes(1);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(event.stopPropagation).not.toHaveBeenCalled();
      expect(setKeyboardActive).toHaveBeenCalledTimes(1);
      expect(setKeyboardActive).toHaveBeenCalledWith(false);
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
      expect(setKeyboardActive).not.toHaveBeenCalled();
    });
  });
});
