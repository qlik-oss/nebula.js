import { getVizCell, removeInnnerTabStops } from '../listbox-keyboard-navigation-utils';

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
