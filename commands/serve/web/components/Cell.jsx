import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';

import {
  Button,
  Grid,
  Card,
  Toolbar,
  Divider,
} from '@nebula.js/ui/components';

import PropsDialog from './PropertiesDialog';

import AppContext from '../contexts/AppContext';

import Chart from './Chart';

export default function ({
  id,
  onSelected,
}) {
  const app = useContext(AppContext);
  const [model, setModel] = useState(null);
  useEffect(() => {
    const v = app.getObject(id).then((m) => {
      setModel(m);
      return m;
    });

    return () => {
      v.then((m) => m.emit('close'));
    };
  }, [id]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const closeDialog = useCallback(() => { setDialogOpen(false); }, []);

  return (
    <Card style={{ minHeight: 600, height: '100%' }}>
      <Grid container direction="column" style={{ height: '100%', position: 'relative' }}>
        <Grid item>
          <Toolbar variant="dense">
            <Button
              variant="outlined"
              disabled={!model}
              onClick={() => setDialogOpen(true)}
            >
              Props
            </Button>
            <PropsDialog model={model} show={dialogOpen} close={closeDialog} />
          </Toolbar>
          <Divider />
        </Grid>
        <Grid item xs>
          <Chart id={id} onSelected={onSelected} />
        </Grid>
      </Grid>
    </Card>
  );
}
