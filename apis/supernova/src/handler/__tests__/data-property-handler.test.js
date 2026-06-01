import DataPropertyHandler from '../data-property-handler';
import HyperCubeHandler from '../hypercube-handler';

describe('DataPropertyHandler', () => {
  let handler;
  let properties;
  const sortingProperties = [
    {
      qSortByLoadOrder: 1,
      qSortByNumeric: 1,
      qSortByAscii: 1,
    },
  ];

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

  describe('createFieldDimension', () => {
    beforeEach(() => {
      handler = new DataPropertyHandler({
        dimensionProperties: { someProperty: 'defaultValue' },
      });
    });

    test('should create a dimension with default properties when no field is provided', () => {
      const result = handler.createFieldDimension(null, null, { customDefault: 'value' });

      expect(result.qDef.qFieldDefs).toEqual([null]);
      expect(result.qDef.qFieldLabels).toEqual(['']);
      expect(result.qDef.qSortCriterias).toEqual(sortingProperties);
      expect(result.qDef.autoSort).toBe(true);
      expect(result.someProperty).toBe('defaultValue');
      expect(result.customDefault).toBe('value');
      expect(result.qOtherTotalSpec).toEqual({});
    });

    test('should create a dimension with provided field and label', () => {
      const result = handler.createFieldDimension('fieldName', 'fieldLabel', { customDefault: 'value' });

      expect(result.qDef.qFieldDefs).toEqual(['fieldName']);
      expect(result.qDef.qFieldLabels).toEqual(['fieldLabel']);
      expect(result.qDef.qSortCriterias).toEqual(sortingProperties);
      expect(result.qDef.autoSort).toBe(true);
    });
  });

  describe('createLibraryDimension', () => {
    beforeEach(() => {
      handler = new DataPropertyHandler({
        dimensionProperties: { someProperty: 'defaultValue' },
      });
    });

    test('should create dimension and delete qFieldDefs and qFieldLabels from it', () => {
      const result = handler.createLibraryDimension('libraryId', { customDefault: 'value' });

      expect(result.qLibraryId).toBe('libraryId');
      expect(result.qDef.qSortCriterias).toEqual(sortingProperties);
      expect(result.someProperty).toBe('defaultValue');
      expect(result.customDefault).toBe('value');
      expect(result.qDef.autoSort).toBe(true);
      expect(result.qDef.qFieldDefs).toBeUndefined();
      expect(result.qDef.qFieldLabels).toBeUndefined();
    });
  });

  describe('createExpressionMeasure', () => {
    beforeEach(() => {
      handler = new DataPropertyHandler({
        measureProperties: { someProperty: 'defaultValue' },
      });
    });

    test('should create a measure with provided expression and label', () => {
      const result = handler.createExpressionMeasure('SUM(Sales)', 'Total Sales', { customDefault: 'value' });

      expect(result.qDef.qDef).toBe('SUM(Sales)');
      expect(result.qDef.qLabel).toBe('Total Sales');
      expect(result.qDef.autoSort).toBe(true);
      expect(result.someProperty).toBe('defaultValue');
      expect(result.customDefault).toBe('value');
    });

    test('should initialize qDef and qNumFormat if not provided', () => {
      const result = handler.createExpressionMeasure('SUM(Sales)', 'Total Sales', {});

      expect(result.qDef).toBeDefined();
      expect(result.qDef.qNumFormat).toBeDefined();
    });

    test('should handle empty defaults gracefully', () => {
      const result = handler.createExpressionMeasure('SUM(Sales)', 'Total Sales', null);

      expect(result.qDef.qDef).toBe('SUM(Sales)');
      expect(result.qDef.qLabel).toBe('Total Sales');
      expect(result.qDef.autoSort).toBe(true);
      expect(result.someProperty).toBe('defaultValue');
    });
  });

  describe('createLibraryMeasure', () => {
    beforeEach(() => {
      handler = new DataPropertyHandler({
        measureProperties: { someProperty: 'defaultValue' },
      });
    });

    test('should create a library measure with provided id and defaults', () => {
      const result = handler.createLibraryMeasure('libraryId', { customDefault: 'value' });

      expect(result.qLibraryId).toBe('libraryId');
      expect(result.qDef.qNumFormat).toBeDefined();
      expect(result.qDef.autoSort).toBe(true);
      expect(result.someProperty).toBe('defaultValue');
      expect(result.customDefault).toBe('value');
    });

    test('should initialize qDef and qNumFormat if not provided', () => {
      const result = handler.createLibraryMeasure('libraryId', {});

      expect(result.qDef).toBeDefined();
      expect(result.qDef.qNumFormat).toBeDefined();
    });

    test('should delete qDef.qDef and qDef.qLabel from the measure', () => {
      const result = handler.createLibraryMeasure('libraryId', {});

      expect(result.qDef.qDef).toBeUndefined();
      expect(result.qDef.qLabel).toBeUndefined();
    });
  });

  describe('maxMeasures', () => {
    beforeEach(() => {
      handler = new HyperCubeHandler({
        measureDefinition: { max: 0 },
        dimensionDefinition: { max: 0 },
      });
      handler.getDimensions = jest.fn().mockReturnValue([{ qDef: { cId: 'dim1' } }, { qDef: { cId: 'dim2' } }]);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('should return the result of measureDefinition.max when it is a function', () => {
      handler.measureDefinition.max = jest.fn().mockReturnValue(5);

      const result = handler.maxMeasures();
      expect(result).toBe(5);
    });

    test('should return measureDefinition.max when it is a valid number', () => {
      handler.measureDefinition.max = 8;

      const result = handler.maxMeasures();
      expect(result).toBe(8);
    });

    test('should return 10000 when measureDefinition.max is NaN', () => {
      handler.measureDefinition.max = NaN;

      const result = handler.maxMeasures();
      expect(result).toBe(10000);
    });

    test('should decrement the dimension length when decrement is provided', () => {
      handler.measureDefinition.max = jest.fn().mockReturnValue(4);

      const result = handler.maxMeasures(1);
      expect(result).toBe(4);
    });

    test('should return 10000 when measureDefinition.max is not defined', () => {
      handler.measureDefinition.max = undefined;

      const result = handler.maxMeasures();
      expect(result).toBe(10000);
    });
  });

  describe('maxDimensions', () => {
    beforeEach(() => {
      handler = new HyperCubeHandler({
        measureDefinition: { max: 0 },
        dimensionDefinition: { max: 0 },
      });
      handler.getMeasures = jest.fn().mockReturnValue([{ qDef: { cId: 'meas1' } }, { qDef: { cId: 'meas2' } }]);
    });

    test('should return the result of dimensionDefinition.max when it is a function', () => {
      handler.dimensionDefinition.max = jest.fn().mockReturnValue(5);

      const result = handler.maxDimensions();
      expect(result).toBe(5);
    });

    test('should return dimensionDefinition.max when it is a valid number', () => {
      handler.dimensionDefinition.max = 8;

      const result = handler.maxDimensions();
      expect(result).toBe(8);
    });

    test('should return 10000 when dimensionDefinition.max is NaN', () => {
      handler.dimensionDefinition.max = NaN;

      const result = handler.maxDimensions();
      expect(result).toBe(10000);
    });

    test('should decrement the measure length when decrement is provided', () => {
      handler.dimensionDefinition.max = jest.fn().mockReturnValue(4);

      const result = handler.maxDimensions(1);
      expect(result).toBe(4);
    });

    test('should return 10000 when dimensionDefinition.max is not defined', () => {
      handler.dimensionDefinition.max = undefined;

      const result = handler.maxDimensions();
      expect(result).toBe(10000);
    });
  });
});
