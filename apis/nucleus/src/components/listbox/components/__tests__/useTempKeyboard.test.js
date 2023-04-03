import { renderHook, act, waitFor } from '@testing-library/react';
import useTempKeyboard, { getVizCell, removeInnnerTabStops, removeLastFocused } from '../useTempKeyboard';

describe('removeInnnerTabStops', () => {
  it('should reset tabIndex in elements with tabIndex="0"', () => {
    const container = document.createElement('div');
    const button1 = document.createElement('button');
    button1.tabIndex = 0;
    const button2 = document.createElement('button');
    button2.tabIndex = 1;
    container.appendChild(button1);
    container.appendChild(button2);
    removeInnnerTabStops(container);
    expect(button1.tabIndex).toBe(-1);
    expect(button2.tabIndex).toBe(1);
  });

  it('should not throw when container is null or undefined', () => {
    expect(() => removeInnnerTabStops(null)).not.toThrow();
    expect(() => removeInnnerTabStops(undefined)).not.toThrow();
  });
});

describe('removeLastFocused', () => {
  it('removes "last-focused" class from elements with that class', () => {
    const container = document.createElement('div');
    const button1 = document.createElement('button');
    button1.classList.add('last-focused');
    const button2 = document.createElement('button');
    button2.classList.add('last-focused');
    container.appendChild(button1);
    container.appendChild(button2);
    removeLastFocused(container);
    expect(button1.classList.contains('last-focused')).toBe(false);
    expect(button2.classList.contains('last-focused')).toBe(false);
  });
});

describe('getVizCell', () => {
  ['njs-cell', 'qv-gridcell'].forEach((cellClassName) => {
    it(`returns the closest ancestor element with class ${cellClassName}`, () => {
      const container = document.createElement('div');
      const cell = document.createElement('div');
      cell.classList.add(cellClassName);
      const child = document.createElement('button');
      container.appendChild(cell);
      cell.appendChild(child);
      const result = getVizCell(child);
      expect(result).toBe(cell);
    });
  });

  it('returns null if no ancestor element has the required class', () => {
    const container = document.createElement('div');
    const child = document.createElement('button');
    container.appendChild(child);
    const result = getVizCell(child);
    expect(result).toBe(null);
  });
});

describe('useTempKeyboard', () => {
  let containerRef;
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    containerRef = { current: container };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return correct keyboard state', () => {
    const enabled = true;
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
    const enabled = true;

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
});
