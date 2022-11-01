import * as uidModule from '../uid';
import handler from '../lo-container-handler';

describe('lo-container-handler', () => {
  let h;
  let loc;
  let def;

  const getMockDim = (cId) => ({
    qDef: {
      cId,
    },
  });

  beforeEach(() => {
    jest.spyOn(uidModule, 'default').mockImplementation(() => 'uid');
    loc = {
      qDef: {},
    };
    def = {
      dimensions: {
        added: jest.fn(),
        removed: jest.fn(),
        min: () => 0,
        max: () => 2,
      },
    };

    h = handler({
      dc: loc,
      def,
      properties: 'props',
      dimensions: [],
    });
  });

  test('addDimension should not update dimensions since it is provided from outside', () => {
    h.addDimension(getMockDim());
    expect(def.dimensions.added).toHaveBeenCalledTimes(1);
    expect(h.dimensions()).toEqual([]);
    expect(def.dimensions.added).toHaveBeenCalledWith(
      {
        qDef: {
          cId: 'uid',
          qSortCriterias: [{ qSortByAscii: 1, qSortByLoadOrder: 1, qSortByNumeric: 1, qSortByState: 1 }],
        },
      },
      'props'
    );
  });

  test('removeDimension should pick correct dimension', () => {
    const dim1 = getMockDim('id-1');
    const dim2 = getMockDim('id-2');
    const dim3 = getMockDim('id-3');
    h = handler({
      dc: loc,
      def,
      properties: 'props',
      dimensions: [dim1, dim2, dim3],
    });
    h.removeDimension(1);
    expect(def.dimensions.removed).toHaveBeenCalledWith(dim2, 'props', 1);
  });

  test('maxDimensions should call max func', () => {
    h = handler({
      dc: loc,
      def: {
        dimensions: {
          max: () => 'max hey hey',
        },
      },
    });
    expect(h.maxDimensions()).toBe('max hey hey');
  });

  test('maxDimensions should be read as a number when not a func', () => {
    h = handler({
      dc: loc,
      def: {
        dimensions: {
          max: 3,
        },
      },
    });
    expect(h.maxDimensions()).toBe(3);
  });

  test('maxMeasures should be 0', () => {
    h = handler({ dc: loc });
    expect(h.maxMeasures()).toBe(0);
  });

  test('canAddDimension should be true', () => {
    h = handler({
      dc: loc,
      dimensions: [{}, {}, {}],
      def: {
        dimensions: {
          max: 4,
        },
      },
    });
    expect(h.canAddDimension()).toBe(true);
  });

  test('canAddDimension should be false', () => {
    h = handler({
      dc: loc,
      dimensions: [{}, {}, {}, {}],
      def: {
        dimensions: {
          max: 4,
        },
      },
    });
    expect(h.canAddDimension()).toBe(false);
  });

  test('canAddMeasure should always be false', () => {
    h = handler({ dc: loc });
    expect(h.canAddMeasure()).toBe(false);
  });
});
