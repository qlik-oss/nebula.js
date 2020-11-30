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
});
