/* eslint import/newline-after-import: 0 */
import * as loadModule from '../load';
import create from '../type';
const semverModule = require('semver');
const supernovaModule = require('@nebula.js/supernova');

jest.mock('@nebula.js/supernova', () => ({ ...jest.requireActual('@nebula.js/supernova') }));
jest.mock('semver', () => ({ ...jest.requireActual('semver') }));

describe('type', () => {
  let c;
  let SNFactory;
  let load;
  let satisfies;
  let halo;
  beforeEach(() => {
    SNFactory = jest.fn();
    load = jest.fn();
    satisfies = jest.fn();

    jest.spyOn(supernovaModule, 'generator').mockImplementation(SNFactory);
    jest.spyOn(semverModule, 'satisfies').mockImplementation(satisfies);
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
    beforeEach(() => {
      satisfies.mockReturnValue('a bool');
    });

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
      expect(cc.supportsPropertiesVersion('1.2.0')).toBe('a bool');
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
  });
});
