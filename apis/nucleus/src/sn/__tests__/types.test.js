import * as loadModule from '../load';
import * as typeModule from '../type';
import { create, semverSort } from '../types';

describe('types', () => {
  let c;
  let type;
  let clearFromCache;
  beforeEach(() => {
    // eslint-disable-next-line no-underscore-dangle
    global.__NEBULA_DEV__ = false;
    type = jest.fn().mockReturnValue('t');
    clearFromCache = jest.fn();

    jest.spyOn(typeModule, 'default').mockImplementation(type);
    jest.spyOn(loadModule, 'clearFromCache').mockImplementation(clearFromCache);

    c = create({ halo: 'halo' });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('semverSort', () => {
    test('should sort valid versions', () => {
      const arr = semverSort(['1.41.0', '0.0.1', 'undefined', '10.4.0', '0.4.0', '1.4.0']);
      expect(arr).toEqual(['undefined', '0.0.1', '0.4.0', '1.4.0', '1.41.0', '10.4.0']);
    });
  });

  describe('factory', () => {
    test('should instantiate a type when registering', () => {
      c.register({ name: 'pie', version: '1.0.3' }, 'opts');
      expect(type).toHaveBeenCalledWith(
        {
          name: 'pie',
          version: '1.0.3',
        },
        'halo',
        'opts'
      );
    });

    test('should instantiate a type when calling get the first time', () => {
      type.mockReturnValue({ name: 'pie', version: '1.0.3' });
      expect(c.get({ name: 'pie', version: '1.0.3' })).toEqual({ name: 'pie', version: '1.0.3' });
      expect(type).toHaveBeenCalledWith(
        {
          name: 'pie',
          version: '1.0.3',
        },
        'halo',
        undefined
      );
    });

    test('should only instantiate a type when calling get the first time', () => {
      type.mockReturnValue({ name: 'pie', version: '1.0.3' });
      c.get({ name: 'pie', version: '1.0.3' }, 'opts');
      expect(c.get({ name: 'pie', version: '1.7.0' })).toEqual({ name: 'pie', version: '1.0.3' });
    });

    test('should throw when registering an already registered version', () => {
      c.register({ name: 'pie', version: '1.0.3' }, 'opts');
      const fn = () => c.register({ name: 'pie', version: '1.0.3' }, 'opts');

      expect(() => fn()).toThrow("Supernova 'pie@1.0.3' already registered.");
    });

    test('should fallback to first registered version when getting unknown version', () => {
      type
        .mockReturnValueOnce({ name: 'pie', version: '1.0.3' })
        .mockReturnValueOnce({ name: 'pie', version: '1.0.4' });
      c.register({ name: 'pie', version: '1.0.3' }, 'opts');
      c.register({ name: 'pie', version: '1.0.4' }, 'opts');
      expect(c.get({ name: 'pie', version: '1.7.0' })).toEqual({ name: 'pie', version: '1.0.3' });
    });

    test('should find 1.5.1 as matching version from properties', () => {
      const supportsPropertiesVersion = jest.fn();
      supportsPropertiesVersion.mockImplementation((arg) => {
        if (arg === '1.2.0') return true;
        return false;
      });

      type.mockImplementation((arg) => {
        if (arg.name === 'pie' && arg.version === '1.5.1') return { supportsPropertiesVersion };
        return { supportsPropertiesVersion: () => false };
      });

      c = create({ config: 'config' });

      c.register({ name: 'pie', version: '1.5.0' });
      c.register({ name: 'pie', version: '1.6.0' });
      c.register({ name: 'pie', version: '1.5.1' });
      c.register({ name: 'pie', version: '1.0.0' });

      const v = c.getSupportedVersion('pie', '1.2.0');
      expect(v).toEqual('1.5.1');
    });

    test('should return null when no fit is found', () => {
      const v = c.getSupportedVersion('pie', '1.2.0');
      expect(v).toBe(null);
    });

    test('should return the requested type and version', () => {
      type.mockReturnValue({ name: 'bar', version: '1.7.0' });
      c = create({ config: 'config' });
      expect(c.get({ name: 'bar', version: '1.7.0' })).toEqual({ name: 'bar', version: '1.7.0' });
    });

    test('should clear cache', () => {
      c = create({ config: 'config' });
      c.clearFromCache('pie');
      expect(clearFromCache).toHaveBeenCalledWith('pie');
    });
  });
});
