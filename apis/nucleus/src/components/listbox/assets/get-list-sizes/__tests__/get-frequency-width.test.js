import getFrequencyWidth from '../get-frequency-width';

describe('getFrequencyWidth', () => {
  test('should return frequencyTextWidth', () => {
    const w = getFrequencyWidth({ frequencyTextWidth: 50, columnWidth: 200 });
    expect(w).toBe(50);
  });

  test('should use min value since other values go below the range', () => {
    const w = getFrequencyWidth({ frequencyTextWidth: 30, columnWidth: 200 });
    expect(w).toBe(40);
  });

  test('should use the max value of 30% of the columnWidth since other values go above the range', () => {
    const w = getFrequencyWidth({ frequencyTextWidth: 100, columnWidth: 200 });
    expect(w).toBe(60); // because: columnWidth * 0.3 = 60 and 100 is above that limit
  });
});
