import HyperCubeHandler from '../handlers/hypercube-handlers';

describe('DataPropertyHandler - getDimensions and getMeasure', () => {
  let handler;
  let properties;

  beforeEach(() => {
    properties = {
      qHyperCubeDef: {
        qDimensions: [{ qDef: { cId: 'dim1' } }],
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

  describe('getDimensions()', () => {
    test('should return null when dimension is undefined', () => {
      jest.spyOn(handler, 'getDimensions').mockReturnValue([]);
      const dimension = handler.getDimension(undefined);
      expect(dimension).toBeFalsy();
    });

    test('should return dimension when it exists in getDimensions()', () => {
      jest.spyOn(handler, 'getDimensions').mockReturnValue([{ qDef: { cId: 'dim1' } }]);
      jest.spyOn(handler, 'getAlternativeDimensions').mockReturnValue([{ qDef: { cId: 'altDim1' } }]);

      const dimension = handler.getDimension('dim1');
      expect(dimension).toEqual({ qDef: { cId: 'dim1' } });
      const alternativeDimension = handler.getDimension('altDim1');
      expect(alternativeDimension).toEqual({ qDef: { cId: 'altDim1' } });
    });
  });

  describe('getMeasure()', () => {
    test('should return null when both measures and alternative measures are empty', () => {
      jest.spyOn(handler, 'getMeasures').mockReturnValue([]);
      const measure = handler.getMeasure(undefined);
      expect(measure).toBeFalsy();
    });

    test('should return measure when it exists in getMeasures()', () => {
      jest.spyOn(handler, 'getMeasures').mockReturnValue([{ qDef: { cId: 'measure1' } }]);
      jest.spyOn(handler, 'getAlternativeMeasures').mockReturnValue([{ qDef: { cId: 'altMeasure1' } }]);

      const measure = handler.getMeasure('measure1');
      const alternativeMeasure = handler.getMeasure('altMeasure1');
      expect(measure).toEqual({ qDef: { cId: 'measure1' } });
      expect(alternativeMeasure).toEqual({ qDef: { cId: 'altMeasure1' } });
    });
  });
});
