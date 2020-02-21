import React, { useEffect, useState, useContext } from 'react';
import useProperties from '@nebula.js/nucleus/src/hooks/useProperties';

import { Grid } from '@material-ui/core';

import Cell from './Cell';
import NebulaContext from '../contexts/NebulaContext';
import VizContext from '../contexts/VizContext';

export default function Stage({ info, storage, uid }) {
  const nebbie = useContext(NebulaContext);
  const [model, setModel] = useState(null);
  const [properties] = useProperties(model);
  const { setActiveViz } = useContext(VizContext);

  useEffect(() => {
    if (!uid) {
      return;
    }
    nebbie
      .create(
        {
          type: info.supernova.name,
        },
        {
          properties: {
            ...(storage.get('readFromCache') !== false ? storage.props(info.supernova.name) : {}),
            qInfo: {
              qId: uid,
              qType: info.supernova.name,
            },
          },
        }
      )
      .then(v => {
        setModel(v.model);
        setActiveViz(v);
      });
  }, [uid]);

  useEffect(() => {
    if (!properties) return;
    storage.props(info.supernova.name, properties);
  }, [properties]);

  if (!model) {
    return null;
  }

  return (
    <Grid
      item
      container
      justify="center"
      style={{
        height: '100%',
      }}
    >
      <Grid item xs>
        <Cell id={model.id} />
      </Grid>
    </Grid>
  );
}
