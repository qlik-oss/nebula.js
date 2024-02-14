import { useRootContext } from '../contexts/RootContext';

const { useEffect } = require('react');

export const useDeauthorizePrevOAuthInstance = () => {
  const { cachedConnectionsData } = useRootContext();

  useEffect(() => {
    // Deuathorize any oauth state if any was available
    // This is b/c of cleaning up any previous state of Auth instance on dev server
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
