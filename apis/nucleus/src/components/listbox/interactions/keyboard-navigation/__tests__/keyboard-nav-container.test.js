import KEYS from '../../../../../keys';
import getListboxContainerKeyboardNavigation from '../keyboard-nav-container';
import { createElement } from './keyboard-nav-test-utils';

describe('keyboard navigation', () => {
  let handleKeyDownForListbox;
  let handleGlobalKeyDown;
  let handleOnMouseEnter;
  let handleOnMouseLeave;
  let constraints;
  let app;
  let containerRef;
  let hovering;
  let updateKeyScroll;
  let currentScrollIndex;
  let keyboard;
  let isModal;

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
    isModal = jest.fn();
    isModal.mockReturnValue(true);
    constraints = {};
    containerRef = { current: createElement(0) };
    app = { isInModalSelection: () => false };
    hovering = { current: true };
    updateKeyScroll = jest.fn();
    currentScrollIndex = { start: 0, stop: 10 };

    ({
      handleKeyDown: handleKeyDownForListbox,
      globalKeyDown: handleGlobalKeyDown,
      handleOnMouseEnter,
      handleOnMouseLeave,
    } = getListboxContainerKeyboardNavigation({
      constraints,
      app,
      containerRef,
      hovering,
      updateKeyScroll,
      currentScrollIndex,
      keyboard,
      isModal,
    }));
  });

  describe('handle keyboard navigation on listbox container level', () => {
    test('should focus value with Space', () => {
      const element = { focus: jest.fn() };
      const event = {
        target: {
          classList: {
            contains: jest.fn().mockReturnValue(true),
          },
        },
        currentTarget: {
          ...createElement(0),
          getAttribute: jest.fn().mockReturnValue(1),
          querySelector: jest.fn().mockReturnValue(element),
          classList: { contains: (c) => c === 'listbox-container' },
        },
        nativeEvent: { keyCode: 32 },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleKeyDownForListbox(event);
      expect(keyboard.focus).toHaveBeenCalledTimes(1);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
    });

    test('should not focus value with Space when target is not listbox-container', () => {
      const element = { focus: jest.fn() };
      const event = {
        target: {
          classList: {
            contains: jest.fn().mockReturnValue(true),
          },
        },
        currentTarget: {
          ...createElement(0),
          querySelector: jest.fn().mockReturnValue(element),
          classList: { contains: (c) => c === 'listbox-container' },
        },
        nativeEvent: { keyCode: 32 },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleKeyDownForListbox(event);
      expect(keyboard.focus).toHaveBeenCalledTimes(1);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
    });

    test('should focus value with Enter', () => {
      const element = { focus: jest.fn() };
      const event = {
        target: {
          classList: {
            contains: jest.fn().mockReturnValue(true),
          },
        },
        currentTarget: {
          ...createElement(0),
          querySelector: jest.fn().mockReturnValue(element),
          classList: { contains: (c) => c === 'listbox-container' },
        },
        nativeEvent: { keyCode: 13 },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleKeyDownForListbox(event);
      expect(keyboard.focus).toHaveBeenCalledTimes(1);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
    });

    test('should change focus with Escape on a row', () => {
      const currentTarget = createElement();
      const target = createElement(0);
      const event = {
        currentTarget,
        target,
        nativeEvent: { keyCode: 27 },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleKeyDownForListbox(event);
      expect(target.classList.contains).toHaveBeenCalledTimes(1);
      expect(target.classList.contains).toHaveBeenCalledWith('listbox-container');
      expect(currentTarget.setAttribute).toHaveBeenCalledTimes(0);
      expect(keyboard.blur).toHaveBeenCalledTimes(1);
      expect(currentTarget.focus).not.toHaveBeenCalled();
      expect(currentTarget.blur).not.toHaveBeenCalled();

      expect(event.preventDefault).not.toHaveBeenCalled;
    });
    test('should change focus with Escape on a listbox', () => {
      const currentTarget = {
        ...createElement(),
        classList: { contains: jest.fn().mockReturnValue(true), add: jest.fn() },
      };
      const target = createElement();
      const event = {
        currentTarget,
        target,
        nativeEvent: { keyCode: 27 },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleKeyDownForListbox(event);
      expect(target.classList.contains).toHaveBeenCalledTimes(1);
      expect(target.classList.contains).toHaveBeenCalledWith('listbox-container');
      expect(currentTarget.setAttribute).not.toHaveBeenCalled();
      expect(currentTarget.blur).not.toHaveBeenCalled();
      expect(currentTarget.focus).not.toHaveBeenCalled();

      expect(currentTarget.setAttribute).not.toHaveBeenCalled();
      expect(currentTarget.blur).not.toHaveBeenCalled();
      expect(currentTarget.focus).not.toHaveBeenCalled();

      expect(event.preventDefault).not.toHaveBeenCalled;
    });
    test('not matched key should not call event methods', () => {
      const element = createElement(0);
      const event = {
        currentTarget: element,
        nativeEvent: { keyCode: 99 },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleKeyDownForListbox(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('handle on hover keyboard navigation on listbox-inline level', () => {
    test('should handle mouse enter when allowed to focus', () => {
      isModal.mockReturnValue(false);
      hovering.current = false;
      handleOnMouseEnter();
      expect(hovering.current).toBe(true);
    });
    test('should handle mouse enter when not allowed to focus', () => {
      app.isInModalSelection = () => true;
      hovering.current = false;
      handleOnMouseEnter();
      expect(hovering.current).toBe(false);
      app.isInModalSelection = () => false;
    });
    test('should handle mouse leave', () => {
      handleOnMouseLeave();
      expect(hovering.current).toBe(false);
    });
    test('should update scroll on hover when UP is pressed', () => {
      const event = {
        currentTarget: createElement(0),
        keyCode: KEYS.ARROW_UP,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleGlobalKeyDown(event);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(updateKeyScroll).toHaveBeenCalledWith({ up: 1 });
    });
    test('should update scroll on hover when DOWN is pressed', () => {
      const event = {
        currentTarget: createElement(0),
        keyCode: KEYS.ARROW_DOWN,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleGlobalKeyDown(event);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(updateKeyScroll).toHaveBeenCalledWith({ down: 1 });
    });
    test('should update scroll on hover when PAGE_UP is pressed', () => {
      const event = {
        currentTarget: createElement(0),
        keyCode: KEYS.PAGE_UP,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleGlobalKeyDown(event);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(updateKeyScroll).toHaveBeenCalledWith({ up: 10 });
    });
    test('should update scroll on hover when PAGE_DOWN is pressed', () => {
      const event = {
        currentTarget: createElement(0),
        keyCode: KEYS.PAGE_DOWN,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleGlobalKeyDown(event);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(updateKeyScroll).toHaveBeenCalledWith({ down: 10 });
    });
    test('should update scroll on hover when HOME is pressed', () => {
      const event = {
        currentTarget: createElement(0),
        keyCode: KEYS.HOME,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleGlobalKeyDown(event);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(updateKeyScroll).toHaveBeenCalledWith({ scrollPosition: 'start' });
    });
    test('should update scroll on hover when CTRL+SHIFT+HOME is pressed', () => {
      const event = {
        currentTarget: createElement(0),
        keyCode: KEYS.HOME,
        ctrlKey: true,
        shiftKey: true,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleGlobalKeyDown(event);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(updateKeyScroll).toHaveBeenCalledWith({ scrollPosition: 'overflowStart' });
    });
    test('should update scroll on hover when END is pressed', () => {
      const event = {
        currentTarget: createElement(0),
        keyCode: KEYS.END,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleGlobalKeyDown(event);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(updateKeyScroll).toHaveBeenCalledWith({ scrollPosition: 'end' });
    });
    test('should update scroll on hover when CTRL+SHIFT+END is pressed', () => {
      const event = {
        currentTarget: createElement(0),
        keyCode: KEYS.END,
        ctrlKey: true,
        shiftKey: true,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };
      handleGlobalKeyDown(event);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(updateKeyScroll).toHaveBeenCalledWith({ scrollPosition: 'overflowEnd' });
    });
  });
});
