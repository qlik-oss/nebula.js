import contrast from '../contrast';

describe('contrast', () => {
  it('should be 1 for same luminance', () => {
    expect(contrast(0, 0)).to.equal(1);
  });

  it('should be 21 when delta in luminance is 1', () => {
    expect(contrast(0, 1)).to.equal(21);
  });

  it('should return same value even when luminances are in wrong order', () => {
    const v = 2.6;
    const lums = [0.2, 0.6];
    expect(contrast(...lums)).to.equal(v);
    expect(contrast(...lums.reverse())).to.equal(v);
  });

  it('should be 1.72727 when luminances are [0.9, 0.5]', () => {
    expect(contrast(0.9, 0.5)).to.equal(1.72727);
  });
});
