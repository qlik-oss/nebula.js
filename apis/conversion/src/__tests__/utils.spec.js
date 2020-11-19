import utils from '../utils';

describe('utils', () => {
  describe('getValue', () => {
    const { getValue } = utils;
    let object;

    beforeEach(() => {
      object = {
        string: 'string 1',
        number: 1,
        boolean: true,
        object: { id: 'object 1' },
        array: [1, 2, 3],
        second: {
          string: 'string 2',
          number: 2,
          boolean: false,
          object: { id: 'object 2' },
          array: [4, 5, 6],
          third: {
            string: 'string 3',
            number: 3,
            boolean: true,
            object: { id: 'object 3' },
            array: [7, 8, 9],
          },
        },
      };
    });

    it('should return fallback value if object is undefined', () => {
      expect(getValue(undefined, '', 'fallback')).to.equal('fallback');
    });

    it('should return fallback value if reference is undefined', () => {
      expect(getValue(object, undefined, 'fallback')).to.equal('fallback');
    });

    it('should get correct values from first level', () => {
      expect(getValue(object, 'string')).to.equal('string 1');
      expect(getValue(object, 'number')).to.equal(1);
      expect(getValue(object, 'boolean')).to.be.true;
      expect(getValue(object, 'object')).to.deep.equal({ id: 'object 1' });
      expect(getValue(object, 'array')).to.deep.equal([1, 2, 3]);
      expect(getValue(object, 'array.1')).to.equal(2);
      expect(getValue(object, 'missing', 'fallback')).to.equal('fallback');
    });

    it('should get correct values from second level', () => {
      expect(getValue(object, 'second.string')).to.equal('string 2');
      expect(getValue(object, 'second.number')).to.equal(2);
      expect(getValue(object, 'second.boolean')).to.be.false;
      expect(getValue(object, 'second.object')).to.deep.equal({ id: 'object 2' });
      expect(getValue(object, 'second.array')).to.deep.equal([4, 5, 6]);
      expect(getValue(object, 'second.array.1')).to.equal(5);
      expect(getValue(object, 'second.missing', 'fallback')).to.equal('fallback');
    });

    it('should get correct values from third level', () => {
      expect(getValue(object, 'second.third.string')).to.equal('string 3');
      expect(getValue(object, 'second.third.number')).to.equal(3);
      expect(getValue(object, 'second.third.boolean')).to.be.true;
      expect(getValue(object, 'second.third.object')).to.deep.equal({ id: 'object 3' });
      expect(getValue(object, 'second.third.array')).to.deep.equal([7, 8, 9]);
      expect(getValue(object, 'second.third.array.1')).to.equal(8);
      expect(getValue(object, 'second.third.missing', 'fallback')).to.equal('fallback');
    });
  });

  describe('setValue', () => {
    const { setValue } = utils;
    let object;

    beforeEach(() => {
      object = {};
    });

    it('should be able to handle undefined object', () => {
      setValue(undefined, '', false);
    });

    it('should not mutate object if reference is undefined', () => {
      setValue(object, undefined, false);
      expect(object).to.deep.equal({});
    });

    it('should set correct values on first level', () => {
      setValue(object, 'string', 'string 1');
      setValue(object, 'number', 1);
      setValue(object, 'boolean', true);
      setValue(object, 'object', { id: 'object 1' });
      setValue(object, 'array', [1, 1, 1]);
      setValue(object, 'array.1', 0);

      expect(object).to.deep.equal({
        string: 'string 1',
        number: 1,
        boolean: true,
        object: { id: 'object 1' },
        array: [1, 0, 1],
      });

      setValue(object, 'string', undefined);

      expect(object).to.deep.equal({
        number: 1,
        boolean: true,
        object: { id: 'object 1' },
        array: [1, 0, 1],
      });
    });

    it('should set correct values on second level', () => {
      setValue(object, 'second.string', 'string 2');
      setValue(object, 'second.number', 2);
      setValue(object, 'second.boolean', true);
      setValue(object, 'second.object', { id: 'object 2' });
      setValue(object, 'second.array', [2, 2, 2]);
      setValue(object, 'second.array.1', 0);

      expect(object).to.deep.equal({
        second: {
          string: 'string 2',
          number: 2,
          boolean: true,
          object: { id: 'object 2' },
          array: [2, 0, 2],
        },
      });

      setValue(object, 'second.string', undefined);

      expect(object).to.deep.equal({
        second: {
          number: 2,
          boolean: true,
          object: { id: 'object 2' },
          array: [2, 0, 2],
        },
      });
    });

    it('should set correct values on third level', () => {
      setValue(object, 'second.third.string', 'string 3');
      setValue(object, 'second.third.number', 3);
      setValue(object, 'second.third.boolean', true);
      setValue(object, 'second.third.object', { id: 'object 3' });
      setValue(object, 'second.third.array', [3, 3, 3]);
      setValue(object, 'second.third.array.1', 0);

      expect(object).to.deep.equal({
        second: {
          third: {
            string: 'string 3',
            number: 3,
            boolean: true,
            object: { id: 'object 3' },
            array: [3, 0, 3],
          },
        },
      });

      setValue(object, 'second.third.string', undefined);

      expect(object).to.deep.equal({
        second: {
          third: {
            number: 3,
            boolean: true,
            object: { id: 'object 3' },
            array: [3, 0, 3],
          },
        },
      });
    });
  });

  describe('isEmpty', () => {
    const { isEmpty } = utils;
    it('should return false if it is not an object', () => {
      expect(isEmpty(0)).to.equal(false);
      expect(isEmpty('')).to.equal(false);
      expect(isEmpty('0')).to.equal(false);
      expect(isEmpty([])).to.equal(false);
    });

    it('should return false if it is an object which is not empty', () => {
      expect(isEmpty({ a: 0 })).to.equal(false);
      expect(isEmpty({ b: '' })).to.equal(false);
      expect(isEmpty({ c: [] })).to.equal(false);
    });

    it('should return true if it is an empyt object', () => {
      expect(isEmpty({})).to.equal(true);
    });
  });
});
