import React, { useState, useContext, useRef } from 'react';
import { Badge, IconButton, Grid, Typography, Popover, Button, List, ListItem, Box } from '@material-ui/core';
import { makeStyles } from '@nebula.js/ui/theme';
import DownArrow from '@nebula.js/ui/icons/down-arrow';

import OneField from './OneField';
import InstanceContext from '../../contexts/InstanceContext';

import ListBoxPopover from '../listbox/ListBoxPopover';

const useStyles = makeStyles((theme) => ({
  item: {
    backgroundColor: theme.palette.background.paper,
    position: 'relative',
    cursor: 'pointer',
    padding: '4px',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    height: '100%',
    alignItems: 'center',
  },
  badge: {
    padding: theme.spacing(0, 1),
  },
}));

export default function MultiState({ field, api, moreAlignTo = null, onClose = () => {} }) {
  const classes = useStyles();
  // If originated from the `more` item show fields directly
  const [showFields, setShowFields] = useState(!!moreAlignTo);
  const [showStateIx, setShowStateIx] = useState(-1);
  // If originated from the `more` item align it
  const [anchorEl, setAnchorEl] = useState(moreAlignTo ? moreAlignTo.current : null);
  const alignTo = moreAlignTo || useRef();
  const { translator } = useContext(InstanceContext);
  const clearAllStates = translator.get('Selection.ClearAllStates');

  const handleShowFields = (e) => {
    if (e.currentTarget.contains(e.target)) {
      // because click in popover will propagate to parent
      setAnchorEl(e.currentTarget);
      alignTo.current = e.currentTarget;
      setShowFields(!showFields);
    }
  };

  const handleCloseShowFields = () => {
    setShowFields(false);
    onClose();
  };

  const handleShowState = (e, ix) => {
    e.stopPropagation();
    setShowFields(false);
    setShowStateIx(ix);
  };

  const handleCloseShowState = () => {
    setShowStateIx(-1);
    onClose();
  };

  const handleClearAllStates = () => {
    field.states.forEach((s) => api.clearField(field.name, s));
  };

  let Header = null;
  if (!moreAlignTo) {
    Header = (
      <>
        <Grid item xs zeroMinWidth>
          <Badge className={classes.badge} color="secondary" badgeContent={field.states.length}>
            <Typography component="span" noWrap style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 600 }}>
              {field.name}
            </Typography>
          </Badge>
        </Grid>
        <Grid item>
          <div style={{ width: '12px' }} />
        </Grid>
        <Grid item>
          <IconButton>
            <DownArrow />
          </IconButton>
        </Grid>
      </>
    );
  }
  const Fields = (
    <List dense>
      <ListItem title={clearAllStates} onClick={handleClearAllStates}>
        <Button variant="contained" fullWidth>
          {clearAllStates}
        </Button>
      </ListItem>
      {field.states.map((s, ix) => (
        // eslint-disable-next-line react/no-array-index-key
        <ListItem key={ix} title={field.name} onClick={(e) => handleShowState(e, ix)}>
          <Box border={1} width="100%" borderRadius="borderRadius" borderColor="divider">
            <OneField field={field} api={api} stateIx={ix} skipHandleShowListBoxPopover />
          </Box>
        </ListItem>
      ))}
    </List>
  );
  const PopoverFields = (
    <Popover
      open={showFields}
      onClose={handleCloseShowFields}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      PaperProps={{
        style: {
          minWidth: '200px',
          width: '200px',
          pointerEvents: 'auto',
        },
      }}
    >
      {Fields}
    </Popover>
  );

  const Component = moreAlignTo ? (
    PopoverFields
  ) : (
    <Grid container spacing={0} className={classes.item} onClick={handleShowFields}>
      {Header}
      {showFields && PopoverFields}
      {showStateIx > -1 && (
        <ListBoxPopover
          alignTo={alignTo}
          show={showStateIx > -1}
          close={handleCloseShowState}
          app={api.model}
          fieldName={field.selections[showStateIx].qField}
          stateName={field.states[showStateIx]}
        />
      )}
    </Grid>
  );

  return moreAlignTo && showStateIx > -1 ? (
    <ListBoxPopover
      alignTo={alignTo}
      show={showStateIx > -1}
      close={handleCloseShowState}
      app={api.model}
      fieldName={field.selections[showStateIx].qField}
      stateName={field.states[showStateIx]}
    />
  ) : (
    Component
  );
}
