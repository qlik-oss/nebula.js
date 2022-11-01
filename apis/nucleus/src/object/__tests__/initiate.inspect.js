/* eslint no-underscore-dangle:0 */
import * as vizModule from '../../viz';
import create from '../initiate';

describe('initiate api', () => {
  const optional = 'optional';
  const halo = 'halo';
  const model = 'model';
  let viz;
  let api;

  beforeEach(() => {
    viz = jest.fn();
    jest.spyOn(vizModule, 'default').mockImplementation(viz);
    api = {
      __DO_NOT_USE__: {
        mount: jest.fn(),
        options: jest.fn(),
        plugins: jest.fn(),
      },
    };
    viz.mockReturnValue(api);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should call viz api', async () => {
    const initialError = 'err';
    const onDestroy = () => {};
    const ret = await create(model, optional, halo, initialError, onDestroy);
    expect(viz).toHaveBeenCalledWith({ model, halo, initialError, onDestroy });
    expect(ret).toEqual(api);
  });

  test('should call mount when element is provided ', async () => {
    await create(model, { element: 'el' }, halo);
    expect(api.__DO_NOT_USE__.mount).toHaveBeenCalledWith('el');
  });

  test('should call options when provided ', async () => {
    await create(model, { options: 'opts' }, halo);
    expect(api.__DO_NOT_USE__.options).toHaveBeenCalledWith('opts');
  });

  test('should call plugins when provided ', async () => {
    const plugins = [{ info: { name: 'plugino' }, fn() {} }];
    await create(model, { plugins }, halo);
    expect(api.__DO_NOT_USE__.plugins).toHaveBeenCalledWith(plugins);
  });
});
