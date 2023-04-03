import getTabIndex from '../get-tab-index';

describe('getTabIndex', () => {
  it('should return -1 when lastFocusedRow is not defined and index is not 0', () => {
    const result = getTabIndex({ index: 1, cell: { qElemNumber: 1 } });
    expect(result).toEqual(-1);
  });

  it('should return 0 when lastFocusedRow is not defined and index is 0', () => {
    const result = getTabIndex({ index: 0, cell: { qElemNumber: 1 } });
    expect(result).toEqual(0);
  });

  it('should return -1 when lastFocusedRow is defined but not equal to cell.qElemNumber', () => {
    const result = getTabIndex({ index: 1, lastFocusedRow: 2, cell: { qElemNumber: 1 } });
    expect(result).toEqual(-1);
  });

  it('should return 0 when lastFocusedRow is defined and equal to cell.qElemNumber', () => {
    const result = getTabIndex({ index: 1, lastFocusedRow: 1, cell: { qElemNumber: 1 } });
    expect(result).toEqual(0);
  });
});
