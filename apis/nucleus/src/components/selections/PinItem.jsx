import React from 'react';
import { Grid2, Typography } from '@mui/material';
import { useTheme } from '@nebula.js/ui/theme';
import ListBoxPopover from '../listbox/ListBoxPopover';

function PinItem({
  field,
  api,
  showListBoxPopover,
  alignTo,
  skipHandleShowListBoxPopover,
  handleShowListBoxPopover,
  handleCloseShowListBoxPopover,
}) {
  const theme = useTheme();
  const displayName = field.qName || field.qField;

  return (
    <Grid2
      container
      gap={1}
      ref={alignTo}
      sx={{
        backgroundColor: theme.palette.background.paper,
        position: 'relative',
        cursor: 'pointer',
        padding: '4px',
        height: '40px',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      }}
      onClick={(skipHandleShowListBoxPopover === false && handleShowListBoxPopover) || null}
    >
      <Typography noWrap style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 600, marginTop: '8px' }}>
        {displayName}
      </Typography>
      {showListBoxPopover && (
        <ListBoxPopover
          alignTo={alignTo}
          show={showListBoxPopover}
          close={handleCloseShowListBoxPopover}
          app={api.model}
          fieldName={field.qField}
        />
      )}
    </Grid2>
  );
}

export default PinItem;
