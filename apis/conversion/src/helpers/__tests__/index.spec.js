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
});
