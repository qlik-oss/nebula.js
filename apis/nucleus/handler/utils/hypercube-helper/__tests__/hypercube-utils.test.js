import uid from '../../../../src/object/uid';
import * as hcUtils from '../hypercube-utils';

jest.mock('../../../../src/object/uid', () => jest.fn());

describe('replaceDimensionToColumnOrder', () => {
  let self;
  let dimension;
  let replacedDimension;
  let index;

  beforeEach(() => {
    index = 1;
    uid.mockReturnValue('dim3Id');

    self = {
      getDimensions: jest.fn().mockReturnValue([{ qDef: { cId: 'dimId1' } }, { qDef: { cId: 'dimId2' } }]),
      dimensionDefinition: {
        replace: jest.fn(),
      },
      properties: {},
    };

    dimension = { qDef: { cId: 'dim3Id' } };
    replacedDimension = { qDef: { cId: 'dimId2' } };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should replace the dimension at the specified index', () => {
    const result = hcUtils.replaceDimensionOrder(self, index, dimension);

    expect(result).toEqual({
      qDef: { cId: 'dim3Id' },
    });
    expect(self.getDimensions()).toEqual([{ qDef: { cId: 'dimId1' } }, { qDef: { cId: 'dim3Id' } }]);
  });

  test('should call dimensionDefinition.replace with the correct arguments', () => {
    hcUtils.replaceDimensionOrder(self, index, dimension);

    expect(self.dimensionDefinition.replace).toHaveBeenCalledWith(
      { qDef: { cId: 'dim3Id' } },
      replacedDimension,
      index,
      self.properties,
      self
    );
  });

  test('should not replace dimension when the dimensionDefinition.replace is undefined', () => {
    self.dimensionDefinition.replace = undefined;
    hcUtils.replaceDimensionOrder(self, index, dimension);

    expect(self.getDimensions()).toEqual([{ qDef: { cId: 'dimId1' } }, { qDef: { cId: 'dim3Id' } }]);
  });

  test('should not replace any order when the given dimension is undefined', () => {
    dimension = undefined;
    const result = hcUtils.replaceDimensionOrder(self, index, dimension);

    expect(result).toBeUndefined();
    expect(self.getDimensions()).toEqual([{ qDef: { cId: 'dimId1' } }, { qDef: { cId: 'dimId2' } }]);
  });
});

describe('MoveMeasure', () => {
  let measures;
  let altMeasures;

  beforeEach(() => {
    measures = [{ qDef: { cId: 'meas1' } }, { qDef: { cId: 'meas2' } }];
    altMeasures = [{ qDef: { cId: 'altMeas1' } }, { qDef: { cId: 'altMeas2' } }, { qDef: { cId: 'altMeas3' } }];
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('moveMeasureFromEnabledToDisabled', () => {
    test('moves a measure from main to alternative at correct index', async () => {
      const result = await hcUtils.moveMeasureFromMainToAlternative(1, 3, measures, altMeasures);

      expect(result).toEqual({ qDef: { cId: 'meas2' } });
      expect(measures).toEqual([{ qDef: { cId: 'meas1' } }, { qDef: { cId: 'altMeas1' } }]);
      expect(altMeasures).toEqual([
        { qDef: { cId: 'altMeas2' } },
        { qDef: { cId: 'meas2' } },
        { qDef: { cId: 'altMeas3' } },
      ]);
    });

    test('should handle empty main measures array', async () => {
      measures = [];

      const result = await hcUtils.moveMeasureFromMainToAlternative(0, 0, measures, altMeasures);

      expect(result).toEqual({ qDef: { cId: 'altMeas1' } });
      expect(measures).toEqual([]);
      expect(altMeasures).toEqual([
        { qDef: { cId: 'altMeas1' } },
        { qDef: { cId: 'altMeas2' } },
        { qDef: { cId: 'altMeas3' } },
      ]);
    });

    test('should handle empty alternative measures array', async () => {
      altMeasures = [];

      const result = await hcUtils.moveMeasureFromMainToAlternative(1, 2, measures, altMeasures);

      expect(result).toEqual({ qDef: { cId: 'meas2' } });
      expect(measures).toEqual([{ qDef: { cId: 'meas1' } }, undefined]);
      expect(altMeasures).toEqual([{ qDef: { cId: 'meas2' } }]);
    });

    test('should add undefined if fromIndex is out of bounds', async () => {
      const result = await hcUtils.moveMeasureFromMainToAlternative(10, 1, measures, altMeasures);

      expect(result).toBeUndefined();
      expect(measures).toEqual([{ qDef: { cId: 'meas1' } }, { qDef: { cId: 'meas2' } }, { qDef: { cId: 'altMeas1' } }]);
      expect(altMeasures).toEqual([{ qDef: { cId: 'altMeas2' } }, undefined, { qDef: { cId: 'altMeas3' } }]);
    });

    test('should handle it if toIndex is out of bounds', async () => {
      const result = await hcUtils.moveMeasureFromMainToAlternative(1, 10, measures, altMeasures);

      expect(result).toEqual({ qDef: { cId: 'meas2' } });
      expect(measures).toEqual([{ qDef: { cId: 'meas1' } }, { qDef: { cId: 'altMeas1' } }]);
      expect(altMeasures).toEqual([
        { qDef: { cId: 'altMeas2' } },
        { qDef: { cId: 'altMeas3' } },
        { qDef: { cId: 'meas2' } },
      ]);
    });
  });

  describe('moveMeasureFromAlternativeToMain', () => {
    beforeEach(() => {
      measures = [{ qDef: { cId: 'meas1' } }, { qDef: { cId: 'meas2' } }];
      altMeasures = [{ qDef: { cId: 'altMeas1' } }, { qDef: { cId: 'altMeas2' } }, { qDef: { cId: 'altMeas3' } }];
    });

    test('moves a measure from alternative to main at correct index', async () => {
      const result = await hcUtils.moveMeasureFromAlternativeToMain(2, 1, measures, altMeasures);

      expect(result).toEqual({ qDef: { cId: 'altMeas1' } });
      expect(measures).toEqual([{ qDef: { cId: 'meas1' } }, { qDef: { cId: 'altMeas1' } }]);
      expect(altMeasures).toEqual([
        { qDef: { cId: 'meas2' } },
        { qDef: { cId: 'altMeas2' } },
        { qDef: { cId: 'altMeas3' } },
      ]);
    });

    test('should handle empty main measures array', async () => {
      measures = [];

      const result = await hcUtils.moveMeasureFromAlternativeToMain(0, 0, measures, altMeasures);

      expect(result).toEqual({ qDef: { cId: 'altMeas1' } });
      expect(measures).toEqual([{ qDef: { cId: 'altMeas1' } }]);
      expect(altMeasures).toEqual([undefined, { qDef: { cId: 'altMeas2' } }, { qDef: { cId: 'altMeas3' } }]);
    });

    test('should handle empty alternative measures array', async () => {
      altMeasures = [];

      const result = await hcUtils.moveMeasureFromAlternativeToMain(1, 2, measures, altMeasures);

      expect(result).toEqual({ qDef: { cId: 'meas2' } });
      expect(measures).toEqual([{ qDef: { cId: 'meas1' } }, { qDef: { cId: 'meas2' } }]);
      expect(altMeasures).toEqual([]);
    });

    test('should add undefined if fromIndex is out of bounds', async () => {
      const result = await hcUtils.moveMeasureFromAlternativeToMain(10, 1, measures, altMeasures);

      expect(result).toBeUndefined();
      expect(measures).toEqual([{ qDef: { cId: 'meas1' } }, undefined]);
      expect(altMeasures).toEqual([
        { qDef: { cId: 'meas2' } },
        { qDef: { cId: 'altMeas1' } },
        { qDef: { cId: 'altMeas2' } },
        { qDef: { cId: 'altMeas3' } },
      ]);
    });

    test('should handle it if toIndex is out of bounds', async () => {
      const result = await hcUtils.moveMeasureFromAlternativeToMain(1, 10, measures, altMeasures);

      expect(result).toEqual({ qDef: { cId: 'meas2' } });
      expect(measures).toEqual([{ qDef: { cId: 'meas1' } }, { qDef: { cId: 'meas2' } }]);
      expect(altMeasures).toEqual([
        { qDef: { cId: 'altMeas1' } },
        { qDef: { cId: 'altMeas2' } },
        { qDef: { cId: 'altMeas3' } },
      ]);
    });
  });
});

describe('MoveDimension', () => {
  let measures;
  let altMeasures;

  beforeEach(() => {
    measures = [{ qDef: { cId: 'meas1' } }, { qDef: { cId: 'meas2' } }];
    altMeasures = [{ qDef: { cId: 'altMeas1' } }, { qDef: { cId: 'altMeas2' } }, { qDef: { cId: 'altMeas3' } }];
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('moveMeasureFromEnabledToDisabled', () => {
    test('moves a measure from main to alternative at correct index', async () => {
      const result = await hcUtils.moveMeasureFromMainToAlternative(1, 3, measures, altMeasures);

      expect(result).toEqual({ qDef: { cId: 'meas2' } });
      expect(measures).toEqual([{ qDef: { cId: 'meas1' } }, { qDef: { cId: 'altMeas1' } }]);
      expect(altMeasures).toEqual([
        { qDef: { cId: 'altMeas2' } },
        { qDef: { cId: 'meas2' } },
        { qDef: { cId: 'altMeas3' } },
      ]);
    });

    test('should handle empty main measures array', async () => {
      measures = [];

      const result = await hcUtils.moveMeasureFromMainToAlternative(0, 0, measures, altMeasures);

      expect(result).toEqual({ qDef: { cId: 'altMeas1' } });
      expect(measures).toEqual([]);
      expect(altMeasures).toEqual([
        { qDef: { cId: 'altMeas1' } },
        { qDef: { cId: 'altMeas2' } },
        { qDef: { cId: 'altMeas3' } },
      ]);
    });

    test('should handle empty alternative measures array', async () => {
      altMeasures = [];

      const result = await hcUtils.moveMeasureFromMainToAlternative(1, 2, measures, altMeasures);

      expect(result).toEqual({ qDef: { cId: 'meas2' } });
      expect(measures).toEqual([{ qDef: { cId: 'meas1' } }, undefined]);
      expect(altMeasures).toEqual([{ qDef: { cId: 'meas2' } }]);
    });

    test('should add undefined if fromIndex is out of bounds', async () => {
      const result = await hcUtils.moveMeasureFromMainToAlternative(10, 1, measures, altMeasures);

      expect(result).toBeUndefined();
      expect(measures).toEqual([{ qDef: { cId: 'meas1' } }, { qDef: { cId: 'meas2' } }, { qDef: { cId: 'altMeas1' } }]);
      expect(altMeasures).toEqual([{ qDef: { cId: 'altMeas2' } }, undefined, { qDef: { cId: 'altMeas3' } }]);
    });

    test('should handle it if toIndex is out of bounds', async () => {
      const result = await hcUtils.moveMeasureFromMainToAlternative(1, 10, measures, altMeasures);

      expect(result).toEqual({ qDef: { cId: 'meas2' } });
      expect(measures).toEqual([{ qDef: { cId: 'meas1' } }, { qDef: { cId: 'altMeas1' } }]);
      expect(altMeasures).toEqual([
        { qDef: { cId: 'altMeas2' } },
        { qDef: { cId: 'altMeas3' } },
        { qDef: { cId: 'meas2' } },
      ]);
    });
  });

  describe('moveMeasureFromAlternativeToMain', () => {
    beforeEach(() => {
      measures = [{ qDef: { cId: 'meas1' } }, { qDef: { cId: 'meas2' } }];
      altMeasures = [{ qDef: { cId: 'altMeas1' } }, { qDef: { cId: 'altMeas2' } }, { qDef: { cId: 'altMeas3' } }];
    });

    test('moves a measure from alternative to main at correct index', async () => {
      const result = await hcUtils.moveMeasureFromAlternativeToMain(2, 1, measures, altMeasures);

      expect(result).toEqual({ qDef: { cId: 'altMeas1' } });
      expect(measures).toEqual([{ qDef: { cId: 'meas1' } }, { qDef: { cId: 'altMeas1' } }]);
      expect(altMeasures).toEqual([
        { qDef: { cId: 'meas2' } },
        { qDef: { cId: 'altMeas2' } },
        { qDef: { cId: 'altMeas3' } },
      ]);
    });

    test('should handle empty main measures array', async () => {
      measures = [];

      const result = await hcUtils.moveMeasureFromAlternativeToMain(0, 0, measures, altMeasures);

      expect(result).toEqual({ qDef: { cId: 'altMeas1' } });
      expect(measures).toEqual([{ qDef: { cId: 'altMeas1' } }]);
      expect(altMeasures).toEqual([undefined, { qDef: { cId: 'altMeas2' } }, { qDef: { cId: 'altMeas3' } }]);
    });

    test('should handle empty alternative measures array', async () => {
      altMeasures = [];

      const result = await hcUtils.moveMeasureFromAlternativeToMain(1, 2, measures, altMeasures);

      expect(result).toEqual({ qDef: { cId: 'meas2' } });
      expect(measures).toEqual([{ qDef: { cId: 'meas1' } }, { qDef: { cId: 'meas2' } }]);
      expect(altMeasures).toEqual([]);
    });

    test('should add undefined if fromIndex is out of bounds', async () => {
      const result = await hcUtils.moveMeasureFromAlternativeToMain(10, 1, measures, altMeasures);

      expect(result).toBeUndefined();
      expect(measures).toEqual([{ qDef: { cId: 'meas1' } }, undefined]);
      expect(altMeasures).toEqual([
        { qDef: { cId: 'meas2' } },
        { qDef: { cId: 'altMeas1' } },
        { qDef: { cId: 'altMeas2' } },
        { qDef: { cId: 'altMeas3' } },
      ]);
    });

    test('should handle it if toIndex is out of bounds', async () => {
      const result = await hcUtils.moveMeasureFromAlternativeToMain(1, 10, measures, altMeasures);

      expect(result).toEqual({ qDef: { cId: 'meas2' } });
      expect(measures).toEqual([{ qDef: { cId: 'meas1' } }, { qDef: { cId: 'meas2' } }]);
      expect(altMeasures).toEqual([
        { qDef: { cId: 'altMeas1' } },
        { qDef: { cId: 'altMeas2' } },
        { qDef: { cId: 'altMeas3' } },
      ]);
    });
  });
});
