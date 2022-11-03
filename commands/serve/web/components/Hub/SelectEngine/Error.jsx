import React from 'react';
import Typography from '@mui/material/Typography';

export default function Error({ error: { message, hints } }) {
  return (
    <>
      <Typography variant="subtitle1" color="error" gutterBottom style={{ marginBottom: 0 }}>
        {message}
      </Typography>
      {hints.map((hint) => (
        <Typography key={hint} variant="body2">
          {hint}
        </Typography>
      ))}
    </>
  );
}
