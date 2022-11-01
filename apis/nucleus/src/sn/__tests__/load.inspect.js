import { load, clearFromCache } from '../load';

describe('load', () => {
  let halo = {};
  // eslint-disable-next-line no-underscore-dangle
  global.__NEBULA_DEV__ = false;
  beforeEach(() => {
    halo = {
      config: {
        load: jest.fn(),
      },
    };
  });
  afterEach(() => {
    clearFromCache('pie');
  });

  test('should throw when load is not a function', async () => {
    const loader = { then: {} }; // fake promise
    try {
      await load('pie', '1.0.0', halo, loader);
      expect(0).toBe(1);
    } catch (e) {
      expect(e.message).toBe(`load of visualization 'pie v1.0.0' is not a fuction, wrap load promise in function`);
    }
  });

  test('should throw when resolving to a falsy value', async () => {
    const loader = () => false;
    try {
      await load('pie', '1.0.0', halo, loader);
      expect(0).toBe(1);
    } catch (e) {
      expect(e.message).toBe("Failed to load visualization: 'pie v1.0.0'");
    }
  });

  test('should call load() with name and version', async () => {
    const loader = jest.fn().mockReturnValue({ component: {} });
    load('pie', '1.0.0', halo, loader);
    expect(loader).toHaveBeenCalledWith({ name: 'pie', version: '1.0.0' });
  });

  test('should load valid sn', async () => {
    const sn = { component: {} };
    const loader = () => sn;
    const s = await load('pie', '1.0.0', halo, loader);
    expect(s).toEqual(sn);
  });

  test('should load only once', async () => {
    const sn = { component: {} };
    const loader = () => sn;
    const spy = jest.fn().mockImplementation(loader);
    load('pie', '1.0.0', halo, spy);
    load('pie', '1.0.0', halo, spy);
    load('pie', '1.0.0', halo, spy);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('should fallback to global load() when custom loader is not provided', async () => {
    const sn = { component: {} };
    halo.config.load.mockReturnValue(sn);
    const s = await load('pie', '1.0.0', halo);
    expect(s).toEqual(sn);
  });
});
