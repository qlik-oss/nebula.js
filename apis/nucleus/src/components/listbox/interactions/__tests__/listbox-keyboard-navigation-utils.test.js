import { getVizCell, removeInnnerTabStops, focusSearch, focusRow } from '../listbox-keyboard-navigation-utils';

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

describe('focusRow', () => {
  test('should focus on the first row with a tabIndex of 0', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="value" tabIndex="-1"></div>
      <div class="value" tabIndex="0"></div>
      <div class="value" tabIndex="-1"></div>
    `;
    document.body.appendChild(container);

    const focusedRow = focusRow(container);
    expect(focusedRow?.tabIndex).toEqual(0);
    expect(document.activeElement).toEqual(focusedRow);

    document.body.removeChild(container);
  });

  test('should return null when there is no row with a tabIndex of 0', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="value" tabIndex="-1"></div>
      <div class="value" tabIndex="-1"></div>
      <div class="value" tabIndex="-1"></div>
    `;
    document.body.appendChild(container);

    const focusedRow = focusRow(container);
    expect(focusedRow).toBeNull();

    document.body.removeChild(container);
  });

  test('should return undefined when the container is null', () => {
    const focusedRow = focusRow(null);
    expect(focusedRow).toBeUndefined();
  });

  describe('focusSearch', () => {
    test('should focus on search field', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div class="search">
          <input type="text">
        </div>
      `;
      document.body.appendChild(container);

      const searchField = focusSearch(container);
      expect(searchField).not.toBeNull();
      expect(document.activeElement).toEqual(searchField);

      document.body.removeChild(container);
    });

    test('should not throw error if container is null', () => {
      const searchField = focusSearch(null);
      expect(searchField).toBeUndefined();
    });

    test('should not throw error if search field is not present', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const searchField = focusSearch(container);
      expect(searchField).toBeNull();

      document.body.removeChild(container);
    });
  });
});
