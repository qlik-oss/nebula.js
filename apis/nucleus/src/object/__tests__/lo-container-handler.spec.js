describe('lo-container-handler', () => {
  let h;
  let loc;
  let def;
  let handler;

  before(() => {
    [{ default: handler }] = aw.mock([['**/uid.js', () => () => 'uid']], ['../lo-container-handler.js']);
  });

  const getMockDim = (cId) => ({
    qDef: {
      cId,
    },
  });

  beforeEach(() => {
    loc = {
      qDef: {},
    };
    def = {
      dimensions: {
        added: sinon.stub(),
        removed: sinon.stub(),
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

  it('addDimension should not update dimensions since it is provided from outside', () => {
    h.addDimension(getMockDim());
    expect(def.dimensions.added).calledOnce;
    expect(h.dimensions()).to.deep.equal([]);
    expect(def.dimensions.added).calledWithExactly(
      {
        qDef: {
          cId: 'uid',
          qSortCriterias: [{ qSortByAscii: 1, qSortByLoadOrder: 1, qSortByNumeric: 1, qSortByState: 1 }],
        },
      },
      'props'
    );
  });

  it('removeDimension should pick correct dimension', () => {
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
    expect(def.dimensions.removed).calledWithExactly(dim2, 'props', 1);
  });

  it('maxDimensions should call max func', () => {
    h = handler({
      dc: loc,
      def: {
        dimensions: {
          max: () => 'max hey hey',
        },
      },
    });
    expect(h.maxDimensions()).to.equal('max hey hey');
  });

  it('maxDimensions should be read as a number when not a func', () => {
    h = handler({
      dc: loc,
      def: {
        dimensions: {
          max: 3,
        },
      },
    });
    expect(h.maxDimensions()).to.equal(3);
  });

  it('maxMeasures should be 0', () => {
    h = handler({ dc: loc });
    expect(h.maxMeasures()).to.equal(0);
  });

  it('canAddDimension should be true', () => {
    h = handler({
      dc: loc,
      dimensions: [{}, {}, {}],
      def: {
        dimensions: {
          max: 4,
        },
      },
    });
    expect(h.canAddDimension()).to.equal(true);
  });

  it('canAddDimension should be false', () => {
    h = handler({
      dc: loc,
      dimensions: [{}, {}, {}, {}],
      def: {
        dimensions: {
          max: 4,
        },
      },
    });
    expect(h.canAddDimension()).to.equal(false);
  });

  it('canAddMeasure should always be false', () => {
    h = handler({ dc: loc });
    expect(h.canAddMeasure()).to.equal(false);
  });
});
