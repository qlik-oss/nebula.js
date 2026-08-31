import luminance from '../luminance';

describe('luminance', () => {
  test('for #ffffff should be 1', () => {
    expect(luminance('#ffffff')).toBe(1);
  });

  test('for #000000 should be 0', () => {
    expect(luminance('#000000')).toBe(0);
  });

  test('for #ff6633 should be 0.31002', () => {
    expect(luminance('#ff6633')).toBe(0.31002);
  });

  test('for an invalid color should break and return 0', () => {
    expect(luminance('i am not a color')).toBe(0);
  });
});
