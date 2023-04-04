import { renderHook, act, waitFor } from '@testing-library/react';
import useTempKeyboard from '../useTempKeyboard';

describe('useTempKeyboard', () => {
  let containerRef;
  let container;
  const enabled = true;

  beforeEach(() => {
    container = document.createElement('div');
    containerRef = { current: container };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return correct keyboard state', () => {
    const innerTabStops = false;

    const { result } = renderHook(() => useTempKeyboard({ containerRef, enabled }));
    const keyboard = result?.current || {};

    expect(keyboard.enabled).toEqual(enabled);
    expect(keyboard.active).toEqual(false);
    expect(keyboard.innerTabStops).toEqual(innerTabStops);
    expect(typeof keyboard.blur).toEqual('function');
    expect(typeof keyboard.focus).toEqual('function');
    expect(typeof keyboard.focusSelection).toEqual('function');
  });

  it('should set keyboardActive to true when calling focus()', () => {
    const { result } = renderHook(() => useTempKeyboard({ containerRef, enabled }));
    const keyboard = result?.current || {};

    expect(keyboard.active).toEqual(false);

    act(() => {
      keyboard.focus();
    });

    waitFor(() => {
      expect(keyboard.active).toEqual(true);
    });
  });

  it('should set keyboardActive to false when calling blur()', async () => {
    const { result } = renderHook(() => useTempKeyboard({ containerRef, enabled }));
    const keyboard = result.current;

    act(() => {
      keyboard.focus();
    });

    act(() => {
      keyboard.blur();
    });

    waitFor(() => {
      expect(keyboard.active).toEqual(false);
      expect(keyboard.innerTabStops).toEqual(true);
    });
  });

  it('should set tabIndex to 0 and focus viz cell when resetFocus is true (and vizCell is available)', () => {
    const vizCell = document.createElement('div');
    containerRef.current.appendChild(vizCell);
    containerRef.current.classList.add('njs-cell');
    document.body.appendChild(containerRef.current);

    const { result } = renderHook(() => useTempKeyboard({ containerRef, enabled: true }));
    const keyboard = result.current;

    act(() => {
      keyboard.blur(true);
    });

    waitFor(() => {
      expect(vizCell).toHaveAttribute('tabIndex', '0');
      expect(document.activeElement).toBe(vizCell);
    });

    document.body.removeChild(containerRef.current);
  });

  it('should focus specified element when resetFocus is a string', () => {
    const elementToFocus = document.createElement('div');
    elementToFocus.id = 'element-to-focus';
    document.body.appendChild(elementToFocus);
    const selector = '#element-to-focus';

    const { result } = renderHook(() => useTempKeyboard({ containerRef, enabled }));
    const keyboard = result.current;

    keyboard.blur(selector);

    expect(elementToFocus).toHaveAttribute('tabIndex', '0');
    expect(elementToFocus).toHaveFocus();
  });

  it('should focus the search field when calling focus()', async () => {
    const { result } = renderHook(() => useTempKeyboard({ containerRef, enabled }));
    const keyboard = result.current;

    act(() => {
      keyboard.focus();
    });

    waitFor(() => {
      expect(keyboard.active).toEqual(true);
      expect(keyboard.innerTabStops).toEqual(false);
    });
  });
});
