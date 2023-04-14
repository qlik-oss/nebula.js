/* eslint-disable import/prefer-default-export */
export const createElement = (levels = 3) => ({
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
