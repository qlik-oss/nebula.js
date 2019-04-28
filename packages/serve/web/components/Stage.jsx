import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
} from 'react';
import { Button } from 'react-leonardo-ui';

import PropsDialog from './PropertiesDialog';
import { Grid, Toolbar, Card } from '../ui-components';

export default function Stage({
  viz,
}) {
  const c = useRef(null);
  const model = viz && viz.model;

  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    viz && viz.show(c.current);
  }, [viz]);

  const closeDialog = useCallback(() => { setDialogOpen(false); });

  return (
    <Card>
      <Grid vertical noSpacing style={{ height: '100%' }}>
        <Toolbar style={{ textAlign: 'right' }}>
          <Button onClick={() => setDialogOpen(true)} disabled={!model}>Props</Button>
          {model && (
            <PropsDialog
              show={dialogOpen}
              close={closeDialog}
              model={model}
            />
          )}
        </Toolbar>
        <div ref={c} style={{ position: 'relative' }} />
      </Grid>
    </Card>
  );
}
