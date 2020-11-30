const doMock = ({ helpers = {} } = {}) =>
  aw.mock([['**/helpers/index.js', () => helpers]], ['../import-properties.js']);

describe('importProperties', () => {
  let sandbox;
  let importProperties;
  let helpers;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    helpers = {
      createNewProperties: sandbox.stub().returns({ qHyperCubeDef: { qDimensions: [], qMeasures: [] } }),
      getMaxMinDimensionMeasure: sandbox
        .stub()
        .returns({ maxDimensions: 1, minDimensions: 1, maxMeasures: 3, minMeasures: 1 }),
      getDefaultDimension: sandbox.stub().returns({ prop1: 1 }),
      getDefaultMeasure: sandbox.stub().returns({ prop2: 2 }),
      setInterColumnSortOrder: sandbox.stub(),
      copyPropertyIfExist: sandbox.stub(),
      copyPropertyOrSetDefault: sandbox.stub(),
      importCommonProperties: sandbox.stub(),
    };
    [{ default: importProperties }] = doMock({ helpers });
  });

  describe('interColumnSortOrder', () => {
    let exportFormat;
    let initialProperties;

    beforeEach(() => {
      exportFormat = {
        data: [
          {
            dimensions: [],
            measures: [],
            excludedDimensions: [],
            excludedMeasures: [],
            interColumnSortOrder: [],
          },
        ],
        properties: {},
      };

      initialProperties = {};
    });

    it('should run helpers correctly', () => {
      importProperties({ exportFormat, initialProperties });
      expect(helpers.createNewProperties.callCount).to.equal(1);
      expect(helpers.getMaxMinDimensionMeasure.callCount).to.equal(1);
      expect(helpers.getDefaultDimension.callCount).to.equal(1);
      expect(helpers.getDefaultMeasure.callCount).to.equal(1);
      expect(helpers.setInterColumnSortOrder.callCount).to.equal(1);
      expect(helpers.copyPropertyIfExist.callCount).to.equal(2);
      expect(helpers.copyPropertyOrSetDefault.callCount).to.equal(6);
      expect(helpers.importCommonProperties.callCount).to.equal(1);
    });
  });
});
