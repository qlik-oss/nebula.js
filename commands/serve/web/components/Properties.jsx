import React, { useCallback, useState } from 'react';

import { Divider, Grid, Checkbox, FormControlLabel } from '@mui/material';

import usePropertiesById from '@nebula.js/nucleus/src/hooks/usePropertiesById';

import Data from './property-panel/Data';
import generateComponents from './AutoComponents';

export default function Properties({ viz, sn, isTemp, storage }) {
  const [properties, setProperties] = usePropertiesById(viz.id);

  const [isReadCacheEnabled, setReadCacheEnabled] = useState(storage.get('readFromCache') !== false);

  const handleCacheChange = (e) => {
    storage.save('readFromCache', e.target.checked);
    setReadCacheEnabled(e.target.checked);
  };

  const changed = useCallback(() => {
    setProperties(properties);
  }, [viz, sn, properties]);

  if (!sn) {
    return null;
  }

  if (!viz || !properties) {
    return null;
  }

  return (
    <div
      style={{
        minWidth: '250px',
        padding: '8px',
      }}
    >
      {isTemp && (
        <>
          <Grid item container alignItems="center">
            <FormControlLabel
              control={
                <Checkbox checked={isReadCacheEnabled} onChange={handleCacheChange} value="isReadFromCacheEnabled" />
              }
              label="Enable property cache"
              labelPlacement="end"
            />
          </Grid>
          <Divider />
        </>
      )}
      <Data properties={properties} setProperties={setProperties} sn={sn} />
      {generateComponents(properties, changed)}
    </div>
  );
}
