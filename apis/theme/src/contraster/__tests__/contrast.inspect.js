import contrast from '../contrast';

describe('contrast', () => {
  test('should be 1 for same luminance', () => {
    expect(contrast(0, 0)).toBe(1);
  });

  test('should be 21 when delta in luminance is 1', () => {
    expect(contrast(0, 1)).toBe(21);
  });

  test('should return same value even when luminances are in wrong order', () => {
    const v = 2.6;
    const lums = [0.2, 0.6];
    expect(contrast(...lums)).toBe(v);
    expect(contrast(...lums.reverse())).toBe(v);
  });

  test('should be 1.72727 when luminances are [0.9, 0.5]', () => {
    expect(contrast(0.9, 0.5)).toBe(1.72727);
  });
});
