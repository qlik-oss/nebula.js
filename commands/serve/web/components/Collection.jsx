import React, { useEffect, useContext, useState } from 'react';

import { useAppLayout } from '@nebula.js/nucleus/src/hooks/useLayout';

import { Grid, Typography } from '@material-ui/core';

import AppContext from '../contexts/AppContext';
import VizContext from '../contexts/VizContext';
import Cell from './Cell';

export default function Collection({ types, cache }) {
  const app = useContext(AppContext);
  const [layout] = useAppLayout(app);
  const [objects, setObjects] = useState(null);

  const { expandedObject } = useContext(VizContext);

  useEffect(() => {
    app
      .getObjects({
        qTypes: types,
        // qIncludeSessionObjects: true,
        qData: {
          title: '/qMetaDef/title',
        },
      })
      .then((list) => {
        setObjects(list.slice(0, 20)); // don't show too many to avoid slow UI
      });
  }, [layout, types.join(':')]);

  if (!objects) {
    return null;
  }

  const current = expandedObject ? objects.filter((o) => o.qInfo.qId === expandedObject) : objects;

  return (
    <Grid
      container
      justifyContent="center"
      spacing={expandedObject ? 0 : 2}
      style={{
        height: expandedObject ? '100%' : undefined,
      }}
    >
      {current[0] ? (
        current.map((c) => (
          <Grid item xs={12} md={expandedObject ? 12 : 6} lg={expandedObject ? 12 : 4} key={`${c.qInfo.qId}::${cache}`}>
            <Cell id={c.qInfo.qId} expandable minHeight={600} />
          </Grid>
        ))
      ) : (
        <Grid item>
          <div>
            <Typography display="inline">Could not find any components with </Typography>
            <Typography display="inline">
              <code>{`qType: "${types[0]}"`}</code>
            </Typography>
            <Typography display="inline"> in the current app</Typography>
          </div>
        </Grid>
      )}
    </Grid>
  );
}
