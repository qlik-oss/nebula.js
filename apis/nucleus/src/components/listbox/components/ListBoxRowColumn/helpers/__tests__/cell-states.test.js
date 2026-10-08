import { getValueStateClasses } from '../cell-states';
import classes from '../classes';

describe('getValueStateClasses', () => {
  const cell = { qState: 'O' };

  test('should add the bottom border class by default', () => {
    expect(getValueStateClasses({ cell })).toContain(classes.rowBorderBottom);
  });

  test('should omit the bottom border class when skipBottomDivider is true', () => {
    expect(getValueStateClasses({ cell, skipBottomDivider: true })).not.toContain(classes.rowBorderBottom);
  });

  test('should omit the bottom border class for histograms', () => {
    expect(getValueStateClasses({ cell, histogram: true })).not.toContain(classes.rowBorderBottom);
  });

  test('should return no classes without a cell', () => {
    expect(getValueStateClasses({ skipBottomDivider: true })).toEqual([]);
  });
});
