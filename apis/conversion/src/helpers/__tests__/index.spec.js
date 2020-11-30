import helpers from '../index';

describe('helpers', () => {
  describe('restoreChangedProperties', () => {
    it('should restore changed properties correctly', async () => {
      const properties = {
        prop1: 1,
        prop2: 222,
        qLayoutExclude: {
          changed: {
            prop1: {
              to: 1,
              from: 11,
            },
            prop2: {
              to: 2,
              from: 22,
            },
            prop3: {
              to: 3,
              from: 33,
            },
          },
        },
      };
      helpers.restoreChangedProperties(properties);
      expect(properties).to.deep.equal({
        prop1: 11,
        prop2: 222,
        qLayoutExclude: {
          changed: {
            prop1: {
              to: 1,
              from: 11,
            },
            prop2: {
              to: 2,
              from: 22,
            },
            prop3: {
              to: 3,
              from: 33,
            },
          },
        },
      });
    });
  });

  describe('isMasterItemPropperty', () => {
    it('should return true for qMetaDef', () => {
      expect(helpers.isMasterItemPropperty('qMetaDef')).to.equal(true);
    });

    it('should return true for descriptionExpression', () => {
      expect(helpers.isMasterItemPropperty('descriptionExpression')).to.equal(true);
    });

    it('should return true for labelExpression', () => {
      expect(helpers.isMasterItemPropperty('labelExpression')).to.equal(true);
    });

    it('should return false for everything else', () => {
      expect(helpers.isMasterItemPropperty('qMetaDef1')).to.equal(false);
      expect(helpers.isMasterItemPropperty('descriptionExpression1')).to.equal(false);
      expect(helpers.isMasterItemPropperty('labelExpression1')).to.equal(false);
      expect(helpers.isMasterItemPropperty('abc')).to.equal(false);
    });
  });

  describe('importCommonProperties', () => {
    let newProperties;
    let exportFormat;
    let initialProperties;
    describe('visualization', () => {
      beforeEach(() => {
        newProperties = {};
        exportFormat = {};
        initialProperties = {
          visualization: 'some visualization',
        };
      });

      it('should copy visualization correctly', () => {
        helpers.importCommonProperties(newProperties, exportFormat, initialProperties);
        expect(newProperties.visualization).to.equal('some visualization');
      });
    });

    describe('qType', () => {
      beforeEach(() => {
        newProperties = {};
        exportFormat = {};
        initialProperties = {
          qInfo: { qType: 'some type' },
        };
      });

      it('should set qType correctly if it is not a master object', () => {
        helpers.importCommonProperties(newProperties, exportFormat, initialProperties);
        expect(newProperties.qInfo.qType).to.equal('some type');
      });

      it('should set qType correctly if it is a master object', () => {
        exportFormat.properties = { qInfo: { qType: 'masterobject' } };
        helpers.importCommonProperties(newProperties, exportFormat, initialProperties);
        expect(newProperties.qInfo.qType).to.equal('masterobject');
      });
    });
  });

  describe('copyPropertyIfExist', () => {
    let source;
    let target;
    beforeEach(() => {
      source = {
        prop1: 1,
        prop2: 2,
        prop3: undefined,
      };
      target = {
        prop1: 10,
        prop3: 30,
        prop4: 40,
      };
    });

    it('should copy property if it exists in source to target', () => {
      helpers.copyPropertyIfExist('prop1', source, target);
      helpers.copyPropertyIfExist('prop2', source, target);
      helpers.copyPropertyIfExist('prop3', source, target);
      helpers.copyPropertyIfExist('prop4', source, target);
      helpers.copyPropertyIfExist('prop5', source, target);

      expect(target).to.deep.equal({
        prop1: 1,
        prop2: 2,
        prop3: undefined,
        prop4: 40,
      });
    });
  });

  describe('copyPropertyOrSetDefault', () => {
    let source;
    let target;
    beforeEach(() => {
      source = {
        prop1: 1,
        prop2: 2,
        prop3: undefined,
      };
      target = {
        prop1: 10,
        prop3: 30,
        prop4: 40,
      };
    });

    it('should copy property if it exists in source to target, otherwise set to default', () => {
      helpers.copyPropertyOrSetDefault('prop1', source, target);
      helpers.copyPropertyOrSetDefault('prop2', source, target);
      helpers.copyPropertyOrSetDefault('prop3', source, target);
      helpers.copyPropertyOrSetDefault('prop4', source, target);
      helpers.copyPropertyOrSetDefault('prop5', source, target);
      helpers.copyPropertyOrSetDefault('prop6', source, target, 60);

      expect(target).to.deep.equal({
        prop1: 1,
        prop2: 2,
        prop3: undefined,
        prop4: undefined,
        prop5: undefined,
        prop6: 60,
      });
    });
  });

  describe('createDefaultDimension', () => {
    let dimensionDef;
    let dimensionProperties;
    beforeEach(() => {
      dimensionDef = {
        prop1: 1,
        prop2: 2,
      };
      dimensionProperties = {
        prop1: 10,
        prop3: 30,
      };
    });

    it('should add default values if there is no qOtherTotalSpec and othersLabel', () => {
      const def = helpers.createDefaultDimension(dimensionDef, dimensionProperties);

      expect(def).to.deep.equal({
        prop1: 1,
        prop2: 2,
        prop3: 30,
        qOtherTotalSpec: {
          qOtherCounted: { qv: '10' },
          qOtherLimit: { qv: '0' },
        },
        othersLabel: 'Others',
      });
    });

    it('should keep othersLabel', () => {
      dimensionProperties.othersLabel = 'some label';
      const def = helpers.createDefaultDimension(dimensionDef, dimensionProperties);

      expect(def).to.deep.equal({
        prop1: 1,
        prop2: 2,
        prop3: 30,
        qOtherTotalSpec: {
          qOtherCounted: { qv: '10' },
          qOtherLimit: { qv: '0' },
        },
        othersLabel: 'some label',
      });
    });

    it('should keep qOtherCounted', () => {
      dimensionProperties.qOtherTotalSpec = { qOtherCounted: { qv: '20' } };
      const def = helpers.createDefaultDimension(dimensionDef, dimensionProperties);

      expect(def).to.deep.equal({
        prop1: 1,
        prop2: 2,
        prop3: 30,
        qOtherTotalSpec: {
          qOtherCounted: { qv: '20' },
          qOtherLimit: { qv: '0' },
        },
        othersLabel: 'Others',
      });
    });

    it('should keep qOtherLimit', () => {
      dimensionProperties.qOtherTotalSpec = { qOtherLimit: { qv: '30' } };
      const def = helpers.createDefaultDimension(dimensionDef, dimensionProperties);

      expect(def).to.deep.equal({
        prop1: 1,
        prop2: 2,
        prop3: 30,
        qOtherTotalSpec: {
          qOtherCounted: { qv: '10' },
          qOtherLimit: { qv: '30' },
        },
        othersLabel: 'Others',
      });
    });

    it('should keep qOtherCounted, qOtherLimit, and othersLabel', () => {
      dimensionProperties.othersLabel = 'some label';
      dimensionProperties.qOtherTotalSpec = {
        qOtherCounted: { qv: '20' },
        qOtherLimit: { qv: '30' },
      };
      const def = helpers.createDefaultDimension(dimensionDef, dimensionProperties);

      expect(def).to.deep.equal({
        prop1: 1,
        prop2: 2,
        prop3: 30,
        qOtherTotalSpec: {
          qOtherCounted: { qv: '20' },
          qOtherLimit: { qv: '30' },
        },
        othersLabel: 'some label',
      });
    });
  });

  describe('createDefaultMeasure', () => {
    let measureDef;
    let measureProperties;
    beforeEach(() => {
      measureDef = {
        prop1: 1,
        prop2: 2,
      };
      measureProperties = {
        prop1: 10,
        prop3: 30,
      };
    });

    it('should create default measure correctly', () => {
      const def = helpers.createDefaultMeasure(measureDef, measureProperties);

      expect(def).to.deep.equal({
        prop1: 1,
        prop2: 2,
        prop3: 30,
      });
    });
  });

  describe('resolveValue', () => {
    let data;
    let input;

    beforeEach(() => {
      data = (a) => a * 2;
      input = 5;
    });

    it('should resolve value correctly if data is a function', () => {
      expect(helpers.resolveValue(data, input)).to.equal(10);
      expect(helpers.resolveValue(data, input, 100)).to.equal(10);
    });

    it('should resolve value correctly if data is a number', () => {
      data = 20;
      expect(helpers.resolveValue(data, input)).to.equal(20);
      expect(helpers.resolveValue(data, input, 100)).to.equal(20);
    });

    it('should resolve value correctly if data is not a function or not a number', () => {
      expect(helpers.resolveValue(NaN, input)).to.equal(undefined);
      expect(helpers.resolveValue(NaN, input, 100)).to.equal(100);
      expect(helpers.resolveValue('a', input)).to.equal(undefined);
      expect(helpers.resolveValue('a', input, 100)).to.equal(100);
    });
  });

  describe('getHypercubePath', () => {
    let qae;

    beforeEach(() => {
      qae = {
        data: { targets: [{ propertyPath: '/qHyperCubeDef' }] },
      };
    });

    it('should return to empty string if propertyPath = "/qHyperCubeDef"', () => {
      expect(helpers.getHypercubePath(qae)).to.equal('');
    });

    it('should return to the part before /qHyperCubeDef', () => {
      qae.data.targets[0].propertyPath = 'boxPlotDef/qHyperCubeDef';
      expect(helpers.getHypercubePath(qae)).to.equal('boxPlotDef');
    });

    it('should return to the part before /qHyperCubeDef and replace / by .', () => {
      qae.data.targets[0].propertyPath = 'boxPlotDef/point/qHyperCubeDef';
      expect(helpers.getHypercubePath(qae)).to.equal('boxPlotDef.point');
    });
  });

  describe('getDefaultDimension', () => {
    it('should return correct default dimension', () => {
      expect(helpers.getDefaultDimension()).to.deep.equal({
        qDef: {
          autoSort: true,
          cId: '',
          othersLabel: 'Others',
        },
        qLibraryId: '',
        qNullSuppression: false,
        qOtherLabel: 'Others',
        qOtherTotalSpec: {
          qOtherLimitMode: 'OTHER_GE_LIMIT',
          qOtherMode: 'OTHER_OFF',
          qOtherSortMode: 'OTHER_SORT_DESCENDING',
          qSuppressOther: false,
        },
      });
    });
  });

  describe('getDefaultMeasure', () => {
    it('should return correct default measure', () => {
      expect(helpers.getDefaultMeasure()).to.deep.equal({
        qDef: {
          autoSort: true,
          cId: '',
          numFormatFromTemplate: true,
        },
        qLibraryId: '',
        qTrendLines: [],
      });
    });
  });

  describe('setInterColumnSortOrder', () => {
    let exportFormat;
    let newHyperCubeDef;

    beforeEach(() => {
      exportFormat = {
        data: [
          {
            interColumnSortOrder: [1, 0, 2],
          },
        ],
      };
      newHyperCubeDef = {
        qDimensions: [{}],
        qMeasures: [{}, {}],
      };
    });

    it('should set correct qInterColumnSortOrder when its size match the number of dimensions and measures', () => {
      helpers.setInterColumnSortOrder({ exportFormat, newHyperCubeDef });
      expect(newHyperCubeDef).to.deep.equal({
        qDimensions: [{}],
        qMeasures: [{}, {}],
        qInterColumnSortOrder: [1, 0, 2],
      });
    });

    it('should set correct qInterColumnSortOrder when its size is bigger than the number of dimensions and measures', () => {
      exportFormat.data[0].interColumnSortOrder = [0, 3, 2, 1];
      helpers.setInterColumnSortOrder({ exportFormat, newHyperCubeDef });
      expect(newHyperCubeDef).to.deep.equal({
        qDimensions: [{}],
        qMeasures: [{}, {}],
        qInterColumnSortOrder: [0, 2, 1],
      });
    });

    it('should set correct qInterColumnSortOrder when its size is smaller than the number of dimensions and measures', () => {
      exportFormat.data[0].interColumnSortOrder = [0, 1];
      helpers.setInterColumnSortOrder({ exportFormat, newHyperCubeDef });
      expect(newHyperCubeDef).to.deep.equal({
        qDimensions: [{}],
        qMeasures: [{}, {}],
        qInterColumnSortOrder: [0, 1, 2],
      });
    });

    it('should set correct qInterColumnSortOrder when its size is smaller than the number of dimensions and measures, case 2', () => {
      exportFormat.data[0].interColumnSortOrder = [0, 2, 1];
      newHyperCubeDef.qMeasures = [{}, {}, {}];
      helpers.setInterColumnSortOrder({ exportFormat, newHyperCubeDef });
      expect(newHyperCubeDef).to.deep.equal({
        qDimensions: [{}],
        qMeasures: [{}, {}, {}],
        qInterColumnSortOrder: [0, 2, 1, 3],
      });
    });
  });
});
