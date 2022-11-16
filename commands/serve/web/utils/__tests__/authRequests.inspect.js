import { checkIfAuthorized, getAppList } from '../authRequests';

describe('authRequests', () => {
  let windowFetchSpy;

  beforeEach(() => {
    windowFetchSpy = jest.spyOn(window, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('checkIfAuthorized()', () => {
    test('should return what ever auth state it gets from api', async () => {
      windowFetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ({ isAuthorized: true }),
      });
      const res = await checkIfAuthorized();

      expect(res).toEqual({ isAuthorized: true });
    });
  });

  describe('getAppList()', () => {
    test('should return correct app lists from api', async () => {
      windowFetchSpy.mockResolvedValue({
        ok: true,
        json: async () => ['app#01', 'app#02'],
      });

      const res = await getAppList();
      expect(res).toEqual(['app#01', 'app#02']);
    });

    test('should return empty array if there was nothing returned from api', async () => {
      windowFetchSpy.mockResolvedValue({
        ok: true,
        json: async () => null,
      });

      const res = await getAppList();
      expect(res).toEqual([]);
    });
  });
});
