import { renderHook, act } from '@testing-library/react';
import { useInfo } from '../useInfo';
import * as connectModule from '../../connect';

describe('useInfo', () => {
  let getConnectionMock;
  let renderResult;
  let returnValue;

  beforeAll(() => {
    returnValue = { isMock: true };
    getConnectionMock = jest.fn();
    getConnectionMock.mockResolvedValue(returnValue);

    jest.spyOn(connectModule, 'getConnectionInfo').mockImplementation(getConnectionMock);
  });

  afterAll(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should return correct info object', async () => {
    await act(async () => {
      renderResult = renderHook(() => useInfo());
    });

    expect(renderResult.result.current.info).toEqual(returnValue);
  });

  test('should return correct values', async () => {
    await act(async () => {
      renderResult = renderHook(() => useInfo());
    });

    expect(renderResult.result.current).toMatchObject({
      info: returnValue,
      setInfo: expect.any(Function),
    });
  });
});
