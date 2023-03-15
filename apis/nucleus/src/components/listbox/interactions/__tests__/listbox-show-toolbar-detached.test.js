import showToolbarDetached from '../listbox-show-toolbar-detached';

const iconsWidth = 28;

describe('show listbox toolbar detached', () => {
  it('should return true if there is not enough space for toolbar', () => {
    const containerRef = { current: { clientWidth: 100 } };
    const titleRef = { current: { clientWidth: 60, scrollWidth: 80, offsetWidth: 81 } };
    expect(showToolbarDetached({ containerRef, titleRef, iconsWidth })).toBe(true);
  });

  it('should return true if title is truncated', () => {
    const containerRef = { current: { clientWidth: 300 } };
    const titleRef = { current: { clientWidth: 60, scrollWidth: 200, offsetWidth: 199 } };
    expect(showToolbarDetached({ containerRef, titleRef, iconsWidth })).toBe(true);
  });

  it('should return false if there is enough space for title and toolbar', () => {
    const containerRef = { current: { clientWidth: 300 } };
    const titleRef = { current: { clientWidth: 60, scrollWidth: 200, offsetWidth: 201 } };
    expect(showToolbarDetached({ containerRef, titleRef, iconsWidth })).toBe(false);
  });
});
