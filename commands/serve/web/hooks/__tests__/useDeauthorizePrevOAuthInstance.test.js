import { renderHook } from '@testing-library/react';
import auth from '@qlik/api/auth';
import { useDeauthorizePrevOAuthInstance } from '../useDeauthorizePrevOAuthInstance';
import * as RootContextModule from '../../contexts/RootContext';

jest.mock('@qlik/api/auth', () => ({
  __esModule: true,
  default: { setDefaultHostConfig: jest.fn() },
}));

describe('useDeauthorizePrevOAuthInstance', () => {
  let cachedConnections;

  beforeEach(() => {
    cachedConnections = [];
    jest.spyOn(RootContextModule, 'useRootContext').mockReturnValue({
      cachedConnectionsData: { cachedConnections },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should call auth.setDefaultHostConfig(undefined) on mount', () => {
    renderHook(() => useDeauthorizePrevOAuthInstance());
    expect(auth.setDefaultHostConfig).toHaveBeenCalledTimes(1);
    expect(auth.setDefaultHostConfig).toHaveBeenCalledWith(undefined);
  });

  test('should call auth.setDefaultHostConfig(undefined) again when cachedConnections length changes', () => {
    let connections = [];
    jest.spyOn(RootContextModule, 'useRootContext').mockReturnValue({
      cachedConnectionsData: { cachedConnections: connections },
    });
    const { rerender } = renderHook(() => useDeauthorizePrevOAuthInstance());
    expect(auth.setDefaultHostConfig).toHaveBeenCalledTimes(1);

    connections = ['ws://localhost:9000/new-connection'];
    jest.spyOn(RootContextModule, 'useRootContext').mockReturnValue({
      cachedConnectionsData: { cachedConnections: connections },
    });
    rerender();

    expect(auth.setDefaultHostConfig).toHaveBeenCalledTimes(2);
    expect(auth.setDefaultHostConfig).toHaveBeenCalledWith(undefined);
  });
});
