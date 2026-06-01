import { renderHook, act } from '@testing-library/react';
import { useAppList } from '../useAppList';
import * as connectModule from '../../connect';
import * as RootContextModule from '../../contexts/RootContext';
import { RouterWrapper } from '../../utils/testRenderer';

describe('useAppList', () => {
  let getConnectionMock;
  let renderResult;
  let getConnectionInfoReturnValue;
  let glob;
  let info;
  let setInfo;
  let setActiveStep;
  let getDocList;
  let apps;
  let engineUrl;
  let clientId;

  beforeEach(() => {
    clientId = 'xxx__client_id__xxx';
    engineUrl = 'some.engine.in.eu.qlikdev.com';

    getConnectionInfoReturnValue = { isMock: true };
    getConnectionMock = jest.fn();
    getConnectionMock.mockResolvedValue(getConnectionInfoReturnValue);

    setInfo = jest.fn();
    setActiveStep = jest.fn();

    apps = [];
    getDocList = jest.fn().mockResolvedValue(apps);

    info = {};
    glob = { getDocList };

    jest.spyOn(connectModule, 'getConnectionInfo').mockImplementation(getConnectionMock);
    jest.spyOn(RootContextModule, 'useRootContext').mockReturnValue({
      setInfo,
      setActiveStep,
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should call `setActiveStep` and set it to 1 on mount', async () => {
    await act(async () => {
      renderResult = renderHook(() => useAppList({ glob, info }), { wrapper: RouterWrapper });
    });

    expect(setActiveStep).toHaveBeenCalledTimes(1);
    expect(setActiveStep).toHaveBeenCalledWith(1);
  });

  test('should call `getConnectionInfo` and `setInfo` with correct values on mount', async () => {
    await act(async () => {
      renderResult = renderHook(() => useAppList({ glob, info }), { wrapper: RouterWrapper });
    });

    expect(getConnectionMock).toHaveBeenCalledTimes(1);
    expect(getConnectionMock).toHaveBeenCalledWith();
    expect(setInfo).toHaveBeenCalledTimes(1);
    expect(setInfo).toHaveBeenCalledWith(getConnectionInfoReturnValue);
  });

  test('should call `glob?.getDocList()` to get list of apps', async () => {
    apps = [{ someApp: 'someDocListItem#01' }];
    getDocList.mockResolvedValue(apps);

    window.location.assign(`/some-url?engine_url=wss://${engineUrl}&qlik-client-id=${clientId}`);

    await act(async () => {
      renderResult = renderHook(() => useAppList({ glob, info }), { wrapper: RouterWrapper });
    });

    expect(getDocList).toHaveBeenCalledTimes(1);
    expect(renderResult.result.current).toMatchObject({
      loading: false,
      appList: apps,
    });
  });

  test('should show loading if there were no apps', async () => {
    getDocList.mockResolvedValue(undefined);
    window.location.assign(`/some-url?engine_url=wss://${engineUrl}&qlik-client-id=${clientId}`);
    await act(async () => {
      renderResult = renderHook(() => useAppList({ glob, info }), { wrapper: RouterWrapper });
    });

    expect(getDocList).toHaveBeenCalledTimes(1);
    expect(renderResult.result.current).toMatchObject({
      loading: true,
      appList: undefined,
    });
  });
});
