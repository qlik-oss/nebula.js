import * as uidModule from '../uid';
import handler from '../hc-handler';

describe('hc-handler', () => {
  let h;
  let hc;
  let def;

  beforeEach(() => {
    jest.spyOn(uidModule, 'default').mockImplementation(() => 'uid');
    hc = {};
    def = {
      dimensions: {
        added: jest.fn(),
        removed: jest.fn(),
        min: () => 0,
        max: () => 2,
      },
      measures: {
        added: jest.fn(),
        removed: jest.fn(),
        min: () => 0,
        max: () => 3,
      },
    };

    h = handler({
      dc: hc,
      def,
      properties: 'props',
    });
  });

  test('should add default values', () => {
    expect(hc).toEqual({
      qDimensions: [],
      qMeasures: [],
      qInterColumnSortOrder: [],
      qInitialDataFetch: [],
      qColumnOrder: [],
      qExpansionState: [],
    });
  });

  describe('add dimension', () => {
    test('from string', () => {
      h.addDimension('A');
      expect(hc.qDimensions).toEqual([
        {
          qDef: {
            cId: 'uid',
            qFieldDefs: ['A'],
            qSortCriterias: [
              {
                qSortByLoadOrder: 1,
                qSortByNumeric: 1,
                qSortByAscii: 1,
              },
            ],
          },
          qAttributeDimensions: [],
          qAttributeExpressions: [],
          qOtherTotalSpec: {},
        },
      ]);
    });

    test('from object', () => {
      h.addDimension({
        qTotalLabel: 'total',
      });
      expect(hc.qDimensions).toEqual([
        {
          qDef: {
            cId: 'uid',
            qSortCriterias: [
              {
                qSortByLoadOrder: 1,
                qSortByNumeric: 1,
                qSortByAscii: 1,
              },
            ],
          },
          qTotalLabel: 'total',
          qAttributeDimensions: [],
          qAttributeExpressions: [],
          qOtherTotalSpec: {},
        },
      ]);
    });

    test('should not add more than 2', () => {
      h.addDimension('A');
      h.addDimension('B');
      h.addDimension('C');
      expect(hc.qDimensions.length).toBe(2);
    });

    test('should call added hook on definition', () => {
      h.addDimension({ a: 'b' });
      expect(def.dimensions.added).toHaveBeenCalledWith(
        {
          a: 'b',
          qDef: {
            cId: 'uid',
            qSortCriterias: [
              {
                qSortByLoadOrder: 1,
                qSortByNumeric: 1,
                qSortByAscii: 1,
              },
            ],
          },
          qAttributeDimensions: [],
          qAttributeExpressions: [],
          qOtherTotalSpec: {},
        },
        'props'
      );
    });

    test('should add overflow to layoutExclude', () => {
      h.addDimension('A');
      h.addDimension('B');
      h.addDimension({ a: '=a' });
      expect(hc.qLayoutExclude.qHyperCubeDef.qDimensions).toEqual([
        {
          a: '=a',
          qDef: {
            cId: 'uid',
            qSortCriterias: [
              {
                qSortByLoadOrder: 1,
                qSortByNumeric: 1,
                qSortByAscii: 1,
              },
            ],
          },
          qAttributeDimensions: [],
          qAttributeExpressions: [],
          qOtherTotalSpec: {},
        },
      ]);
    });

    test('should update qInterColumnSortOrder', () => {
      h.addDimension('A');
      h.addDimension('B');
      expect(hc.qInterColumnSortOrder).toEqual([0, 1]);
    });
  });

  describe('remove dimension', () => {
    beforeEach(() => {
      hc.qDimensions = ['a', 'b', 'c'];
      hc.qInterColumnSortOrder = [2, 1, 0];
    });

    test('by index', () => {
      h.removeDimension(1);
      expect(hc.qDimensions).toEqual(['a', 'c']);
    });

    test('should call removed hook on definition', () => {
      h.removeDimension(1);
      expect(def.dimensions.removed).toHaveBeenCalledWith('b', 'props', 1);
    });

    test('should update qInterColumnSortOrder', () => {
      h.removeDimension(1);
      expect(hc.qInterColumnSortOrder).toEqual([1, 0]);
    });
  });

  describe('add measure', () => {
    test('from string', () => {
      h.addMeasure('A');
      expect(hc.qMeasures).toEqual([
        {
          qDef: {
            cId: 'uid',
            qDef: 'A',
          },
          qSortBy: {
            qSortByLoadOrder: 1,
            qSortByNumeric: -1,
          },
          qAttributeDimensions: [],
          qAttributeExpressions: [],
        },
      ]);
    });

    test('from object', () => {
      h.addMeasure({
        bla: 'meh',
      });
      expect(hc.qMeasures).toEqual([
        {
          qDef: {
            cId: 'uid',
          },
          bla: 'meh',
          qSortBy: {
            qSortByLoadOrder: 1,
            qSortByNumeric: -1,
          },
          qAttributeDimensions: [],
          qAttributeExpressions: [],
        },
      ]);
    });

    test('should not add more than 3', () => {
      h.addMeasure('A');
      h.addMeasure('B');
      h.addMeasure('C');
      h.addMeasure('D');
      expect(hc.qMeasures.length).toBe(3);
    });

    test('should call added hook on definition', () => {
      h.addMeasure({ a: 'b' });
      expect(def.measures.added).toHaveBeenCalledWith(
        {
          a: 'b',
          qDef: { cId: 'uid' },
          qSortBy: {
            qSortByLoadOrder: 1,
            qSortByNumeric: -1,
          },
          qAttributeDimensions: [],
          qAttributeExpressions: [],
        },
        'props'
      );
    });

    test('should add overflow to layoutExclude', () => {
      h.addMeasure('A');
      h.addMeasure('B');
      h.addMeasure('C');
      h.addMeasure({ a: '=a' });
      expect(hc.qLayoutExclude.qHyperCubeDef.qMeasures).toEqual([
        {
          a: '=a',
          qDef: { cId: 'uid' },
          qSortBy: {
            qSortByLoadOrder: 1,
            qSortByNumeric: -1,
          },
          qAttributeDimensions: [],
          qAttributeExpressions: [],
        },
      ]);
    });

    test('should update qInterColumnSortOrder', () => {
      hc.qDimensions = ['a', 'b'];
      hc.qInterColumnSortOrder = [0, 1];
      h.addMeasure('m1');
      h.addMeasure('m2');
      expect(hc.qInterColumnSortOrder).toEqual([0, 1, 2, 3]);
    });
  });

  describe('remove measure', () => {
    beforeEach(() => {
      hc.qDimensions = ['a'];
      hc.qMeasures = ['b', 'c', 'd'];
      hc.qInterColumnSortOrder = [2, 1, 0, 3];
    });

    test('by index', () => {
      h.removeMeasure(1);
      expect(hc.qMeasures).toEqual(['b', 'd']);
    });

    test('should call removed hook on definition', () => {
      h.removeMeasure(1);
      expect(def.measures.removed).toHaveBeenCalledWith('c', 'props', 1);
    });

    test('should update qInterColumnSortOrder', () => {
      h.removeMeasure(1);
      expect(hc.qInterColumnSortOrder).toEqual([1, 0, 2]);
    });
  });
});
