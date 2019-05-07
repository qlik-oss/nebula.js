import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
} from 'react';

import {
  Button,
  Grid,
  Card,
  Toolbar,
  Divider,
} from '@nebula.js/ui/components';

import PropsDialog from './PropertiesDialog';

export default function Stage({
  viz,
}) {
  const c = useRef(null);
  const model = viz && viz.model;

  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    viz && viz.mount(c.current);
  }, [viz]);

  const closeDialog = useCallback(() => { setDialogOpen(false); }, []);

  return (
    <div style={{ padding: '12px', height: '100%', boxSizing: 'border-box' }}>
      <Card style={{ height: '100%' }}>
        <Grid container direction="column" style={{ height: '100%' }}>
          <Grid item>
            <Toolbar>
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
            <div ref={c} style={{ position: 'relative', height: '100%' }} />
          </Grid>
        </Grid>
      </Card>
    </div>
  );
}
