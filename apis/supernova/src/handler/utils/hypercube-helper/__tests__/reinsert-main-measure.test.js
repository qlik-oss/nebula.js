import * as hcUtils from '../hypercube-utils';
import reinsertMainMeasure from '../reinsert-main-measure';

describe('reinsertMainMeasure', () => {
  let self;
  let index;
  let insertedMeasure;

  beforeEach(() => {
    index = 1;
    insertedMeasure = { qDef: { cId: 'meas3' } };
    self = {
      hcProperties: {
        qInterColumnSortOrder: [0, 1],
      },
      getMeasures: jest.fn().mockReturnValue([{ qDef: { cId: 'meas1' } }, { qDef: { cId: 'meas2' } }]),
      maxMeasures: jest.fn().mockReturnValue(3),
    };
    jest.spyOn(hcUtils, 'addMeasureToColumnSortOrder').mockReturnValue();
    jest.spyOn(hcUtils, 'moveMeasureColumnOrder').mockReturnValue();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  test('should call updateDimensionOrders if measures are below the maximum limit', async () => {
    await reinsertMainMeasure(self, insertedMeasure, index);

    expect(hcUtils.addMeasureToColumnSortOrder).toHaveBeenCalled();
    expect(hcUtils.moveMeasureColumnOrder).toHaveBeenCalled();
  });

  test('should return a resolved promise if measures are at the maximum limit', async () => {
    self.maxMeasures.mockReturnValue(2);

    const result = await reinsertMainMeasure(self, insertedMeasure, index);

    expect(result).toEqual(insertedMeasure);
    expect(hcUtils.addMeasureToColumnSortOrder).not.toHaveBeenCalled();
    expect(hcUtils.moveMeasureColumnOrder).not.toHaveBeenCalled();
  });

  test('should handle empty measures array', async () => {
    self.getMeasures.mockReturnValue([]);

    await reinsertMainMeasure(self, insertedMeasure, index);

    expect(hcUtils.addMeasureToColumnSortOrder).toHaveBeenCalled();
    expect(hcUtils.moveMeasureColumnOrder).toHaveBeenCalled();
  });

  test('should handle measure when index is undefined', async () => {
    index = undefined;

    await reinsertMainMeasure(self, insertedMeasure, index);

    expect(hcUtils.addMeasureToColumnSortOrder).toHaveBeenCalled();
    expect(hcUtils.moveMeasureColumnOrder).toHaveBeenCalled();
  });
});
