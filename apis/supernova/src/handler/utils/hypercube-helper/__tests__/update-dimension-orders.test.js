import updateDimensionOrders from '../update-dimension-orders';
import * as hcUtils from '../hypercube-utils';

describe('updateDimensionOrders', () => {
  let self;
  let newDimension;
  let index;

  beforeEach(() => {
    self = {
      hcProperties: {
        qDimensions: [{ qDef: { cId: 'dim1' } }, { qDef: { cId: 'dim2' } }],
        qInterColumnSortOrder: [1, 0],
        qLayoutExclude: {
          qHyperCubeDef: {
            qDimensions: [],
            qMeasures: [],
          },
        },
      },
      autoSortDimension: jest.fn().mockResolvedValue(),
      getDimensions: jest.fn().mockReturnValue([{ qDef: { cId: 'dim1' } }, { qDef: { cId: 'dim2' } }]),
    };
    newDimension = { qDef: { cId: 'dim3' } };
    index = 1;
    jest.spyOn(hcUtils, 'addDimensionToColumnOrder').mockResolvedValue();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should add dimension to the specified index', async () => {
    const result = await updateDimensionOrders(self, newDimension, index);

    expect(result).toEqual(newDimension);
    expect(self.autoSortDimension).toHaveBeenCalledWith(newDimension);
    expect(self.hcProperties.qInterColumnSortOrder).toEqual([2, 0, 1]);
  });

  test('should handle adding dimension to the default order when index is not defined ', async () => {
    index = undefined;
    const result = await updateDimensionOrders(self, newDimension, index);

    expect(result).toEqual(newDimension);
    expect(self.autoSortDimension).toHaveBeenCalledWith(newDimension);
    expect(self.hcProperties.qInterColumnSortOrder).toEqual([1, 0, 2]);
  });
});
