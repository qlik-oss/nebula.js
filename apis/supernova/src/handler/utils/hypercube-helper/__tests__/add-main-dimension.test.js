import addMainDimension from '../add-main-dimension';
import updateDimensionOrders from '../update-dimension-orders';

jest.mock('../update-dimension-orders', () => jest.fn().mockReturnValue({ qDef: { cId: 'dim3' } }));

describe('addMainDimension', () => {
  let self;
  let index;
  let newDimension;

  beforeEach(() => {
    index = 1;
    newDimension = { qDef: { cId: 'dim3' } };
    self = {
      getDimensions: jest.fn().mockReturnValue([{ qDef: { cId: 'dim1' } }, { qDef: { cId: 'dim2' } }]),
      maxDimensions: jest.fn().mockReturnValue(3),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should call updateDimensionOrders if dimensions are below the maximum limit', () => {
    const result = addMainDimension(self, newDimension, index);

    expect(result).toEqual(newDimension);
    expect(updateDimensionOrders).toHaveBeenCalledWith(self, newDimension, index);
  });

  test('should return a resolved promise if dimensions are at the maximum limit', async () => {
    self.maxDimensions.mockReturnValue(2);

    const result = await addMainDimension(self, newDimension, index);

    expect(result).toEqual(newDimension);
    expect(updateDimensionOrders).not.toHaveBeenCalled();
  });

  test('should handle empty dimensions array', () => {
    self.getDimensions.mockReturnValue([]);

    const result = addMainDimension(self, newDimension, index);

    expect(result).toEqual(newDimension);
    expect(updateDimensionOrders).toHaveBeenCalledWith(self, newDimension, index);
  });

  test('should handle dimension when index is undefined', async () => {
    index = undefined;

    const result = await addMainDimension(self, newDimension, index);

    expect(result).toEqual(newDimension);
    expect(updateDimensionOrders).toHaveBeenCalledWith(self, newDimension, 2);
  });
});
