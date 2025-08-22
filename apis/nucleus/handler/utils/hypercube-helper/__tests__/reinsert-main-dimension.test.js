import reinsertMainDimension from '../reinsert-main-dimension';
import * as hcUtils from '../hypercube-utils';

describe('reinsertMainDimension', () => {
  let self;
  let index;
  let insertedDimension;

  beforeEach(() => {
    index = 1;
    insertedDimension = { qDef: { cId: 'dim3' } };
    self = {
      hcProperties: {
        qInterColumnSortOrder: [0, 1],
      },
      getDimensions: jest.fn().mockReturnValue([{ qDef: { cId: 'dim1' } }, { qDef: { cId: 'dim2' } }]),
      maxDimensions: jest.fn().mockReturnValue(3),
    };
    jest.spyOn(hcUtils, 'addDimensionToColumnSortOrder').mockReturnValue();
    jest.spyOn(hcUtils, 'moveDimensionToColumnOrder').mockReturnValue();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  test('should call updateDimensionOrders if dimensions are below the maximum limit', async () => {
    await reinsertMainDimension(self, insertedDimension, index);

    expect(hcUtils.addDimensionToColumnSortOrder).toHaveBeenCalled();
    expect(hcUtils.moveDimensionToColumnOrder).toHaveBeenCalled();
  });

  test('should return a resolved promise if dimensions are at the maximum limit', async () => {
    self.maxDimensions.mockReturnValue(2);

    const result = await reinsertMainDimension(self, insertedDimension, index);

    expect(result).toEqual(insertedDimension);
    expect(hcUtils.addDimensionToColumnSortOrder).not.toHaveBeenCalled();
    expect(hcUtils.moveDimensionToColumnOrder).not.toHaveBeenCalled();
  });

  test('should handle empty dimensions array', async () => {
    self.getDimensions.mockReturnValue([]);

    await reinsertMainDimension(self, insertedDimension, index);

    expect(hcUtils.addDimensionToColumnSortOrder).toHaveBeenCalled();
    expect(hcUtils.moveDimensionToColumnOrder).toHaveBeenCalled();
  });

  test('should handle dimension when index is undefined', async () => {
    index = undefined;

    await reinsertMainDimension(self, insertedDimension, index);

    expect(hcUtils.addDimensionToColumnSortOrder).toHaveBeenCalled();
    expect(hcUtils.moveDimensionToColumnOrder).toHaveBeenCalled();
  });
});
