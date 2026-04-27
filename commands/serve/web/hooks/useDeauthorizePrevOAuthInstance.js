import { useEffect } from 'react';
import { useRootContext } from '../contexts/RootContext';

export const useDeauthorizePrevOAuthInstance = () => {
  const { cachedConnectionsData } = useRootContext();

  useEffect(() => {
    // deuathorize any oauth state if any was available
    // this is b/c we need to cleaning up any previous state of Auth instance
    const handleDeauthorization = async () => {
      try {
        await (await fetch('/auth/deauthorize')).json();
      } catch (error) {
        console.error('deauthorization failed: ', error);
      }
    };

    handleDeauthorization();
  }, [cachedConnectionsData.cachedConnections.length]);
};
