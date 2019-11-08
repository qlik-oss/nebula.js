import React from 'react';

import { List, ListItem, Typography } from '@material-ui/core';

import HyperCube from './HyperCube';

export default function Data({ model, sn, properties }) {
  if (!sn) {
    return null;
  }

  const { targets } = sn.qae.data;

  if (!targets.length) {
    return <Typography>No data targets found</Typography>;
  }

  return (
    <List>
      {targets.map(t => (
        <ListItem key={t.path} divider disableGutters>
          <HyperCube target={t} properties={properties} model={model} />
        </ListItem>
      ))}
    </List>
  );
}
