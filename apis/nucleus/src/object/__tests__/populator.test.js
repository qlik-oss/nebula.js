import * as hcHandlerModule from '../hc-handler';
import * as loHandlerModule from '../lo-handler';
import * as filterpaneHandlerModule from '../filterpane-handler';
import populate, { fieldType as ft } from '../populator';

describe('populator', () => {
  let h;
  let l;
  let f;
  let warn;
  let handler;
  let lohandler;
  let filterpaneHandler;

  beforeEach(() => {
    h = {
      addMeasure: jest.fn(),
      addDimension: jest.fn(),
    };
    l = {
      addMeasure: jest.fn(),
      addDimension: jest.fn(),
    };
    f = {
      addMeasure: jest.fn(),
      addDimension: jest.fn(),
    };
    const fn = () => h;
    const fnl = () => l;
    handler = jest.fn().mockImplementation(fn);
    lohandler = jest.fn().mockImplementation(fnl);
    filterpaneHandler = jest.fn().mockImplementation(() => f);
    jest.spyOn(hcHandlerModule, 'default').mockImplementation(handler);
    jest.spyOn(loHandlerModule, 'default').mockImplementation(lohandler);
    jest.spyOn(filterpaneHandlerModule, 'default').mockImplementation(filterpaneHandler);

    global.__NEBULA_DEV__ = true; // eslint-disable-line no-underscore-dangle
    warn = jest.fn();
    global.console = {
      ...global.console,
      warn,
    };
  });
  afterEach(() => {
    global.__NEBULA_DEV__ = false; // eslint-disable-line no-underscore-dangle
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should not throw if fields are not provided', async () => {
    const fn = () => populate({ sn: null, properties: {}, fields: [] });
    await expect(() => fn).not.toThrow();
  });

  test('should log warning if fields is provided but targets are not specified', async () => {
    const sn = { qae: { data: { targets: [] } } };
    await populate({ sn, properties: {}, fields: [1] });
    expect(warn).toHaveBeenCalledWith('Attempting to add fields to an object without a specified data target');
  });

  test('should initiate handler with resolved target', async () => {
    const target = {
      propertyPath: 'a/b/c',
    };
    const sn = {
      qae: {
        data: {
          targets: [target],
        },
      },
    };
    const resolved = { qDimensions: [] };
    await populate({ sn, properties: { a: { b: { c: resolved } } }, fields: [1] });
    expect(handler).toHaveBeenCalledWith({
      dc: resolved,
      def: target,
      properties: { a: { b: { c: resolved } } },
    });
  });

  test('should add dimension', async () => {
    const target = {
      propertyPath: 'hc',
    };
    const sn = {
      qae: {
        data: {
          targets: [target],
        },
      },
    };
    const resolved = { qDimensions: [] };
    await populate({ sn, properties: { a: { b: { c: resolved } } }, fields: ['A'] });
    expect(h.addDimension).toHaveBeenCalledWith('A');
  });

  test('should add measure', async () => {
    const target = {
      propertyPath: 'hc',
    };
    const sn = {
      qae: {
        data: {
          targets: [target],
        },
      },
    };
    const resolved = { qDimensions: [] };
    await populate({ sn, properties: { a: { b: { c: resolved } } }, fields: ['=A'] });
    expect(h.addMeasure).toHaveBeenCalledWith('=A');
  });

  test('should work for qListObjectDef', async () => {
    const target = {
      propertyPath: '/qListObjectDef',
    };
    const sn = {
      qae: {
        data: {
          targets: [target],
        },
      },
    };
    const resolved = { qDimensions: [] };
    await populate({ sn, properties: { a: { b: { c: resolved } } }, fields: ['A'] });
    expect(l.addDimension).toHaveBeenCalledWith('A');
  });

  test('should work for qChildListDef', async () => {
    const target = {
      propertyPath: '/qChildListDef',
    };
    const sn = {
      qae: {
        data: {
          targets: [target],
        },
      },
    };
    const resolved = { qDimensions: [] };
    await populate({ sn, properties: { a: { b: { c: resolved } } }, fields: ['A'] });
    expect(f.addDimension).toHaveBeenCalledWith('A');
  });

  test("should identify field as measure when prefixed with '='", () => {
    expect(ft('=a')).toBe('measure');
  });

  test('should identify field as measure when object looks like NxMeasure', () => {
    expect(ft({ qDef: { qDef: {} } })).toBe('measure');
  });

  test("should identify field as measure when object contains a qLibraryId and type==='measure'", () => {
    expect(ft({ qLibraryId: 'a', type: 'measure' })).toBe('measure');
  });
});
