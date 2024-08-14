import * as populatorModule from '../populator';
import * as initiateModule from '../initiate';
import * as createNavigationApiModule from '../navigation/navigation';
import create from '../create-session-object';
import initializeStores from '../../stores/new-model-store';

describe('create-session-object', () => {
  let halo = {};
  let types;
  let sn;
  let merged;
  let populator;
  let init;
  let objectModel;
  let createNavigationApi;
  let navigation;
  const modelStore = initializeStores('app');

  beforeEach(() => {
    populator = jest.fn();
    init = jest.fn();
    navigation = {
      goToSheet: jest.fn(),
    };
    createNavigationApi = jest.fn().mockReturnValue(navigation);

    jest.spyOn(populatorModule, 'default').mockImplementation(populator);
    jest.spyOn(initiateModule, 'default').mockImplementation(init);
    jest.spyOn(createNavigationApiModule, 'default').mockImplementation(createNavigationApi);
    objectModel = { id: 'id', on: () => {}, once: () => {} };
    types = {
      get: jest.fn(),
    };
    halo = {
      app: {
        createSessionObject: jest.fn().mockResolvedValue(objectModel),
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
    create({ type: 't', version: 'v', fields: 'f' }, halo, modelStore);
    expect(types.get).toHaveBeenCalledWith({ name: 't', version: 'v' });
  });

  test('should call initialProperties on returned type', () => {
    const t = { initialProperties: jest.fn() };
    t.initialProperties.mockReturnValue({ then: () => {} });
    types.get.mockReturnValue(t);
    create({ type: 't', version: 'v', fields: 'f', properties: 'props', extendProperties: false }, halo, modelStore);
    expect(t.initialProperties).toHaveBeenCalledWith('props', false);
  });

  test('should populate fields', async () => {
    await create({ type: 't', version: 'v', fields: 'f', properties: 'props' }, halo, modelStore);
    expect(populator).toHaveBeenCalledWith({ sn, properties: merged, fields: 'f', children: [] }, halo);
  });

  test('should call properties onChange handler when optional props are provided', async () => {
    await create({ type: 't', version: 'v', fields: 'f', properties: 'props' }, halo, modelStore);
    expect(sn.qae.properties.onChange).toHaveBeenCalledWith(merged);
  });

  test('should not call onChange handler when optional props are not provided', async () => {
    await create({ type: 't', version: 'v', fields: 'f' }, halo, modelStore);
    expect(sn.qae.properties.onChange).toHaveBeenCalledTimes(0);
  });

  test('should create a session object with merged props', async () => {
    await create({ type: 't', version: 'v', fields: 'f', properties: 'props' }, halo, modelStore);
    expect(halo.app.createSessionObject).toHaveBeenCalledWith(merged);
  });

  test('should create a dummy session object when error is thrown', async () => {
    types.get.mockImplementation(() => {
      throw new Error('oops');
    });
    await create({ type: 't', version: 'v', fields: 'f', properties: 'props' }, halo, modelStore);
    expect(halo.app.createSessionObject).toHaveBeenCalledWith({
      qInfo: { qType: 't' },
      visualization: 't',
    });
  });

  test('should call init', async () => {
    const ret = await create(
      { type: 't', version: 'v', fields: 'f', properties: 'props', options: 'a', plugins: [] },
      halo,
      modelStore
    );
    expect(ret).toBe('api');
    expect(init).toHaveBeenCalledWith(
      objectModel,
      { options: 'a', plugins: [], element: undefined },
      halo,
      undefined,
      undefined,
      expect.any(Function)
    );
  });

  test('should call init with navigation', async () => {
    const ret = await create(
      { type: 't', version: 'v', fields: 'f', properties: 'props', options: 'a', plugins: [], navigation },
      halo,
      modelStore
    );
    expect(ret).toBe('api');
    expect(init).toHaveBeenCalledWith(
      objectModel,
      { options: 'a', plugins: [], element: undefined },
      halo,
      navigation,
      undefined,
      expect.any(Function)
    );
  });

  test('should catch and pass error', async () => {
    const err = new Error('oops');
    types.get.mockReturnValue(err);
    const optional = { properties: 'props', element: 'el', options: 'opts' };
    const ret = await create({ type: 't', ...optional }, halo, modelStore);
    expect(ret).toBe('api');
    expect(init).toHaveBeenCalledWith(
      objectModel,
      { options: 'opts', plugins: undefined, element: 'el' },
      halo,
      undefined,
      expect.objectContaining(err),
      expect.any(Function)
    );
  });

  test('should catch and pass error when navigation is passed', async () => {
    const err = new Error('oops');
    types.get.mockReturnValue(err);
    const optional = { properties: 'props', element: 'el', options: 'opts' };
    const ret = await create({ type: 't', ...optional, navigation }, halo, modelStore);
    expect(ret).toBe('api');
    expect(init).toHaveBeenCalledWith(
      objectModel,
      { options: 'opts', plugins: undefined, element: 'el' },
      halo,
      navigation,
      expect.objectContaining(err),
      expect.any(Function)
    );
  });
});
