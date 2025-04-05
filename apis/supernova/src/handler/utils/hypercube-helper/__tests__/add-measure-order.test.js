import addMeasureOrders from '../add-measure-orders';

jest.mock('../hypercube-utils', () => ({
  addMeasureToColumnOrder: jest.fn(),
  addMeasureToColumnSortOrder: jest.fn(),
}));

describe('addMeasureOrders', () => {
  let self;
  let measures;
  const idx = 1;
  const measure = { id: 'measure3' };

  beforeEach(() => {
    self = {
      autoSortMeasure: jest.fn().mockResolvedValue(),
    };
    measures = [{ id: 'measure1' }, { id: 'measure2' }];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should add the measure to the specified index', async () => {
    await addMeasureOrders(self, measure, measures, idx);

    expect(measures).toEqual([{ id: 'measure1' }, { id: 'measure3' }, { id: 'measure2' }]);
  });

  test('should call autoSortMeasure with the correct measure', async () => {
    await addMeasureOrders(self, measure, measures, idx);

    expect(self.autoSortMeasure).toHaveBeenCalledWith(measure);
  });

  test('should return the measure after all operations', async () => {
    const result = await addMeasureOrders(self, measure, measures, idx);

    expect(result).toBe(measure);
  });
});
