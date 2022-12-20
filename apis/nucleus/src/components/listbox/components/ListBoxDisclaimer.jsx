import { Typography } from '@mui/material';
import React, { useContext } from 'react';
import InstanceContext from '../../../contexts/InstanceContext';

export default function ListBoxDisclaimer({ width }) {
  const { translator } = useContext(InstanceContext);

  return (
    <Typography component="div" variant="body1" minWidth={width} textAlign="center" py="16px">
      {translator.get('Listbox.NoMatchesForYourTerms')}
    </Typography>
  );
}
