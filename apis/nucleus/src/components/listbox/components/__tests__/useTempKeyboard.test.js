import { renderHook, act, waitFor } from '@testing-library/react';
import useTempKeyboard from '../useTempKeyboard';

describe('useTempKeyboard', () => {
  let containerRef;
  let container;
  let keyboard;
  let getStoreValue;
  const enabled = true;

  beforeEach(() => {
    container = document.createElement('div');
    containerRef = { current: container };
    getStoreValue = jest.fn();
    getStoreValue.mockReturnValue(1);
    const { result } = renderHook(() => useTempKeyboard({ containerRef, enabled, getStoreValue }));
    keyboard = result?.current || {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return correct keyboard state', () => {
    const innerTabStops = false;

    expect(keyboard.enabled).toEqual(enabled);
    expect(keyboard.active).toEqual(false);
    expect(keyboard.innerTabStops).toEqual(innerTabStops);
    expect(typeof keyboard.blur).toEqual('function');
    expect(typeof keyboard.focus).toEqual('function');
    expect(typeof keyboard.focusSelection).toEqual('function');
    expect(typeof keyboard.focusRow).toEqual('function');
    expect(typeof keyboard.focusSearch).toEqual('function');
  });

  it('should set keyboardActive to true when calling focus()', () => {
    expect(keyboard.active).toEqual(false);

    act(() => {
      keyboard.focus();
    });

    waitFor(() => {
      expect(keyboard.active).toEqual(true);
    });
  });

  it('should set keyboardActive to false when calling blur()', async () => {
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

    keyboard.blur(selector);

    expect(elementToFocus).toHaveAttribute('tabIndex', '0');
    expect(elementToFocus).toHaveFocus();
  });

  it('should focus the search field when calling focus()', async () => {
    act(() => {
      keyboard.focus();
    });

    waitFor(() => {
      expect(keyboard.active).toEqual(true);
      expect(keyboard.innerTabStops).toEqual(false);
    });
  });

  describe('focusRow', () => {
    test('should focus on first row as fallback', () => {
      getStoreValue.mockReturnValue(undefined);
      container.innerHTML = `
        <div class="value should-be-focused" tabIndex="-1" data-n="0"></div>
        <div class="value" tabIndex="-1" data-n="1"></div>
        <div class="value" tabIndex="-1" data-n="2"></div>
      `;
      document.body.appendChild(container);

      const focusedRow = keyboard.focusRow();
      expect(focusedRow?.tabIndex).toEqual(0);
      expect(document.activeElement.classList.contains('should-be-focused')).toBeTruthy();

      document.body.removeChild(container);
    });

    test('should focus on the row with data-n equaling 1', () => {
      getStoreValue.mockReturnValue(3);
      container.innerHTML = `
        <div class="value should-be-focused" tabIndex="-1" data-n="0"></div>
        <div class="value" tabIndex="-1" data-n="1"></div>
        <div class="value" tabIndex="-1" data-n="2"></div>
      `;
      document.body.appendChild(container);

      const focusedRow = keyboard.focusRow();
      expect(focusedRow?.tabIndex).toEqual(0);
      expect(document.activeElement.classList.contains('should-be-focused')).toBeTruthy();

      document.body.removeChild(container);
    });

    describe('focusSearch', () => {
      test('should focus on search field', () => {
        container.innerHTML = `
          <div class="search">
            <input type="text">
          </div>
        `;
        document.body.appendChild(container);

        const searchField = keyboard.focusSearch();
        expect(searchField).not.toBeNull();
        expect(document.activeElement).toEqual(searchField);

        document.body.removeChild(container);
      });

      test('should not throw error if search field is not present', () => {
        document.body.appendChild(container);

        const searchField = keyboard.focusSearch();
        expect(searchField).toBeNull();

        document.body.removeChild(container);
      });
    });
  });
});
