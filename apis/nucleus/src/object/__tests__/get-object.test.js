import * as initiateModule from '../initiate';
import create from '../get-object';
import initializeStores from '../../stores/new-model-store';

describe('get-object', () => {
  let context = {};
  let init;
  let objectModel;
  let model;
  const modelStore = initializeStores('app');

  beforeEach(() => {
    init = jest.fn();
    jest.spyOn(initiateModule, 'default').mockImplementation(init);

    model = {
      id: 'model-x',
      on: jest.fn(),
      once: jest.fn(),
    };
    objectModel = jest.fn();
    init.mockReturnValue('api');
    context = { app: { id: 'appid', getObject: async () => Promise.resolve(objectModel) } };
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should get object from app only once', async () => {
    objectModel.mockReturnValue(model);
    const spy = jest.spyOn(context.app, 'getObject').mockImplementation(objectModel);
    await create({ id: 'x' }, context, modelStore);
    await create({ id: 'x' }, context, modelStore);
    await create({ id: 'x' }, context, modelStore);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('x');
  });

  test('should call init', async () => {
    objectModel.mockReturnValue(model);
    jest.spyOn(context.app, 'getObject').mockImplementation(objectModel);
    const ret = await create({ id: 'x', options: 'op', plugins: [], element: 'el' }, context, modelStore);
    expect(ret).toBe('api');
    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        id: model.id,
        on: expect.any(Function),
        once: expect.any(Function),
      }),
      { options: 'op', plugins: [], element: 'el' },
      context
    );
  });
});
