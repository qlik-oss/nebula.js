import addDimensionOrders from '../add-dimension-orders';
import { addDimensionToColumnOrder, addDimensionToColumnSortOrder } from '../hypercube-utils';

jest.mock('../hypercube-utils', () => ({
  addDimensionToColumnOrder: jest.fn(),
  addDimensionToColumnSortOrder: jest.fn(),
}));

describe('updateDimensionOrders', () => {
  let self;
  let dimension;

  beforeEach(() => {
    self = {
      autoSortDimension: jest.fn().mockResolvedValue(),
    };
    dimension = ['dim1', 'dim2', 'dim3'];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should add dimension to the specified index', async () => {
    const newDimension = { id: 'dim4' };
    const idx = 1;

    const result = await addDimensionOrders(self, newDimension, idx);

    expect(dimension[idx]).toEqual(newDimension); // Verify dimension is added at the correct index
    expect(result).toEqual(newDimension); // Verify the returned dimension
  });

  test('should call autoSortDimension with the correct dimension', async () => {
    const newDimension = { id: 'dim4' };
    const idx = 1;

    await addDimensionOrders(self, newDimension, idx);

    expect(self.autoSortDimension).toHaveBeenCalledWith(newDimension); // Verify autoSortDimension is called
  });

  test('should call addDimensionToColumnSortOrder', async () => {
    const newDimension = { id: 'dim4' };
    const idx = 1;

    await addDimensionOrders(self, newDimension, idx);

    expect(addDimensionToColumnSortOrder).toHaveBeenCalledWith(self, newDimension); // Verify addDimensionToColumnSortOrder is called
  });

  test('should call addDimensionToColumnOrder', async () => {
    const newDimension = { id: 'dim4' };
    const idx = 1;

    await addDimensionOrders(self, newDimension, idx);

    expect(addDimensionToColumnOrder).toHaveBeenCalledWith(self, newDimension); // Verify addDimensionToColumnOrder is called
  });

  test('should return the updated dimension', async () => {
    const newDimension = { id: 'dim4' };
    const idx = 1;

    const result = await addDimensionOrders(self, newDimension, idx);

    expect(result).toEqual(newDimension); // Verify the returned dimension
  });
});
