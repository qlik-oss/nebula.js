import React, {
  useEffect,
  useContext,
  useState,
} from 'react';

import useLayout from '@nebula.js/nucleus/src/hooks/useLayout';

import {
  Grid,
} from '@nebula.js/ui/components';

import AppContext from '../contexts/AppContext';
import VizContext from '../contexts/VizContext';
import Cell from './Cell';

export default function Collection({
  types,
  cache,
}) {
  const app = useContext(AppContext);
  const [layout] = useLayout(app);
  const [objects, setObjects] = useState([]);

  const { expandedObject } = useContext(VizContext);

  useEffect(() => {
    app.getObjects({
      qTypes: types,
      // qIncludeSessionObjects: true,
      qData: {
        title: '/qMetaDef/title',
      },
    }).then((list) => {
      setObjects(list.slice(0, 20)); // don't show too many to avoid slow UI
    });
  }, [layout, types.join(':')]);

  const current = expandedObject ? objects.filter((o) => o.qInfo.qId === expandedObject) : objects;

  return (
    <Grid
      container
      spacing={2}
      style={{
        padding: expandedObject ? 4 : 12,
        margin: expandedObject ? 0 : undefined,
        width: expandedObject ? '100%' : undefined,
        height: expandedObject ? '100%' : undefined,
      }}
    >
      {current.map((c) => (
        <Grid item xs={12} md={expandedObject ? 12 : 6} lg={expandedObject ? 12 : 4} key={`${c.qInfo.qId}::${cache}`}>
          <Cell id={c.qInfo.qId} expandable minHeight={600} />
        </Grid>
      ))}
    </Grid>
  );
}
