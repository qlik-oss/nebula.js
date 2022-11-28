import utils from '../utils';

describe('utils', () => {
  const { getValue, setValue, isEmpty } = utils;

  describe('getValue', () => {
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

    test('should return fallback value if object is undefined', () => {
      expect(getValue(undefined, undefined, 'fallback')).toBe('fallback');
      expect(getValue(undefined, '', 'fallback')).toBe('fallback');
      expect(getValue(undefined, null, 'fallback')).toBe('fallback');
    });

    test('should return fallback value if object is null', () => {
      expect(getValue(null, undefined, 'fallback')).toBe('fallback');
      expect(getValue(null, '', 'fallback')).toBe('fallback');
      expect(getValue(null, null, 'fallback')).toBe('fallback');
    });

    test('should return fallback value if reference is undefined', () => {
      expect(getValue(object, undefined, 'fallback')).toBe('fallback');
    });

    test('should return fallback value if reference is null', () => {
      expect(getValue(object, null, 'fallback')).toBe('fallback');
    });

    test('should return object value if reference is an empty string', () => {
      expect(getValue(object, '', 'fallback')).toEqual(object);
    });

    test('should get correct values from first level', () => {
      expect(getValue(object, 'string')).toBe('string 1');
      expect(getValue(object, 'number')).toBe(1);
      expect(getValue(object, 'boolean')).toBe(true);
      expect(getValue(object, 'object')).toEqual({ id: 'object 1' });
      expect(getValue(object, 'array')).toEqual([1, 2, 3]);
      expect(getValue(object, 'array.1')).toBe(2);
      expect(getValue(object, 'missing', 'fallback')).toBe('fallback');
    });

    test('should get correct values from second level', () => {
      expect(getValue(object, 'second.string')).toBe('string 2');
      expect(getValue(object, 'second.number')).toBe(2);
      expect(getValue(object, 'second.boolean')).toBe(false);
      expect(getValue(object, 'second.object')).toEqual({ id: 'object 2' });
      expect(getValue(object, 'second.array')).toEqual([4, 5, 6]);
      expect(getValue(object, 'second.array.1')).toBe(5);
      expect(getValue(object, 'second.missing', 'fallback')).toBe('fallback');
    });

    test('should get correct values from third level', () => {
      expect(getValue(object, 'second.third.string')).toBe('string 3');
      expect(getValue(object, 'second.third.number')).toBe(3);
      expect(getValue(object, 'second.third.boolean')).toBe(true);
      expect(getValue(object, 'second.third.object')).toEqual({ id: 'object 3' });
      expect(getValue(object, 'second.third.array')).toEqual([7, 8, 9]);
      expect(getValue(object, 'second.third.array.1')).toBe(8);
      expect(getValue(object, 'second.third.missing', 'fallback')).toBe('fallback');
    });
  });

  describe('setValue', () => {
    let object;

    beforeEach(() => {
      object = {};
    });

    test('should be able to handle undefined object', () => {
      expect(setValue(undefined, '', false)).toBe(undefined);
    });

    test('should not mutate object if reference is undefined', () => {
      setValue(object, undefined, false);
      expect(object).toEqual({});
    });

    test('should set correct values on first level', () => {
      setValue(object, 'string', 'string 1');
      setValue(object, 'number', 1);
      setValue(object, 'boolean', true);
      setValue(object, 'object', { id: 'object 1' });
      setValue(object, 'array', [1, 1, 1]);
      setValue(object, 'array.1', 0);

      expect(object).toEqual({
        string: 'string 1',
        number: 1,
        boolean: true,
        object: { id: 'object 1' },
        array: [1, 0, 1],
      });

      setValue(object, 'string', undefined);

      expect(object).toEqual({
        number: 1,
        boolean: true,
        object: { id: 'object 1' },
        array: [1, 0, 1],
      });
    });

    test('should set correct values on second level', () => {
      setValue(object, 'second.string', 'string 2');
      setValue(object, 'second.number', 2);
      setValue(object, 'second.boolean', true);
      setValue(object, 'second.object', { id: 'object 2' });
      setValue(object, 'second.array', [2, 2, 2]);
      setValue(object, 'second.array.1', 0);

      expect(object).toEqual({
        second: {
          string: 'string 2',
          number: 2,
          boolean: true,
          object: { id: 'object 2' },
          array: [2, 0, 2],
        },
      });

      setValue(object, 'second.string', undefined);

      expect(object).toEqual({
        second: {
          number: 2,
          boolean: true,
          object: { id: 'object 2' },
          array: [2, 0, 2],
        },
      });
    });

    test('should set correct values on third level', () => {
      setValue(object, 'second.third.string', 'string 3');
      setValue(object, 'second.third.number', 3);
      setValue(object, 'second.third.boolean', true);
      setValue(object, 'second.third.object', { id: 'object 3' });
      setValue(object, 'second.third.array', [3, 3, 3]);
      setValue(object, 'second.third.array.1', 0);

      expect(object).toEqual({
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

      expect(object).toEqual({
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
    test('should return false if it is not an object', () => {
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty('')).toBe(false);
      expect(isEmpty('0')).toBe(false);
      expect(isEmpty([])).toBe(false);
    });

    test('should return false if it is an object which is not empty', () => {
      expect(isEmpty({ a: 0 })).toBe(false);
      expect(isEmpty({ b: '' })).toBe(false);
      expect(isEmpty({ c: [] })).toBe(false);
    });

    test('should return true if it is an empyt object', () => {
      expect(isEmpty({})).toBe(true);
    });
  });
});
