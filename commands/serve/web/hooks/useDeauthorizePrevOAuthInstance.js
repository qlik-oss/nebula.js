import { useEffect } from 'react';
import { logout } from '@qlik/api/auth';
import { useRootContext } from '../contexts/RootContext';

export const useDeauthorizePrevOAuthInstance = () => {
  const { cachedConnectionsData } = useRootContext();

  useEffect(() => {
    logout();
  }, [cachedConnectionsData.cachedConnections.length]);
};
