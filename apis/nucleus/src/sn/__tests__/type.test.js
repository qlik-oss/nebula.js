import * as loadModule from '../load';
import create from '../type';

const supernovaModule = require('@nebula.js/supernova');

jest.mock('@nebula.js/supernova', () => ({ ...jest.requireActual('@nebula.js/supernova') }));

describe('type', () => {
  let c;
  let SNFactory;
  let load;
  let halo;
  beforeEach(() => {
    SNFactory = jest.fn();
    load = jest.fn();

    jest.spyOn(supernovaModule, 'generator').mockImplementation(SNFactory);
    jest.spyOn(loadModule, 'load').mockImplementation(load);

    halo = { public: { env: 'env' } };
    c = create({ name: 'pie', version: '1.1.0' }, halo, { load: 'customLoader' });
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('create', () => {
    test('should instantiate a type', () => {
      expect(c.name).toBe('pie');
      expect(c.version).toBe('1.1.0');
    });
  });

  describe('supportsPropertiesVersion', () => {
    test('should return true when no meta is provided', () => {
      const cc = create({});
      expect(cc.supportsPropertiesVersion('1.2.0')).toBe(true);
    });

    test('should return true when no version is provided', () => {
      const c3 = create({}, 'c', { meta: { deps: { properties: 'a' } } });
      expect(c3.supportsPropertiesVersion()).toBe(true);
    });

    test('should return semver satisfaction when version and semver range is provided ', () => {
      const cc = create({}, 'c', { meta: { deps: { properties: '^1.0.0' } } });
      expect(cc.supportsPropertiesVersion('1.2.0')).toBe(true);
    });

    test('should return semver satisfaction when version and semver is not a range', () => {
      const cc = create({}, 'c', { meta: { deps: { properties: '1.0.0' } } });
      expect(cc.supportsPropertiesVersion('1.2.0')).toBe(false);
    });

    test('should return semver satisfaction when version and semver is an open range', () => {
      const cc = create({}, 'c', { meta: { deps: { properties: '>=1.0.0' } } });
      expect(cc.supportsPropertiesVersion('2.2.0')).toBe(true);
    });
  });

  describe('supernova()', () => {
    test('should load a supernova definition and return a supernova', async () => {
      const def = Promise.resolve('def');
      const normalized = { qae: { properties: {} } };

      load.mockResolvedValue(def);
      SNFactory.mockReturnValue(normalized);

      const sn = await c.supernova();
      expect(sn).toEqual(normalized);
    });
  });

  describe('initialProperties()', () => {
    test('should return initial props', async () => {
      const def = Promise.resolve('def');
      const normalized = { qae: { properties: { initial: { a: 'a', b: 'b' } } } };

      load.mockResolvedValue(def);
      SNFactory.mockReturnValue(normalized);

      const props = await c.initialProperties({ c: 'c', b: 'override' });
      expect(props).toEqual({
        qInfo: { qType: 'pie' },
        visualization: 'pie',
        version: '1.1.0',
        a: 'a',
        b: 'override',
        c: 'c',
        showTitles: true,
      });
    });

    test('should allow deep extend', async () => {
      const def = Promise.resolve('def');
      const normalized = { qae: { properties: { initial: { a: 'a', b: { c: 'c', d: 'd' } } } } };

      load.mockResolvedValue(def);
      SNFactory.mockReturnValue(normalized);

      const props = await c.initialProperties({ e: 'e', b: { c: 'override' } }, true);
      expect(props).toEqual({
        qInfo: { qType: 'pie' },
        visualization: 'pie',
        version: '1.1.0',
        a: 'a',
        b: { c: 'override', d: 'd' },
        e: 'e',
        showTitles: true,
      });
    });
  });
});
