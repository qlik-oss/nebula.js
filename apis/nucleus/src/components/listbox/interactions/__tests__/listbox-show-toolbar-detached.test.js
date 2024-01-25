import showToolbarDetached from '../listbox-show-toolbar-detached';

const iconsWidth = 28;
const paddingLeft = 9;
const paddingRight = 4;

describe('show listbox toolbar detached', () => {
  it('should return true if there is not enough space for toolbar', () => {
    const containerRect = { width: 100 };
    const titleRef = { current: { clientWidth: 50, scrollWidth: 80, offsetWidth: 81 } };
    expect(showToolbarDetached({ containerRect, titleRef, iconsWidth, paddingLeft, paddingRight })).toStrictEqual(true);
  });

  it('should return true if title is truncated', () => {
    const containerRect = { width: 300 };
    const titleRef = {
      current: { clientWidth: 60, scrollWidth: 200, offsetWidth: 199, paddingLeft, paddingRight },
    };
    expect(showToolbarDetached({ containerRect, titleRef, iconsWidth })).toStrictEqual(true);
  });

  it('should return false if there is enough space for title and toolbar', () => {
    const containerRect = { width: 300 };
    const titleRef = {
      current: { clientWidth: 60, scrollWidth: 200, offsetWidth: 201, paddingLeft, paddingRight },
    };
    expect(showToolbarDetached({ containerRect, titleRef, iconsWidth })).toStrictEqual(false);
  });
});
