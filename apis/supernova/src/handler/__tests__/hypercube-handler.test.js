import * as hypercubeUtils from '../utils/hypercube-helper/hypercube-utils';
import removeMainDimension from '../utils/hypercube-helper/remove-main-dimension';
import HyperCubeHandler from '../hypercube-handler';
import removeAlternativeMeasure from '../utils/hypercube-helper/remove-alternative-measure';

jest.mock('../utils/hypercube-helper/remove-alternative-measure', () => jest.fn());
jest.mock('../utils/hypercube-helper/remove-main-dimension', () => jest.fn().mockResolvedValue());

describe('HyperCube Handlers', () => {
  let handler;
  let properties;

  beforeEach(() => {
    properties = {
      qHyperCubeDef: {
        qDimensions: [{ qDef: { cId: 'dim1' } }],
        qMeasures: [],
        qInterColumnSortOrder: [0, 1],
        qLayoutExclude: {
          qHyperCubeDef: {
            qDimensions: [{ qDef: { cId: 'altDim1' } }],
            qMeasures: [{ qDef: { cId: 'altMeas1' } }],
          },
        },
      },
    };
    handler = new HyperCubeHandler(properties);
  });

  afterEach(() => {
    handler.hcProperties = undefined;
    jest.clearAllMocks();
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

    test('should set properties when qHyperCubeDef provides defined/undefined values', () => {
      properties.qHyperCubeDef.qLayoutExclude.qHyperCubeDef.qDimensions = undefined;
      handler.setProperties(properties);

      expect(handler.hcProperties.qDimensions[0]).toEqual({ qDef: { cId: 'dim1' } });
      expect(handler.hcProperties.qMeasures).toEqual([]);
      expect(handler.hcProperties.qInterColumnSortOrder).toEqual([0, 1]);
      expect(handler.hcProperties.qLayoutExclude).toEqual({
        qHyperCubeDef: {
          qDimensions: [],
          qMeasures: [{ qDef: { cId: 'altMeas1' } }],
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

  describe('addDimensions', () => {
    beforeEach(() => {
      handler.setProperties(properties);
      jest.spyOn(hypercubeUtils, 'isTotalDimensionsExceeded').mockReturnValue(false);
    });

    test('should return an empty array when newDimensions is empty', async () => {
      const result = await handler.addDimensions([]);
      expect(result).toEqual([]);
    });

    test('should add dimensions to alternative dimensions when alternative is true', async () => {
      const newDimensions = [{ qDef: { cId: 'altDim2' } }, { qDef: { cId: 'altDim3' } }];
      const dimensions = await handler.addDimensions(newDimensions, true);

      expect(dimensions).toEqual([
        { qDef: { cId: 'altDim2' }, qOtherTotalSpec: {} },
        { qDef: { cId: 'altDim3' }, qOtherTotalSpec: {} },
      ]);
      expect(handler.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions).toEqual([
        { qDef: { cId: 'altDim1' } },
        { qDef: { cId: 'altDim2' }, qOtherTotalSpec: {} },
        { qDef: { cId: 'altDim3' }, qOtherTotalSpec: {} },
      ]);
    });

    test('should add dimensions to main dimensions when alternative is false', async () => {
      const newDimensions = [{ qDef: { cId: 'dim2' } }];
      handler.maxDimensions = jest.fn().mockReturnValue(2);
      handler.autoSortDimension = jest.fn();

      const dimensions = await handler.addDimensions(newDimensions, false);
      expect(handler.autoSortDimension).toHaveBeenCalledTimes(1);
      expect(handler.autoSortDimension).toHaveBeenCalledWith({ qDef: { cId: 'dim2' }, qOtherTotalSpec: {} });

      expect(dimensions).toEqual([{ qDef: { cId: 'dim2' }, qOtherTotalSpec: {} }]);
      expect(handler.hcProperties.qDimensions).toEqual([
        { qDef: { cId: 'dim1' } },
        { qDef: { cId: 'dim2' }, qOtherTotalSpec: {} },
      ]);
    });

    test('should not add dimensions when isTotalDimensionsExceeded returns true', async () => {
      jest.spyOn(hypercubeUtils, 'isTotalDimensionsExceeded').mockReturnValue(true);
      const newDimensions = [{ qDef: { cId: 'dim2' } }];

      const dimensions = await handler.addDimensions(newDimensions);

      expect(dimensions).toEqual([]);
    });

    test('should add dimensions to alternative dimensions when maxDim is exceeded but less than total maxDim', async () => {
      handler.maxDimensions = jest.fn().mockReturnValue(1);
      const newDimensions = [{ qDef: { cId: 'dim2' } }];

      const dimension = await handler.addDimensions(newDimensions, false);

      expect(dimension).toEqual([{ qDef: { cId: 'dim2' }, qOtherTotalSpec: {} }]);
      expect(handler.hcProperties.qDimensions).toEqual([{ qDef: { cId: 'dim1' } }]);
      expect(handler.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions).toEqual([
        { qDef: { cId: 'altDim1' } },
        { qDef: { cId: 'dim2' }, qOtherTotalSpec: {} },
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
      jest.spyOn(hypercubeUtils, 'isTotalMeasureExceeded').mockReturnValue(false);
    });

    test('should return an empty array when new measure is empty', () => {
      const result = handler.addMeasures([]);
      expect(result).toEqual([]);
    });

    test('should add measures to alternative measures when alternative is true', () => {
      const newMeasures = [{ qDef: { cId: 'altMeas2' } }, { qDef: { cId: 'altMeas3' } }];
      const measures = handler.addMeasures(newMeasures, true);

      expect(measures).toEqual([{ qDef: { cId: 'altMeas2' } }, { qDef: { cId: 'altMeas3' } }]);
      expect(handler.hcProperties.qMeasures).toEqual([{ qDef: { cId: 'meas1' } }]);
      expect(handler.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures).toEqual([
        { qDef: { cId: 'altMeas1' } },
        { qDef: { cId: 'altMeas2' } },
        { qDef: { cId: 'altMeas3' } },
      ]);
    });

    test('should add measures to main measures when alternative is false', () => {
      const newMeasures = [{ qDef: { cId: 'meas2' } }];
      handler.maxMeasures = jest.fn().mockReturnValue(2);
      handler.autoSortDimension = jest.fn();

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
      jest.spyOn(hypercubeUtils, 'isTotalMeasureExceeded').mockReturnValue(true);
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
        {
          qDef: { cId: 'meas2' },
        },
      ]);
    });
  });

  describe('removeMeasures', () => {
    beforeEach(() => {
      properties.qHyperCubeDef.qMeasures = [{ id: 'measure1' }, { id: 'measure2' }, { id: 'measure3' }];
      handler.setProperties(properties);
    });

    test('should return an empty array if indexes is empty', async () => {
      jest.spyOn(hypercubeUtils, 'removeMeasureFromColumnSortOrder');
      jest.spyOn(hypercubeUtils, 'removeMeasureFromColumnOrder');

      const result = await handler.removeMeasures([], false);

      expect(result).toEqual([]);
      expect(hypercubeUtils.removeMeasureFromColumnSortOrder).not.toHaveBeenCalled();
      expect(hypercubeUtils.removeMeasureFromColumnOrder).not.toHaveBeenCalled();
    });

    test('should call removeAlternativeMeasure if alternative is true', async () => {
      const indexes = [0, 1];
      removeAlternativeMeasure.mockResolvedValue(['measure1', 'measure2']);

      const result = await handler.removeMeasures(indexes, true);

      expect(removeAlternativeMeasure).toHaveBeenCalledWith(handler, indexes);
      expect(result).toEqual(['measure1', 'measure2']);
    });

    test('should return deleted measures in the order', async () => {
      const indexes = [2, 0];

      const result = await handler.removeMeasures(indexes, false);

      expect(result).toEqual([{ id: 'measure3' }, { id: 'measure1' }]);
    });

    test('should call removeMeasureFromColumnSortOrder and removeMeasureFromColumnOrder for each index', async () => {
      const indexes = [0, 2];

      await handler.removeMeasures(indexes, false);

      expect(hypercubeUtils.removeMeasureFromColumnSortOrder).toHaveBeenCalledTimes(2);
      expect(hypercubeUtils.removeMeasureFromColumnSortOrder).toHaveBeenCalledWith(handler, 2);
      expect(hypercubeUtils.removeMeasureFromColumnSortOrder).toHaveBeenCalledWith(handler, 0);
      expect(hypercubeUtils.removeMeasureFromColumnOrder).toHaveBeenCalledTimes(2);
      expect(hypercubeUtils.removeMeasureFromColumnOrder).toHaveBeenCalledWith(handler, 2);
      expect(hypercubeUtils.removeMeasureFromColumnOrder).toHaveBeenCalledWith(handler, 0);
    });

    test('should handle empty qMeasures', async () => {
      properties.qHyperCubeDef.qMeasures = [];
      handler.setProperties(properties);
      const indexes = [0, 1];

      const result = await handler.removeMeasures(indexes, false);

      expect(result).toEqual([]);
    });
  });

  describe('removeDimensions', () => {
    test.only('should return an empty array if indexes is empty', async () => {
      jest.spyOn(hypercubeUtils, 'removeAlternativeDimension');

      const result = await handler.removeDimensions([], false);

      expect(hypercubeUtils.removeAlternativeDimension).not.toHaveBeenCalled();
      expect(removeMainDimension).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    test('should call removeAlternativeDimension for each index if alternative is true', async () => {
      const indexes = [0, 1];

      await handler.removeDimensions(indexes, true);

      expect(hypercubeUtils.removeAlternativeDimension).toHaveBeenCalledTimes(2);
      expect(hypercubeUtils.removeAlternativeDimension).toHaveBeenCalledWith(handler, 1);
      expect(hypercubeUtils.removeAlternativeDimension).toHaveBeenCalledWith(handler, 0);
    });

    test('should return deleted alternative dimensions in the original order if alternative is true', async () => {
      const indexes = [1, 0];

      const result = await handler.removeDimensions(indexes, true);

      expect(result).toEqual([{ id: 'altDim2' }, { id: 'altDim1' }]);
    });

    test('should call removeMainDimension for each index if alternative is false', async () => {
      const indexes = [0, 2];

      await handler.removeDimensions(indexes, false);

      expect(removeMainDimension).toHaveBeenCalledTimes(2);
      expect(removeMainDimension).toHaveBeenCalledWith(handler, 2);
      expect(removeMainDimension).toHaveBeenCalledWith(handler, 0);
    });

    test('should return deleted dimensions in the original order if alternative is false', async () => {
      const indexes = [2, 0];

      const result = await handler.removeDimensions(indexes, false);

      expect(result).toEqual([{ id: 'dim3' }, { id: 'dim1' }]);
    });

    test('should handle empty qDimensions', async () => {
      handler.hcProperties.qDimensions = [];
      const indexes = [0, 1];

      const result = await handler.removeDimensions(indexes, false);

      expect(result).toEqual([]);
      expect(removeMainDimension).not.toHaveBeenCalled();
    });

    test('should handle empty qLayoutExclude.qHyperCubeDef.qDimensions', async () => {
      handler.hcProperties.qLayoutExclude.qHyperCubeDef.qDimensions = [];
      const indexes = [0, 1];

      const result = await handler.removeDimensions(indexes, true);

      expect(result).toEqual([]);
      expect(hypercubeUtils.removeAlternativeDimension).not.toHaveBeenCalled();
    });
  });
});
