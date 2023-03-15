import getHorizontalMinBatchSize from '../horizontal-minimum-batch-size';

describe('horizontal-minimum-batch-size', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should calculate min batch size as expected', () => {
    const minSize = getHorizontalMinBatchSize({ width: 10, columnWidth: 2, listHeight: 100, itemHeight: 30 });
    expect(minSize).toEqual(40);
  });

  it('should calculate min batch size as expected again', () => {
    const minSize = getHorizontalMinBatchSize({ width: 20, columnWidth: 3, listHeight: 50, itemHeight: 25 });
    expect(minSize).toEqual(28);
  });
});
