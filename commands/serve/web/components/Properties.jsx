import React, { useCallback, useMemo, useState, useContext } from 'react';

import { Typography, Grid, Checkbox, FormControlLabel } from '@material-ui/core';

import useProperties from '@nebula.js/nucleus/src/hooks/useProperties';

import Data from './property-panel/Data';
import generateComponents from './AutoComponents';

import AppContext from '../contexts/AppContext';

import storageFn from '../storage';

export default function Properties({ viz, sn, isTemp }) {
  const [properties] = useProperties(viz.model);

  const app = useContext(AppContext);
  const storage = useMemo(() => storageFn(app), [app]);

  const [isReadCacheEnabled, setReadCacheEnabled] = useState(storage.get('readFromCache') !== false);

  const handleCacheChange = e => {
    storage.save('readFromCache', e.target.checked);
    setReadCacheEnabled(e.target.checked);
  };

  const changed = useCallback(() => {
    viz.model.setProperties(properties);
  }, [viz, sn, properties]);

  if (!sn) {
    return null;
  }

  if (!viz || !properties) {
    return (
      <div
        style={{
          minWidth: '250px',
          padding: '8px',
        }}
      >
        <Typography>Nothing selected</Typography>
      </div>
    );
  }

  return (
    <div
      style={{
        minWidth: '250px',
        padding: '8px',
      }}
    >
      {isTemp && (
        <Grid item container alignItems="center">
          <FormControlLabel
            control={
              <Checkbox checked={isReadCacheEnabled} onChange={handleCacheChange} value="isReadFromCacheEnabled" />
            }
            label="Enable property cache"
            labelPlacement="end"
          />
        </Grid>
      )}
      <Data properties={properties} model={viz.model} sn={sn} />
      {generateComponents(properties, changed)}
    </div>
  );
}
