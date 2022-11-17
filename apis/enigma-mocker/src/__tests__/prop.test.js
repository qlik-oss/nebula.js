import { getPropValue, getPropFn } from '../prop';

describe('getPropValue', () => {
  describe('value is fixed', () => {
    test('supports value of type string', () => {
      const value = getPropValue('foo');
      expect(value).toBe('foo');
    });

    test('supports value of type object', () => {
      const value = getPropValue({ foo: 'bar' });
      expect(value).toEqual({ foo: 'bar' });
    });

    test('supports value of type null', () => {
      const value = getPropValue(null);
      expect(value).toBe(null);
    });
  });

  describe('value is a function', () => {
    test('invokes function', () => {
      const prop = jest.fn().mockReturnValue(true);
      const value = getPropValue(prop);
      expect(prop).toHaveBeenCalledTimes(1);
      expect(value).toBe(true);
    });

    test('forwards arguments', () => {
      const prop = jest.fn().mockReturnValue(true);
      const value = getPropValue(prop, { args: [true, 'search'] });
      expect(prop).toHaveBeenCalledWith(true, 'search');
      expect(value).toBe(true);
    });

    test('returns dynamic value', () => {
      const prop = jest.fn().mockReturnValue({ result: [] });
      const value = getPropValue(prop);
      expect(value).toEqual({ result: [] });
    });
  });

  describe('no value defined', () => {
    test('returns default value', () => {
      const value = getPropValue(undefined, { defaultValue: true });
      expect(value).toBe(true);
    });
  });
});

describe('getPropFn', () => {
  test('returns a function', () => {
    const fn = getPropFn('result');
    expect(fn instanceof Function).toBe(true);
  });

  test('forwards arguments', async () => {
    const prop = jest.fn().mockReturnValue(10);
    const fn = getPropFn(prop);
    const value = await fn(false, 'status');
    expect(prop).toHaveBeenCalledWith(false, 'status');
    expect(value).toBe(10);
  });

  describe('async is enabled', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('returns promise', async () => {
      const prop = jest.fn().mockReturnValue(500);

      const fn = getPropFn(prop, { async: true });
      const valuePromise = fn();
      expect(valuePromise instanceof Promise).toBe(true);
      jest.advanceTimersByTime(1);
      const value = await valuePromise;
      expect(value).toBe(500);
    });

    test('supports delay', async () => {
      const prop = jest.fn().mockReturnValue(600);
      const promise = getPropFn(prop, { async: true, delay: 500 })();

      jest.advanceTimersByTime(510);

      return promise.then((value) => {
        expect(value).toBe(600);
      });
    });
  });

  describe('async is disabled', () => {
    test('returns the value', () => {
      const prop = jest.fn().mockReturnValue(500);
      const fn = getPropFn(prop, { async: false });
      const value = fn();
      expect(value).toBe(500);
    });
  });
});
