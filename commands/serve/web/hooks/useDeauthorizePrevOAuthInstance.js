import { useEffect } from 'react';
import auth from '@qlik/api/auth';
import { useRootContext } from '../contexts/RootContext';

export const useDeauthorizePrevOAuthInstance = () => {
  const { cachedConnectionsData } = useRootContext();

  useEffect(() => {
    // Clear any previously set host config so a fresh one is applied for the new connection.
    // Using setDefaultHostConfig(undefined) instead of logout() to avoid redirecting the browser.
    auth.setDefaultHostConfig(undefined);
  }, [cachedConnectionsData.cachedConnections.length]);
};
