import { useState, useEffect } from 'react';
import useSupernovaType from './userSupernovaType';
import { createObjectSelectionAPI } from '../selections';

export default function useSupernova({ model, nebulaContext, genericObjectType, genericObjectVersion }, deps = []) {
  const [supernova, setSupernova] = useState(null);
  const [snErr, setSnErr] = useState(null);
  const [snType, snTypeErr] = useSupernovaType({ nebulaContext, genericObjectType, genericObjectVersion });

  useEffect(() => {
    if (!snType || snTypeErr) {
      return;
    }
    try {
      const { app } = nebulaContext;
      const selections = createObjectSelectionAPI(model, app);
      const sn = snType.create({
        model,
        app,
        selections,
      });
      setSupernova(sn);
    } catch (err) {
      setSnErr(err);
    }
  }, [snType, snTypeErr, ...deps]);

  return [supernova, snTypeErr, snErr];
}
