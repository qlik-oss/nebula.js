import { renderHook } from '@testing-library/react';
import auth from '@qlik/api/auth';
import { useDeauthorizePrevOAuthInstance } from '../useDeauthorizePrevOAuthInstance';
import * as RootContextModule from '../../contexts/RootContext';

jest.mock('@qlik/api/auth', () => ({
  __esModule: true,
  default: { setDefaultHostConfig: jest.fn() },
}));

describe('useDeauthorizePrevOAuthInstance', () => {
  let useRootContextSpy;

  beforeEach(() => {
    useRootContextSpy = jest.spyOn(RootContextModule, 'useRootContext').mockReturnValue({
      cachedConnectionsData: { cachedConnections: [] },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should call auth.setDefaultHostConfig(undefined) on mount', () => {
    renderHook(() => useDeauthorizePrevOAuthInstance());
    expect(auth.setDefaultHostConfig).toHaveBeenCalledTimes(1);
    expect(auth.setDefaultHostConfig).toHaveBeenCalledWith(undefined);
  });

  test('should call auth.setDefaultHostConfig(undefined) again when cachedConnections length changes', () => {
    let connections = [];
    useRootContextSpy.mockReturnValue({
      cachedConnectionsData: { cachedConnections: connections },
    });

    const { rerender } = renderHook(() => useDeauthorizePrevOAuthInstance());
    expect(auth.setDefaultHostConfig).toHaveBeenCalledTimes(1);

    connections = ['ws://localhost:9000/new-connection'];
    useRootContextSpy.mockReturnValue({
      cachedConnectionsData: { cachedConnections: connections },
    });
    rerender();

    expect(auth.setDefaultHostConfig).toHaveBeenCalledTimes(2);
    expect(auth.setDefaultHostConfig).toHaveBeenCalledWith(undefined);
  });
});
