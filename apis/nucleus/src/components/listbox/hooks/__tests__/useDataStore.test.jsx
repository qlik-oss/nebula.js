import * as vizStore from '../../../../stores/viz-store';
import useDataStore from '../useDataStore';

describe('useDataStore', () => {
  let model;
  let vizDataStoreMock;

  beforeEach(() => {
    model = { id: 1234 };
    vizDataStoreMock = {
      get: jest.fn().mockImplementation((key) => key),
      set: jest.fn(),
    };
    jest.spyOn(vizStore, 'useVizDataStore').mockReturnValue([vizDataStoreMock]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should expose expected methods', () => {
    const store = useDataStore(model);
    expect(Object.keys(store).sort()).toEqual(['getStoreValue', 'setStoreValue']);
  });

  it('getStoreValue should prefix the returned value with model id', () => {
    const store = useDataStore(model);
    expect(store.getStoreValue('listCount')).toEqual('1234/listCount');
  });

  it('setStoreValue should call set', () => {
    const store = useDataStore(model);
    store.setStoreValue('listCount', 1479);
    expect(vizDataStoreMock.set.mock.calls[0]).toEqual(['1234/listCount', 1479]);
  });
});
