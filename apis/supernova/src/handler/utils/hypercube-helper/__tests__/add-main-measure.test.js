import addMainMeasure from '../add-main-measure';
import * as hcUtils from '../hypercube-utils';

describe('addMainMeasure', () => {
  let self;
  let index;
  const newMeasure = { qDef: { cId: 'meas3' } };

  beforeEach(() => {
    index = 1;
    self = {
      hcProperties: {
        qMeasures: [{ qDef: { cId: 'meas1' } }, { qDef: { cId: 'meas2' } }],
        qInterColumnSortOrder: [1, 0, 2],
        qLayoutExclude: {
          qHyperCubeDef: {
            qDimensions: [],
            qMeasures: [],
          },
        },
      },
      autoSortMeasure: jest.fn().mockResolvedValue(),
      getMeasures: jest.fn().mockReturnValue([{ qDef: { cId: 'meas1' } }, { qDef: { cId: 'meas2' } }]),
      getDimensions: jest.fn().mockReturnValue([{ qDef: { cId: 'dim1' } }]),
      maxMeasures: jest.fn().mockReturnValue(4),
    };
    jest.spyOn(hcUtils, 'addMeasureToColumnOrder').mockResolvedValue();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should add the measure to the specified index', async () => {
    const result = await addMainMeasure(self, newMeasure, index);

    expect(result).toBe(newMeasure);
    expect(self.autoSortMeasure).toHaveBeenCalledWith(newMeasure);
    expect(self.hcProperties.qInterColumnSortOrder).toEqual([1, 0, 2, 3]);
  });

  test('should return a resolved promise if measures are at the maximum limit', async () => {
    self.maxMeasures.mockReturnValue(2);

    const result = await addMainMeasure(self, newMeasure, index);

    expect(result).toEqual(newMeasure);
    expect(self.autoSortMeasure).not.toHaveBeenCalledWith(newMeasure);
    expect(self.hcProperties.qInterColumnSortOrder).toEqual([1, 0, 2]);
  });

  test('should handle empty measures array', async () => {
    self.getMeasures.mockReturnValue([]);
    // Have only a dimension in the layout
    self.hcProperties.qInterColumnSortOrder = [0];

    const result = await addMainMeasure(self, newMeasure, index);

    expect(result).toEqual(newMeasure);
    expect(self.autoSortMeasure).toHaveBeenCalledWith(newMeasure);
    expect(self.hcProperties.qInterColumnSortOrder).toEqual([0, 1]);
  });

  test('should handle measure when index is undefined', async () => {
    index = undefined;
    const result = await addMainMeasure(self, newMeasure, index);

    expect(result).toEqual(newMeasure);
    expect(self.autoSortMeasure).toHaveBeenCalledWith(newMeasure);
    expect(self.hcProperties.qInterColumnSortOrder).toEqual([1, 0, 2, 3]);
  });
});
