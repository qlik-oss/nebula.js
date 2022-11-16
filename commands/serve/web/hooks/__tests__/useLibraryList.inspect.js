import { renderHook, act } from '@testing-library/react';
import * as useSessionModelModule from '@nebula.js/nucleus/src/hooks/useSessionModel';
import * as useLayoutModule from '@nebula.js/nucleus/src/hooks/useLayout';
import useLibraryList from '../useLibraryList';

describe('useLibraryList()', () => {
  let renderResult;
  let app;
  let type;
  let useSessionModelMock;
  let qItemsMock;
  let layout;

  beforeEach(() => {
    type = 'dimension';
    app = {};
    useSessionModelMock = jest.fn().mockReturnValue(['someModel']);

    qItemsMock = jest.fn();
    jest.spyOn(useSessionModelModule, 'default').mockImplementation(useSessionModelMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should return a function since qDimensionList is provided', async () => {
    layout = {
      qDimensionList: {
        qItems: qItemsMock,
      },
    };
    jest.spyOn(useLayoutModule, 'default').mockReturnValue([layout]);

    await act(async () => {
      renderResult = renderHook(() => useLibraryList(app, type));
    });

    expect(renderResult.result.current).toEqual([expect.any(Function)]);
  });

  test('should return a function since qMeasureList is provided', async () => {
    layout = {
      qMeasureList: {
        qItems: qItemsMock,
      },
    };
    jest.spyOn(useLayoutModule, 'default').mockReturnValue([layout]);

    await act(async () => {
      renderResult = renderHook(() => useLibraryList(app, type));
    });

    expect(renderResult.result.current).toEqual([expect.any(Function)]);
  });

  test('should return empty array since layout is not being provided', async () => {
    jest.spyOn(useLayoutModule, 'default').mockReturnValue([null]);

    await act(async () => {
      renderResult = renderHook(() => useLibraryList(app, type));
    });

    expect(renderResult.result.current).toEqual([[]]);
  });
});
