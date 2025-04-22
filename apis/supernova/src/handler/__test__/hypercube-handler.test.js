import HyperCubeHandler from '../hypercube-handler';

describe('HyperCube Handlers', () => {
  let handler;
  let properties;

  beforeEach(() => {
    properties = {
      qHyperCubeDef: {
        qDimensions: [{ qDef: { cId: 'dim1' } }],
        qInterColumnSortOrder: [0, 1],
        qLayoutExclude: {
          qHyperCubeDef: {
            qDimensions: [{ qDef: { cId: 'altDim1' } }],
            qMeasures: [{ qDef: { cId: 'altMeasure1' } }],
          },
        },
      },
    };
    handler = new HyperCubeHandler(properties);
  });

  afterEach(() => {
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
          qMeasures: [{ qDef: { cId: 'altMeasure1' } }],
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
      handler.hcProperties = null;

      expect(handler.getDimensions()).toEqual([]);
      expect(handler.getAlternativeDimensions()).toEqual([]);
    });

    test('should return empty arrays when qDimensions and qLayoutExclude.qHyperCubeDef.qDimensions are empty', () => {
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

    test('should return qDimensions when qDimensions contains dimensions', () => {
      handler.hcProperties = {
        qDimensions: [{ qDef: { cId: 'dim1' } }, { qDef: { cId: 'dim2' } }],
        qLayoutExclude: {
          qHyperCubeDef: {
            qDimensions: [],
          },
        },
      };

      expect(handler.getDimensions()).toEqual([{ qDef: { cId: 'dim1' } }, { qDef: { cId: 'dim2' } }]);
      expect(handler.getAlternativeDimensions()).toEqual([]);
    });

    test('should return qLayoutExclude.qHyperCubeDef.qDimensions when it contains alternative dimensions', () => {
      handler.hcProperties = {
        qDimensions: [],
        qLayoutExclude: {
          qHyperCubeDef: {
            qDimensions: [{ qDef: { cId: 'altDim1' } }, { qDef: { cId: 'altDim2' } }],
          },
        },
      };

      expect(handler.getDimensions()).toEqual([]);
      expect(handler.getAlternativeDimensions()).toEqual([{ qDef: { cId: 'altDim1' } }, { qDef: { cId: 'altDim2' } }]);
    });
  });
});
