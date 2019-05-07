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
import Cell from './Cell';

export default function Collection({
  type,
  onSelectedCell,
}) {
  const app = useContext(AppContext);
  const [layout] = useLayout(app);
  const [objects, setObjects] = useState([]);

  useEffect(() => {
    app.getObjects({
      qTypes: [type],
      qIncludeSessionObjects: true,
      qData: {
        title: '/qMetaDef/title',
      },
    }).then((list) => {
      setObjects(list);
    });
  }, [layout, type]);

  return (
    <Grid container spacing={2} style={{ padding: '12px' }}>
      {objects.map(c => (
        <Grid item xs={12} md={6} lg={4} key={c.qInfo.qId}>
          <Cell object={c} onSelected={onSelectedCell} />
        </Grid>
      ))}
    </Grid>
  );
}
