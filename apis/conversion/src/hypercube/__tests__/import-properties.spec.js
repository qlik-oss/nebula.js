const doMock = ({ helpers = {} } = {}) =>
  aw.mock([['**/helpers/index.js', () => helpers]], ['../import-properties.js']);

describe('importProperties', () => {
  let sandbox;
  let importProperties;
  let helpers;
  let exportFormat;
  let initialProperties;
  let defaultPropertyValues;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    helpers = {
      createNewProperties: sandbox.stub().returns({ qHyperCubeDef: { qDimensions: [], qMeasures: [] } }),
      getMaxMinDimensionMeasure: sandbox
        .stub()
        .returns({ maxDimensions: 1, minDimensions: 1, maxMeasures: 3, minMeasures: 1 }),
      getDefaultDimension: sandbox.stub().returns({ prop1: 1 }),
      getDefaultMeasure: sandbox.stub().returns({ prop2: 2 }),
      shouldInitLayoutExclude: sandbox.stub().returns(true),
      initLayoutExclude: sandbox.stub(),
      setInterColumnSortOrder: sandbox.stub(),
      addDefaultDimensions: sandbox.stub(),
      addDefaultMeasures: sandbox.stub(),
      copyPropertyIfExist: sandbox.stub(),
      copyPropertyOrSetDefault: sandbox.stub(),
      importCommonProperties: sandbox.stub(),
      updateDimensionsOnAdded: sandbox.stub(),
      updateMeasuresOnAdded: sandbox.stub(),
    };
    [{ default: importProperties }] = doMock({ helpers });
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
    defaultPropertyValues = {};
  });

  afterEach(() => {
    sandbox.reset();
    sandbox.restore();
  });

  it('should run helpers correctly if there is no defaultPropertyValues', () => {
    importProperties({ exportFormat, initialProperties, defaultPropertyValues });
    expect(helpers.createNewProperties.callCount).to.equal(1);
    expect(helpers.getMaxMinDimensionMeasure.callCount).to.equal(1);
    expect(helpers.getDefaultDimension.callCount).to.equal(1);
    expect(helpers.getDefaultMeasure.callCount).to.equal(1);
    expect(helpers.shouldInitLayoutExclude.callCount).to.equal(1);
    expect(helpers.initLayoutExclude.callCount).to.equal(1);
    expect(helpers.addDefaultDimensions.callCount).to.equal(1);
    expect(helpers.addDefaultMeasures.callCount).to.equal(1);
    expect(helpers.setInterColumnSortOrder.callCount).to.equal(1);
    expect(helpers.copyPropertyIfExist.callCount).to.equal(2);
    expect(helpers.copyPropertyOrSetDefault.callCount).to.equal(6);
    expect(helpers.importCommonProperties.callCount).to.equal(1);
    expect(helpers.updateDimensionsOnAdded.callCount).to.equal(1);
    expect(helpers.updateMeasuresOnAdded.callCount).to.equal(1);
  });

  it('should run helpers correctly if there is defaultPropertyValues', () => {
    defaultPropertyValues = { defaultDimension: {}, defaultMeasure: {} };
    importProperties({ exportFormat, initialProperties, defaultPropertyValues });
    expect(helpers.createNewProperties.callCount).to.equal(1);
    expect(helpers.getMaxMinDimensionMeasure.callCount).to.equal(1);
    expect(helpers.getDefaultDimension.callCount).to.equal(0);
    expect(helpers.getDefaultMeasure.callCount).to.equal(0);
    expect(helpers.shouldInitLayoutExclude.callCount).to.equal(1);
    expect(helpers.initLayoutExclude.callCount).to.equal(1);
    expect(helpers.addDefaultDimensions.callCount).to.equal(1);
    expect(helpers.addDefaultMeasures.callCount).to.equal(1);
    expect(helpers.setInterColumnSortOrder.callCount).to.equal(1);
    expect(helpers.copyPropertyIfExist.callCount).to.equal(2);
    expect(helpers.copyPropertyOrSetDefault.callCount).to.equal(6);
    expect(helpers.importCommonProperties.callCount).to.equal(1);
    expect(helpers.updateDimensionsOnAdded.callCount).to.equal(1);
    expect(helpers.updateMeasuresOnAdded.callCount).to.equal(1);
  });

  it('should run helpers correctly if layoutExlcude is disabled', () => {
    helpers.shouldInitLayoutExclude = sandbox.stub().returns(false);
    [{ default: importProperties }] = doMock({ helpers });
    defaultPropertyValues = { defaultDimension: {}, defaultMeasure: {} };
    importProperties({ exportFormat, initialProperties, defaultPropertyValues });
    expect(helpers.createNewProperties.callCount).to.equal(1);
    expect(helpers.getMaxMinDimensionMeasure.callCount).to.equal(1);
    expect(helpers.getDefaultDimension.callCount).to.equal(0);
    expect(helpers.getDefaultMeasure.callCount).to.equal(0);
    expect(helpers.shouldInitLayoutExclude.callCount).to.equal(1);
    expect(helpers.initLayoutExclude.callCount).to.equal(0);
    expect(helpers.addDefaultDimensions.callCount).to.equal(1);
    expect(helpers.addDefaultMeasures.callCount).to.equal(1);
    expect(helpers.setInterColumnSortOrder.callCount).to.equal(1);
    expect(helpers.copyPropertyIfExist.callCount).to.equal(2);
    expect(helpers.copyPropertyOrSetDefault.callCount).to.equal(6);
    expect(helpers.importCommonProperties.callCount).to.equal(1);
    expect(helpers.updateDimensionsOnAdded.callCount).to.equal(1);
    expect(helpers.updateMeasuresOnAdded.callCount).to.equal(1);
  });
});
