import addMainMeasure from '../add-main-measure';
import { addMeasureToColumnOrder, addMeasureToColumnSortOrder } from '../hypercube-utils';

jest.mock('../hyper', () => ({
  addMeasureToColumnOrder: jest.fn(),
  addMeasureToColumnSortOrder: jest.fn(),
}));

describe('addMainMeasure', () => {
  let self;

  beforeEach(() => {
    self = {
      getMeasures: jest.fn(),
      maxMeasures: jest.fn(),
      autoSortMeasure: jest.fn().mockResolvedValue(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should add the measure to the specified index', async () => {
    self.getMeasures.mockReturnValue([{ id: 'measure1' }]);
    self.maxMeasures.mockReturnValue(3);
    const measure = { id: 'measure2' };
    const index = 1;

    const result = await addMainMeasure(self, measure, index);

    expect(self.autoSortMeasure).toHaveBeenCalledWith(measure);
    expect(addMeasureToColumnSortOrder).toHaveBeenCalledWith(self, measure);
    expect(addMeasureToColumnOrder).toHaveBeenCalledWith(self, measure);
    expect(result).toBe(measure);
  });

  test('should return a resolved promise if measures are at the maximum limit', async () => {
    self.getMeasures.mockReturnValue([{ id: 'measure1' }, { id: 'measure2' }]);
    self.maxMeasures.mockReturnValue(2);
    const measure = { id: 'measure3' };

    const result = await addMainMeasure(self, measure);

    expect(result).toBeUndefined();
  });

  test('should handle empty measures array', async () => {
    self.getMeasures.mockReturnValue([]);
    self.maxMeasures.mockReturnValue(3);
    const measure = { id: 'measure1' };

    const result = await addMainMeasure(self, measure);

    expect(result).toBeUndefined();
  });

  test('should handle edge case where maxMeasures is zero', async () => {
    self.getMeasures.mockReturnValue([]);
    self.maxMeasures.mockReturnValue(0);
    const measure = { id: 'measure1' };

    const result = await addMainMeasure(self, measure);

    expect(result).toBeUndefined();
  });
});
