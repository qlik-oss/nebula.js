import React, { useEffect, useContext } from 'react';

import { Grid } from '@mui/material';

import useProperties from './useProperties';

import Cell from './Cell';
import NebulaContext from '../../contexts/NebulaContext';
import VizContext from '../../contexts/VizContext';

export default function Stage({ info, storage, uid }) {
  const nebbie = useContext(NebulaContext);
  const { activeViz, setActiveViz } = useContext(VizContext);
  const [properties] = useProperties(activeViz?.model);

  useEffect(() => {
    if (!uid) {
      return undefined;
    }
    const res = nebbie.render({
      type: info.supernova.name,
      properties: {
        ...(storage.get('readFromCache') !== false ? storage.props(info.supernova.name) : {}),
        qInfo: {
          qId: uid,
          qType: info.supernova.name,
        },
      },
    });
    res.then((v) => {
      setActiveViz(v);
    });
    return () => {
      res.then((v) => v.destroy());
    };
  }, [uid]);

  useEffect(() => {
    if (!properties) return;
    storage.props(info.supernova.name, properties);
  }, [properties]);

  if (!activeViz || activeViz.id !== uid) return null;

  return (
    <Grid
      item
      container
      justifyContent="center"
      style={{
        height: '100%',
      }}
    >
      <Grid item xs>
        <Cell id={uid} />
      </Grid>
    </Grid>
  );
}
