describe('hc-handler', () => {
  let h;
  let hc;
  let def;
  let handler;
  before(() => {
    [{ default: handler }] = aw.mock([['**/uid.js', () => () => 'uid']], ['../hc-handler.js']);
  });

  beforeEach(() => {
    hc = {};
    def = {
      dimensions: {
        added: sinon.stub(),
        removed: sinon.stub(),
        min: () => 0,
        max: () => 2,
      },
      measures: {
        added: sinon.stub(),
        removed: sinon.stub(),
        min: () => 0,
        max: () => 3,
      },
    };

    h = handler({
      hc,
      def,
      properties: 'props',
    });
  });

  it('should add default values', () => {
    expect(hc).to.eql({
      qDimensions: [],
      qMeasures: [],
      qInterColumnSortOrder: [],
      qInitialDataFetch: [],
      qColumnOrder: [],
      qExpansionState: [],
    });
  });

  describe('add dimension', () => {
    it('from string', () => {
      h.addDimension('A');
      expect(hc.qDimensions).to.eql([
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

    it('from object', () => {
      h.addDimension({
        qTotalLabel: 'total',
      });
      expect(hc.qDimensions).to.eql([
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

    it('should not add more than 2', () => {
      h.addDimension('A');
      h.addDimension('B');
      h.addDimension('C');
      expect(hc.qDimensions.length).to.eql(2);
    });

    it('should call added hook on definition', () => {
      h.addDimension({ a: 'b' });
      expect(def.dimensions.added).to.have.been.calledWithExactly(
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

    it('should add overflow to layoutExclude', () => {
      h.addDimension('A');
      h.addDimension('B');
      h.addDimension({ a: '=a' });
      expect(hc.qLayoutExclude.qHyperCubeDef.qDimensions).to.eql([
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

    it('should update qInterColumnSortOrder', () => {
      h.addDimension('A');
      h.addDimension('B');
      expect(hc.qInterColumnSortOrder).to.eql([0, 1]);
    });
  });

  describe('remove dimension', () => {
    beforeEach(() => {
      hc.qDimensions = ['a', 'b', 'c'];
      hc.qInterColumnSortOrder = [2, 1, 0];
    });

    it('by index', () => {
      h.removeDimension(1);
      expect(hc.qDimensions).to.eql(['a', 'c']);
    });

    it('should call removed hook on definition', () => {
      h.removeDimension(1);
      expect(def.dimensions.removed).to.have.been.calledWithExactly('b', 'props', 1);
    });

    it('should update qInterColumnSortOrder', () => {
      h.removeDimension(1);
      expect(hc.qInterColumnSortOrder).to.eql([1, 0]);
    });
  });

  describe('add measure', () => {
    it('from string', () => {
      h.addMeasure('A');
      expect(hc.qMeasures).to.eql([
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

    it('from object', () => {
      h.addMeasure({
        bla: 'meh',
      });
      expect(hc.qMeasures).to.eql([
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

    it('should not add more than 3', () => {
      h.addMeasure('A');
      h.addMeasure('B');
      h.addMeasure('C');
      h.addMeasure('D');
      expect(hc.qMeasures.length).to.eql(3);
    });

    it('should call added hook on definition', () => {
      h.addMeasure({ a: 'b' });
      expect(def.measures.added).to.have.been.calledWithExactly(
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

    it('should add overflow to layoutExclude', () => {
      h.addMeasure('A');
      h.addMeasure('B');
      h.addMeasure('C');
      h.addMeasure({ a: '=a' });
      expect(hc.qLayoutExclude.qHyperCubeDef.qMeasures).to.eql([
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

    it('should update qInterColumnSortOrder', () => {
      hc.qDimensions = ['a', 'b'];
      hc.qInterColumnSortOrder = [0, 1];
      h.addMeasure('m1');
      h.addMeasure('m2');
      expect(hc.qInterColumnSortOrder).to.eql([0, 1, 2, 3]);
    });
  });

  describe('remove measure', () => {
    beforeEach(() => {
      hc.qDimensions = ['a'];
      hc.qMeasures = ['b', 'c', 'd'];
      hc.qInterColumnSortOrder = [2, 1, 0, 3];
    });

    it('by index', () => {
      h.removeMeasure(1);
      expect(hc.qMeasures).to.eql(['b', 'd']);
    });

    it('should call removed hook on definition', () => {
      h.removeMeasure(1);
      expect(def.measures.removed).to.have.been.calledWithExactly('c', 'props', 1);
    });

    it('should update qInterColumnSortOrder', () => {
      h.removeMeasure(1);
      expect(hc.qInterColumnSortOrder).to.eql([1, 0, 2]);
    });
  });
});
