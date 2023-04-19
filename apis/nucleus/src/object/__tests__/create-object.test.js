import * as populatorModule from '../populator';
import create from '../create-object';

describe('create-object', () => {
  let halo = {};
  let types;
  let sn;
  let merged;
  let populator;
  let init;
  let objectModel;

  beforeEach(() => {
    populator = jest.fn();
    init = jest.fn();

    jest.spyOn(populatorModule, 'default').mockImplementation(populator);
    objectModel = { id: 'id', on: () => {}, once: () => {} };
    types = {
      get: jest.fn(),
    };
    halo = {
      app: {
        createObject: jest.fn().mockResolvedValue(objectModel),
      },
      types,
    };

    init.mockReturnValue('api');

    sn = { qae: { properties: { onChange: jest.fn() } } };
    merged = { m: 'true' };
    const t = {
      initialProperties: jest.fn().mockResolvedValue(merged),
      supernova: jest.fn().mockResolvedValue(sn),
    };
    types.get.mockReturnValue(t);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should call types.get with name and version', () => {
    create({ type: 't', version: 'v', fields: 'f' }, halo);
    expect(types.get).toHaveBeenCalledWith({ name: 't', version: 'v' });
  });

  test('should call initialProperties on returned type', () => {
    const t = { initialProperties: jest.fn() };
    t.initialProperties.mockReturnValue({ then: () => {} });
    types.get.mockReturnValue(t);
    create({ type: 't', version: 'v', fields: 'f', properties: 'props', extendProperties: false }, halo);
    expect(t.initialProperties).toHaveBeenCalledWith('props', false);
  });

  test('should populate fields', async () => {
    await create({ type: 't', version: 'v', fields: 'f', properties: 'props' }, halo);
    expect(populator).toHaveBeenCalledWith({ sn, properties: merged, fields: 'f', children: [] }, halo);
  });

  test('should call properties onChange handler when optional props are provided', async () => {
    await create({ type: 't', version: 'v', fields: 'f', properties: 'props' }, halo);
    expect(sn.qae.properties.onChange).toHaveBeenCalledWith(merged);
  });

  test('should not call onChange handler when optional props are not provided', async () => {
    await create({ type: 't', version: 'v', fields: 'f' }, halo);
    expect(sn.qae.properties.onChange).toHaveBeenCalledTimes(0);
  });

  test('should create a object with merged props', async () => {
    await create({ type: 't', version: 'v', fields: 'f', properties: 'props' }, halo);
    expect(halo.app.createObject).toHaveBeenCalledWith(merged);
  });

  test('should create a dummy object when error is thrown', async () => {
    types.get.mockImplementation(() => {
      throw new Error('oops');
    });
    await create({ type: 't', version: 'v', fields: 'f', properties: 'props' }, halo);
    expect(halo.app.createObject).toHaveBeenCalledWith({
      qInfo: { qType: 't' },
      visualization: 't',
    });
  });

  test('should return props only', async () => {
    const props = await create({ type: 't', version: 'v', fields: 'f' }, halo, true);
    expect(halo.app.createObject).not.toHaveBeenCalledWith();
    expect(props).toEqual({ m: 'true' });
  });
});
