import { useState, useEffect } from 'react';

export default function useSupernovaType({ nebulaContext, genericObjectType, genericObjectVersion }, deps = []) {
  const [snType, setSnType] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!genericObjectType) {
      return;
    }
    const withVersion = nebulaContext.nebbie.types.getSupportedVersion(genericObjectType, genericObjectVersion);
    if (!withVersion) {
      setErr({
        message: `Could not find a version of '${genericObjectType}' that supports current object version. Did you forget to register ${genericObjectType}?`,
      });
      return;
    }
    setErr(null);

    const get = async () => {
      const SN = await nebulaContext.nebbie.types
        .get({
          name: genericObjectType,
          version: withVersion,
        })
        .supernova();
      setSnType(SN);
    };
    get();
  }, [genericObjectType, genericObjectVersion, ...deps]);

  return [snType, err];
}
