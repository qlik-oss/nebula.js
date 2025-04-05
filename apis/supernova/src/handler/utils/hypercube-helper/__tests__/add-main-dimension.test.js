import addDimensionOrders from '../add-dimension-orders';
import addMainDimension from '../add-main-dimension';

jest.mock('../add-dimension-orders', () => jest.fn());

describe('addMainDimension', () => {
  let self;

  beforeEach(() => {
    self = {
      getDimensions: jest.fn(),
      maxDimensions: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should call updateDimensionOrders if dimensions are below the maximum limit', () => {
    self.getDimensions.mockReturnValue([{ id: 'dim1' }]);
    self.maxDimensions.mockReturnValue(3);
    const dimension = { id: 'dim2' };
    const index = 1;

    addMainDimension(self, dimension, index);

    expect(addDimensionOrders).toHaveBeenCalledWith(self, dimension, [{ id: 'dim1' }], index);
  });

  test('should return a resolved promise if dimensions are at the maximum limit', async () => {
    self.getDimensions.mockReturnValue([{ id: 'dim1' }, { id: 'dim2' }]);
    self.maxDimensions.mockReturnValue(2);
    const dimension = { id: 'dim3' };

    const result = await addMainDimension(self, dimension);

    expect(addDimensionOrders).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  test('should handle empty dimensions array', () => {
    self.getDimensions.mockReturnValue([]);
    self.maxDimensions.mockReturnValue(3);
    const dimension = { id: 'dim1' };

    addMainDimension(self, dimension);

    expect(addDimensionOrders).toHaveBeenCalledWith(self, dimension, [], 0);
  });

  test('should handle edge case where maxDimensions is zero', async () => {
    self.getDimensions.mockReturnValue([]);
    self.maxDimensions.mockReturnValue(0);
    const dimension = { id: 'dim1' };

    const result = await addMainDimension(self, dimension);

    expect(addDimensionOrders).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});
