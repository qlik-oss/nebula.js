import * as hcUtils from '../utils/hypercube-helper/hypercube-utils';
import HyperCubeHandler from '../hypercube-handler';
import addMainDimension from '../utils/hypercube-helper/add-main-dimension';

jest.mock('../utils/hypercube-helper/add-main-dimension', () => jest.fn());

describe('HyperCube Handlers', () => {
  let handler;
  let properties;
  let index;

  const opts = {
    app: {}, // mock app
    dimensionDefinition: { max: 10 },
    measureDefinition: { max: 10 },
    dimensionProperties: {},
    measureProperties: {},
    globalChangeListeners: [],
    path: '',
  };

  beforeEach(() => {
    index = 1;
    properties = {
      qHyperCubeDef: {
        qDimensions: [{ qDef: { cId: 'dim1' } }, { qDef: { cId: 'dim2' } }],
        qMeasures: [{ qDef: { cId: 'meas1' } }, { qDef: { cId: 'meas2' } }],
        qInterColumnSortOrder: [1, 0, 2, 3],
        qLayoutExclude: {
          qHyperCubeDef: {
            qDimensions: [{ qDef: { cId: 'altDim1' } }, { qDef: { cId: 'altDim2' } }],
            qMeasures: [{ qDef: { cId: 'altMeas1' } }, { qDef: { cId: 'altMeas2' } }],
          },
        },
      },
    };

    handler = new HyperCubeHandler(opts);
  });

  afterEach(() => {
    handler.hcProperties = undefined;
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('setProperties', () => {
    test('should return undefined when properties is null or undefined', () => {
      handler.setProperties(null);
      expect(handler.hcProperties).toBeUndefined();
      handler.setProperties({});
      expect(handler.hcProperties).toBeUndefined();
      handler.setProperties(undefined);
      expect(handler.hcProperties).toBeUndefined();
    });

    test('should set properties when qHyperCubeDef provides defined values', () => {
      handler.setProperties(properties);

      expect(handler.hcProperties.qDimensions).toEqual([{ qDef: { cId: 'dim1' } }, { qDef: { cId: 'dim2' } }]);
      expect(handler.hcProperties.qMeasures).toEqual([{ qDef: { cId: 'meas1' } }, { qDef: { cId: 'meas2' } }]);
      expect(handler.hcProperties.qInterColumnSortOrder).toEqual([1, 0, 2, 3]);
      expect(handler.hcProperties.qLayoutExclude).toEqual({
        qHyperCubeDef: {
          qDimensions: [{ qDef: { cId: 'altDim1' } }, { qDef: { cId: 'altDim2' } }],
          qMeasures: [{ qDef: { cId: 'altMeas1' } }, { qDef: { cId: 'altMeas2' } }],
        },
      });
    });

    test('should set properties when qLayoutExclude.qHyperCubeDef is undefined', () => {
      properties.qHyperCubeDef.qLayoutExclude.qHyperCubeDef = undefined;
      handler.setProperties(properties);

      expect(handler.hcProperties.qLayoutExclude).toEqual({
        qHyperCubeDef: {
          qDimensions: [],
          qMeasures: [],
        },
      });
    });
  });

  describe('getDimensions and getAlternativeDimensions', () => {
    test('should return empty arrays when hcProperties is null', () => {
      handler.setProperties(properties);
      handler.hcProperties = null;

      expect(handler.getDimensions()).toEqual([]);
      expect(handler.getAlternativeDimensions()).toEqual([]);
    });

    test('should return empty arrays when qDimensions and alternative dimension are empty', () => {
      handler.setProperties(properties);
      handler.hcProperties = {
        qDimensions: [],
        qLayoutExclude: {
          qHyperCubeDef: {
            qDimensions: [],
          },
        },
      };

      expect(handler.getDimensions()).toEqual([]);
      expect(handler.getAlternativeDimensions()).toEqual([]);
    });

    test('should return alternative dimensions when it has value', () => {
      handler.setProperties(properties);
      handler.hcProperties = {
        qDimensions: [{ qDef: { cId: 'dim1' } }, { qDef: { cId: 'dim2' } }],
        qLayoutExclude: {
          qHyperCubeDef: {
            qDimensions: [{ qDef: { cId: 'altDim1' } }, { qDef: { cId: 'altDim2' } }],
          },
        },
      };

      expect(handler.getDimensions()).toEqual([{ qDef: { cId: 'dim1' } }, { qDef: { cId: 'dim2' } }]);
      expect(handler.getAlternativeDimensions()).toEqual([{ qDef: { cId: 'altDim1' } }, { qDef: { cId: 'altDim2' } }]);
    });
  });

  describe('addDimension', () => {
    let dimension;

    beforeEach(() => {
      dimension = { qDef: { cId: 'dim3' }, qOtherTotalSpec: {} };
      jest.spyOn(hcUtils, 'isDimensionAlternative').mockReturnValue(false);
      jest.spyOn(hcUtils, 'addAlternativeDimension').mockResolvedValue(dimension);
      addMainDimension.mockResolvedValue(dimension);
    });

    afterEach(() => {
      handler.hcProperties = undefined;
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    test('should add a main dimension when alternative is false', () => {
      handler.addDimension(dimension, false, index).then((result) => {
        expect(hcUtils.isDimensionAlternative).toHaveBeenCalledWith(handler, false);
        expect(addMainDimension).toHaveBeenCalledWith(handler, dimension, index);
        expect(result).toEqual(dimension);
      });
    });

    test('should add an alternative dimension when alternative is true', () => {
      jest.spyOn(hcUtils, 'isDimensionAlternative').mockReturnValue(true);

      handler.addDimension(dimension, true, index).then((result) => {
        expect(hcUtils.isDimensionAlternative).toHaveBeenCalledWith(handler, true);
        expect(hcUtils.addAlternativeDimension).toHaveBeenCalledWith(handler, dimension, index);
        expect(result).toEqual(dimension);
      });
    });
  });

  describe('addDimensions', () => {
    beforeEach(() => {
      index = 1;
      handler.setProperties(properties);
      jest.spyOn(hcUtils, 'isTotalDimensionsExceeded').mockReturnValue(false);
    });

    afterEach(() => {
      handler.hcProperties = undefined;
      jest.clearAllMocks();
    });

    test('should return an empty array when newDimensions is empty', async () => {
      const result = await handler.addDimensions([]);
      expect(result).toEqual([]);
    });

    test('should add dimensions to alternative dimensions when alternative is true', async () => {
      const newDimensions = [{ qDef: { cId: 'altDim3' } }, { qDef: { cId: 'altDim4' } }];
      const dimensions = await handler.addDimensions(newDimensions, true);

      expect(dimensions).toEqual([
        { qDef: { cId: 'altDim3' }, qOtherTotalSpec: {} },
        { qDef: { cId: 'altDim4' }, qOtherTotalSpec: {} },
      ]);
      expect(handler.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions).toEqual([
        { qDef: { cId: 'altDim1' } },
        { qDef: { cId: 'altDim2' } },
        { qDef: { cId: 'altDim3' }, qOtherTotalSpec: {} },
        { qDef: { cId: 'altDim4' }, qOtherTotalSpec: {} },
      ]);
    });

    test('should add dimensions to main dimensions when alternative is false', async () => {
      const newDimensions = [{ qDef: { cId: 'dim3' } }, { qDef: { cId: 'dim4' } }];
      handler.maxDimensions = jest.fn().mockReturnValue(4);
      handler.autoSortDimension = jest.fn();

      const dimensions = await handler.addDimensions(newDimensions, false);
      expect(handler.autoSortDimension).toHaveBeenCalledTimes(2);
      expect(handler.autoSortDimension).toHaveBeenCalledWith({ qDef: { cId: 'dim3' }, qOtherTotalSpec: {} });
      expect(handler.autoSortDimension).toHaveBeenCalledWith({ qDef: { cId: 'dim4' }, qOtherTotalSpec: {} });

      expect(dimensions).toEqual([
        { qDef: { cId: 'dim3' }, qOtherTotalSpec: {} },
        { qDef: { cId: 'dim4' }, qOtherTotalSpec: {} },
      ]);
      expect(handler.hcProperties.qInterColumnSortOrder).toEqual([1, 0, 4, 5, 2, 3]);
      expect(handler.hcProperties.qDimensions).toEqual([
        { qDef: { cId: 'dim1' } },
        { qDef: { cId: 'dim2' } },
        { qDef: { cId: 'dim3' }, qOtherTotalSpec: {} },
        { qDef: { cId: 'dim4' }, qOtherTotalSpec: {} },
      ]);
    });

    test('should not add dimensions when isTotalDimensionsExceeded returns true', async () => {
      jest.spyOn(hcUtils, 'isTotalDimensionsExceeded').mockReturnValue(true);
      const newDimensions = [{ qDef: { cId: 'dim2' } }];

      const result = await handler.addDimensions(newDimensions);

      expect(result).toEqual([]);
    });

    test('should add dimensions to alternative dimensions when maxDim is exceeded but less than total maxDim', async () => {
      handler.maxDimensions = jest.fn().mockReturnValue(1);
      const newDimensions = [{ qDef: { cId: 'dim3' } }];

      const result = await handler.addDimensions(newDimensions, false);

      expect(result).toEqual([{ qDef: { cId: 'dim3' }, qOtherTotalSpec: {} }]);
      expect(handler.hcProperties.qDimensions).toEqual([{ qDef: { cId: 'dim1' } }, { qDef: { cId: 'dim2' } }]);
      expect(handler.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions).toEqual([
        { qDef: { cId: 'altDim1' } },
        { qDef: { cId: 'altDim2' } },
        { qDef: { cId: 'dim3' }, qOtherTotalSpec: {} },
      ]);
    });
  });

  describe('getMeasures and getAlternativeMeasures', () => {
    test('should return empty arrays when hcProperties is null', () => {
      handler.setProperties(properties);
      handler.hcProperties = null;

      expect(handler.getMeasures()).toEqual([]);
      expect(handler.getAlternativeMeasures()).toEqual([]);
    });

    test('should return empty arrays when qMeasures and alternative measures are empty', () => {
      handler.setProperties(properties);
      handler.hcProperties = {
        qMeasures: [],
        qLayoutExclude: {
          qHyperCubeDef: {
            qDimensions: [],
            qMeasures: [],
          },
        },
      };

      expect(handler.getMeasures()).toEqual([]);
      expect(handler.getAlternativeMeasures()).toEqual([]);
    });

    test('should return qMeasures when qMeasures has value', () => {
      handler.setProperties(properties);
      handler.hcProperties = {
        qMeasures: [{ qDef: { cId: 'meas1' } }, { qDef: { cId: 'meas2' } }],
        qLayoutExclude: {
          qHyperCubeDef: {
            qMeasures: [{ qDef: { cId: 'altMeas1' } }, { qDef: { cId: 'altMeas2' } }],
          },
        },
      };

      expect(handler.getMeasures()).toEqual([{ qDef: { cId: 'meas1' } }, { qDef: { cId: 'meas2' } }]);
      expect(handler.getAlternativeMeasures()).toEqual([{ qDef: { cId: 'altMeas1' } }, { qDef: { cId: 'altMeas2' } }]);
    });
  });

  describe('addMeasures', () => {
    beforeEach(() => {
      properties.qHyperCubeDef.qMeasures = [{ qDef: { cId: 'meas1' } }];
      handler.setProperties(properties);
      jest.spyOn(hcUtils, 'isTotalMeasureExceeded').mockReturnValue(false);
    });

    test('should return an empty array when new measure is empty', () => {
      const result = handler.addMeasures([]);
      expect(result).toEqual([]);
    });

    test('should add measures to alternative measures when alternative is true', () => {
      const newMeasures = [{ qDef: { cId: 'altMeas3' } }, { qDef: { cId: 'altMeas4' } }];
      const measures = handler.addMeasures(newMeasures, true);

      expect(measures).toEqual([{ qDef: { cId: 'altMeas3' } }, { qDef: { cId: 'altMeas4' } }]);
      expect(handler.hcProperties.qMeasures).toEqual([{ qDef: { cId: 'meas1' } }]);
      expect(handler.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures).toEqual([
        { qDef: { cId: 'altMeas1' } },
        { qDef: { cId: 'altMeas2' } },
        { qDef: { cId: 'altMeas3' } },
        { qDef: { cId: 'altMeas4' } },
      ]);
    });

    test('should add measures to main measures when alternative is false', () => {
      const newMeasures = [{ qDef: { cId: 'meas2' } }];
      handler.maxMeasures = jest.fn().mockReturnValue(2);
      handler.autoSortDimension = jest.fn();
      jest.spyOn(hcUtils, 'isMeasureAlternative').mockReturnValue(false);

      const measures = handler.addMeasures(newMeasures, false);
      expect(measures).toEqual([
        {
          qDef: { cId: 'meas2' },
          qSortBy: {
            qSortByLoadOrder: 1,
            qSortByNumeric: -1,
          },
        },
      ]);
      expect(handler.hcProperties.qMeasures).toEqual([
        { qDef: { cId: 'meas1' } },
        {
          qDef: { cId: 'meas2' },
          qSortBy: {
            qSortByLoadOrder: 1,
            qSortByNumeric: -1,
          },
        },
      ]);
    });

    test('should not add measures when isTotalMeasureExceeded returns true', () => {
      jest.spyOn(hcUtils, 'isTotalMeasureExceeded').mockReturnValue(true);
      const newMeasure = [{ qDef: { cId: 'meas2' } }];

      const measure = handler.addMeasures(newMeasure);
      expect(measure).toEqual([]);
    });

    test('should add measure to alternative measures when maxMeasure is exceeded but less than total', () => {
      handler.maxMeasures = jest.fn().mockReturnValue(1);
      const newMeasure = [{ qDef: { cId: 'meas2' } }];

      const measure = handler.addMeasures(newMeasure, false);

      expect(measure).toEqual([{ qDef: { cId: 'meas2' } }]);
      expect(handler.hcProperties.qMeasures).toEqual([{ qDef: { cId: 'meas1' } }]);
      expect(handler.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures).toEqual([
        { qDef: { cId: 'altMeas1' } },
        { qDef: { cId: 'altMeas2' } },
        { qDef: { cId: 'meas2' } },
      ]);
    });
  });

  describe('removeMeasures', () => {
    beforeEach(() => {
      properties.qHyperCubeDef.qMeasures = [
        { qDef: { cId: 'meas1' } },
        { qDef: { cId: 'meas2' } },
        { qDef: { cId: 'meas3' } },
      ];
      properties.qHyperCubeDef.qLayoutExclude.qHyperCubeDef.qMeasures = [
        { qDef: { cId: 'altMeas1' } },
        { qDef: { cId: 'altMeas2' } },
        { qDef: { cId: 'altMeas3' } },
      ];
      properties.qHyperCubeDef.qInterColumnSortOrder = [0, 1, 2];
      handler.setProperties(properties);
    });

    afterEach(() => {
      handler.hcProperties = undefined;
      jest.clearAllMocks();
    });

    test('should return an empty array if indexes is empty', async () => {
      jest.spyOn(hcUtils, 'removeMeasureFromColumnSortOrder');
      jest.spyOn(hcUtils, 'removeMeasureFromColumnOrder');

      const result = await handler.removeMeasures([], false);

      expect(result).toEqual([]);
      expect(hcUtils.removeMeasureFromColumnSortOrder).not.toHaveBeenCalled();
      expect(hcUtils.removeMeasureFromColumnOrder).not.toHaveBeenCalled();
    });

    test('should return deleted measures if alternative is true', async () => {
      const indexes = [2, 0];

      const result = await handler.removeMeasures(indexes, true);

      expect(result).toEqual([{ qDef: { cId: 'altMeas1' } }, { qDef: { cId: 'altMeas3' } }]);
      expect(handler.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures).toEqual([{ qDef: { cId: 'altMeas2' } }]);
      expect(handler.hcProperties.qMeasures).toEqual([
        { qDef: { cId: 'meas1' } },
        { qDef: { cId: 'meas2' } },
        { qDef: { cId: 'meas3' } },
      ]);
    });

    test('should return deleted measures in the order when alternative is false', async () => {
      properties.qHyperCubeDef.qInterColumnSortOrder = [0, 1, 2];
      handler.setProperties(properties);
      const indexes = [1, 2];

      const result = await handler.removeMeasures(indexes, false);

      expect(result).toEqual([{ qDef: { cId: 'meas2' } }, { qDef: { cId: 'meas3' } }]);
      expect(handler.hcProperties.qMeasures).toEqual([{ qDef: { cId: 'meas1' } }]);
      expect(handler.hcProperties.qInterColumnSortOrder).toEqual([2]);
      expect(handler.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures).toEqual([
        { qDef: { cId: 'altMeas1' } },
        { qDef: { cId: 'altMeas2' } },
        { qDef: { cId: 'altMeas3' } },
      ]);
    });

    test('should handle empty qMeasures', async () => {
      properties.qHyperCubeDef.qMeasures = [];
      handler.setProperties(properties);
      const indexes = [1];

      const result = await handler.removeMeasures(indexes, false);

      expect(result).toEqual([]);
    });
  });

  describe('removeDimensions', () => {
    beforeEach(() => {
      properties.qHyperCubeDef.qDimensions = [
        { qDef: { cId: 'dim1' } },
        { qDef: { cId: 'dim2' } },
        { qDef: { cId: 'dim3' } },
      ];
      properties.qHyperCubeDef.qLayoutExclude.qHyperCubeDef.qDimensions = [
        { qDef: { cId: 'altDim1' } },
        { qDef: { cId: 'altDim2' } },
        { qDef: { cId: 'altDim3' } },
      ];
      properties.qHyperCubeDef.qInterColumnSortOrder = [0, 1, 2];
      handler.setProperties(properties);
    });

    afterEach(() => {
      handler.hcProperties = undefined;
      jest.resetModules();
      jest.clearAllMocks();
    });

    test('should return an empty array if indexes is empty', async () => {
      jest.doMock('../utils/hypercube-helper/remove-alternative-dimension', () => ({
        removeAlternativeDimension: jest.fn().mockResolvedValue(),
      }));
      jest.doMock('../utils/hypercube-helper/remove-main-dimension', () => ({
        removeMainDimension: jest.fn().mockResolvedValue(),
      }));

      const { removeMainDimension } = await import('../utils/hypercube-helper/remove-main-dimension');
      const { removeAlternativeDimension } = await import('../utils/hypercube-helper/remove-alternative-dimension');

      const result = await handler.removeDimensions([], false);

      expect(result).toEqual([]);
      expect(removeAlternativeDimension).not.toHaveBeenCalled();
      expect(removeMainDimension).not.toHaveBeenCalled();
    });

    test('should remove alternative dimensions when alternative is true', async () => {
      const indexes = [0, 1];

      const result = await handler.removeDimensions(indexes, true);

      expect(result).toEqual([{ qDef: { cId: 'altDim1' } }, { qDef: { cId: 'altDim2' } }]);
      expect(handler.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions).toEqual([{ qDef: { cId: 'altDim3' } }]);
      expect(handler.hcProperties.qDimensions).toEqual([
        { qDef: { cId: 'dim1' } },
        { qDef: { cId: 'dim2' } },
        { qDef: { cId: 'dim3' } },
      ]);
    });

    test('should remove main dimensions when alternative is false', async () => {
      const indexes = [2, 0];

      const result = await handler.removeDimensions(indexes, false);

      expect(result).toEqual([{ qDef: { cId: 'dim1' } }, { qDef: { cId: 'dim3' } }]);
      expect(handler.hcProperties.qDimensions).toEqual([{ qDef: { cId: 'dim2' } }]);
      expect(handler.hcProperties.qInterColumnSortOrder).toEqual([0]);
      expect(handler.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions).toEqual([
        { qDef: { cId: 'altDim1' } },
        { qDef: { cId: 'altDim2' } },
        { qDef: { cId: 'altDim3' } },
      ]);
    });

    test('should handle empty alternative qDimensions', async () => {
      jest.doMock('../utils/hypercube-helper/remove-alternative-dimension', () => ({
        removeAlternativeDimension: jest.fn().mockResolvedValue(),
      }));

      const { removeAlternativeDimension } = await import('../utils/hypercube-helper/remove-alternative-dimension');

      properties.qHyperCubeDef.qLayoutExclude.qHyperCubeDef.qDimensions = [];
      properties.qHyperCubeDef.qDimensions = [];
      handler.setProperties(properties);
      const indexes = [0, 1];

      const result = await handler.removeDimensions(indexes, true);

      expect(result).toEqual([]);
      expect(removeAlternativeDimension).not.toHaveBeenCalled();
    });

    test('should handle empty main qDimensions', async () => {
      jest.doMock('../utils/hypercube-helper/remove-main-dimension', () => ({
        removeMainDimension: jest.fn().mockResolvedValue(),
      }));
      const { removeMainDimension } = await import('../utils/hypercube-helper/remove-main-dimension');

      properties.qHyperCubeDef.qLayoutExclude.qHyperCubeDef.qDimensions = [];
      properties.qHyperCubeDef.qDimensions = [];
      handler.setProperties(properties);
      const indexes = [0, 1];

      const result = await handler.removeDimensions(indexes, false);

      expect(result).toEqual([]);
      expect(removeMainDimension).not.toHaveBeenCalled();
    });
  });

  describe('moveDimension', () => {
    beforeEach(() => {
      properties.qHyperCubeDef.qDimensions = [
        { qDef: { cId: 'dim1' } },
        { qDef: { cId: 'dim2' } },
        { qDef: { cId: 'dim3' } },
      ];
      properties.qHyperCubeDef.qLayoutExclude.qHyperCubeDef.qDimensions = [
        { qDef: { cId: 'altDim1' } },
        { qDef: { cId: 'altDim2' } },
        { qDef: { cId: 'altDim3' } },
      ];
      handler.setProperties(properties);
    });

    afterEach(() => {
      handler.hcProperties = undefined;
    });

    test('moves dimension within main', async () => {
      await handler.moveDimension(0, 1);
      expect(handler.hcProperties.qDimensions).toEqual([
        { qDef: { cId: 'dim2' } },
        { qDef: { cId: 'dim1' } },
        { qDef: { cId: 'dim3' } },
      ]);
      expect(handler.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions).toEqual([
        { qDef: { cId: 'altDim1' } },
        { qDef: { cId: 'altDim2' } },
        { qDef: { cId: 'altDim3' } },
      ]);
    });

    test('moves dimension from main to alternative', async () => {
      await handler.moveDimension(0, 3);

      expect(handler.hcProperties.qDimensions).toEqual([
        { qDef: { cId: 'dim2' } },
        { qDef: { cId: 'dim3' } },
        { qDef: { cId: 'altDim1' } },
      ]);
      expect(handler.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions).toEqual([
        { qDef: { cId: 'dim1' } },
        { qDef: { cId: 'altDim2' } },
        { qDef: { cId: 'altDim3' } },
      ]);
    });

    test('moves dimension from alternative to main', async () => {
      const result = await handler.moveDimension(3, 2);

      expect(handler.hcProperties.qDimensions).toEqual([
        { qDef: { cId: 'dim1' } },
        { qDef: { cId: 'dim2' } },
        { qDef: { cId: 'altDim1' } },
      ]);
      expect(handler.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions).toEqual([
        { qDef: { cId: 'dim3' } },
        { qDef: { cId: 'altDim2' } },
        { qDef: { cId: 'altDim3' } },
      ]);
      expect(result).toEqual({ qDef: { cId: 'altDim1' } });
    });

    test('moves dimension within alternative', async () => {
      await handler.moveDimension(4, 3);

      expect(handler.hcProperties.qDimensions).toEqual([
        { qDef: { cId: 'dim1' } },
        { qDef: { cId: 'dim2' } },
        { qDef: { cId: 'dim3' } },
      ]);
      expect(handler.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions).toEqual([
        { qDef: { cId: 'altDim2' } },
        { qDef: { cId: 'altDim1' } },
        { qDef: { cId: 'altDim3' } },
      ]);
    });

    test('handles empty dimensions arrays', async () => {
      properties.qHyperCubeDef.qDimensions = [];
      handler.setProperties(properties);

      const result = await handler.moveDimension(0, 1);
      expect(handler.hcProperties.qDimensions).toEqual([]);
      expect(handler.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions).toEqual([
        { qDef: { cId: 'altDim2' } },
        { qDef: { cId: 'altDim1' } },
        { qDef: { cId: 'altDim3' } },
      ]);
      expect(result).toBeUndefined();
    });

    test('handles out-of-bounds indices', async () => {
      await handler.moveDimension(10, 20);
      expect(handler.hcProperties.qDimensions).toEqual([
        { qDef: { cId: 'dim1' } },
        { qDef: { cId: 'dim2' } },
        { qDef: { cId: 'dim3' } },
      ]);
      expect(handler.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions).toEqual([
        { qDef: { cId: 'altDim1' } },
        { qDef: { cId: 'altDim2' } },
        { qDef: { cId: 'altDim3' } },
      ]);
    });
  });

  describe('moveMeasure', () => {
    beforeEach(() => {
      properties.qHyperCubeDef.qMeasures = [
        { qDef: { cId: 'meas1' } },
        { qDef: { cId: 'meas2' } },
        { qDef: { cId: 'meas3' } },
      ];
      properties.qHyperCubeDef.qLayoutExclude.qHyperCubeDef.qMeasures = [
        { qDef: { cId: 'altMeas1' } },
        { qDef: { cId: 'altMeas2' } },
        { qDef: { cId: 'altMeas3' } },
      ];
      handler.setProperties(properties);
    });

    afterEach(() => {
      handler.hcProperties = undefined;
    });

    test('moves measure within main', async () => {
      await handler.moveMeasure(0, 1);
      expect(handler.hcProperties.qMeasures).toEqual([
        { qDef: { cId: 'meas2' } },
        { qDef: { cId: 'meas1' } },
        { qDef: { cId: 'meas3' } },
      ]);
      expect(handler.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures).toEqual([
        { qDef: { cId: 'altMeas1' } },
        { qDef: { cId: 'altMeas2' } },
        { qDef: { cId: 'altMeas3' } },
      ]);
    });

    test('moves measure from main to alternative', async () => {
      await handler.moveMeasure(0, 3);

      expect(handler.hcProperties.qMeasures).toEqual([
        { qDef: { cId: 'meas2' } },
        { qDef: { cId: 'meas3' } },
        { qDef: { cId: 'altMeas1' } },
      ]);
      expect(handler.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures).toEqual([
        { qDef: { cId: 'meas1' } },
        { qDef: { cId: 'altMeas2' } },
        { qDef: { cId: 'altMeas3' } },
      ]);
    });

    test('moves measure from alternative to main', async () => {
      const result = await handler.moveMeasure(3, 2);

      expect(handler.hcProperties.qMeasures).toEqual([
        { qDef: { cId: 'meas1' } },
        { qDef: { cId: 'meas2' } },
        { qDef: { cId: 'altMeas1' } },
      ]);
      expect(handler.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures).toEqual([
        { qDef: { cId: 'meas3' } },
        { qDef: { cId: 'altMeas2' } },
        { qDef: { cId: 'altMeas3' } },
      ]);
      expect(result).toEqual({ qDef: { cId: 'altMeas1' } });
    });

    test('moves measure within alternative', async () => {
      await handler.moveMeasure(4, 3);

      expect(handler.hcProperties.qMeasures).toEqual([
        { qDef: { cId: 'meas1' } },
        { qDef: { cId: 'meas2' } },
        { qDef: { cId: 'meas3' } },
      ]);
      expect(handler.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures).toEqual([
        { qDef: { cId: 'altMeas2' } },
        { qDef: { cId: 'altMeas1' } },
        { qDef: { cId: 'altMeas3' } },
      ]);
    });

    test('handles empty measures arrays', async () => {
      properties.qHyperCubeDef.qMeasures = [];
      handler.setProperties(properties);

      const result = await handler.moveMeasure(0, 1);
      expect(handler.hcProperties.qMeasures).toEqual([]);
      expect(handler.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures).toEqual([
        { qDef: { cId: 'altMeas2' } },
        { qDef: { cId: 'altMeas1' } },
        { qDef: { cId: 'altMeas3' } },
      ]);
      expect(result).toBeUndefined();
    });

    test('handles out-of-bounds indices', async () => {
      await handler.moveMeasure(10, 20);
      expect(handler.hcProperties.qMeasures).toEqual([
        { qDef: { cId: 'meas1' } },
        { qDef: { cId: 'meas2' } },
        { qDef: { cId: 'meas3' } },
      ]);
      expect(handler.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures).toEqual([
        { qDef: { cId: 'altMeas1' } },
        { qDef: { cId: 'altMeas2' } },
        { qDef: { cId: 'altMeas3' } },
      ]);
    });
  });
});
