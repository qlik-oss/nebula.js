import React from 'react';

import {
  Typography,
} from '@nebula.js/ui/components';

import useProperties from '@nebula.js/nucleus/src/hooks/useProperties';

import Data from './property-panel/Data';

export default function Properties({
  viz,
  sn,
}) {
  const [properties] = useProperties(viz ? viz.model : null);

  if (!sn) {
    return null;
  }

  if (!viz || !properties) {
    return (
      <div style={{
        minWidth: '250px',
        padding: '8px',
      }}
      >
        <Typography>Nothing selected</Typography>
      </div>
    );
  }

  return (
    <div style={{
      minWidth: '250px',
      padding: '8px',
    }}
    >
      <Data properties={properties} model={viz.model} sn={sn} />
    </div>
  );
}
