import React, { useState, useContext, useRef } from 'react';
import { Badge, IconButton, Grid, Typography, Popover, Button, MenuList, MenuItem } from '@material-ui/core';
import { makeStyles } from '@nebula.js/ui/theme';
import DownArrow from '@nebula.js/ui/icons/down-arrow';

import OneField from './OneField';
import LocaleContext from '../../contexts/LocaleContext';

import ListBoxPopover from '../listbox/ListBoxPopover';

const useStyles = makeStyles(theme => ({
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

export default function MultiState({ field, api }) {
  const classes = useStyles();
  const [showFields, setShowFields] = useState(false);
  const [showStateIx, setShowStateIx] = useState(-1);
  const [anchorEl, setAnchorEl] = useState(null);
  const alignTo = useRef();
  const translator = useContext(LocaleContext);
  const clearAllStates = translator.get('Selection.ClearAllStates');

  const handleShowFields = e => {
    if (e.currentTarget.contains(e.target)) {
      // because click in popover will propagate to parent
      setAnchorEl(e.currentTarget);
      alignTo.current = e.currentTarget;
      setShowFields(!showFields);
    }
  };

  const handleShowState = (e, ix) => {
    e.stopPropagation();
    setShowFields(false);
    setShowStateIx(ix);
  };
  const handleClearAllStates = () => {
    field.states.forEach(s => api.clearField(field.name, s));
  };

  return (
    <Grid container spacing={0} className={classes.item} onClick={handleShowFields}>
      <Grid item xs>
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
      {showFields && (
        <Popover
          open={showFields}
          onClose={() => setShowFields(false)}
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
          <MenuList>
            <MenuItem divider title={clearAllStates} onClick={handleClearAllStates}>
              <Button variant="outlined" fullWidth>
                <Typography component="span">{clearAllStates}</Typography>
              </Button>
            </MenuItem>
            {field.states.map((s, ix) => (
              // eslint-disable-next-line react/no-array-index-key
              <MenuItem key={ix} divider title={field.name} onClick={e => handleShowState(e, ix)}>
                <OneField field={field} api={api} stateIx={ix} skipHandleShowListBoxPopover />
              </MenuItem>
            ))}
          </MenuList>
        </Popover>
      )}
      {showStateIx > -1 && (
        <ListBoxPopover
          alignTo={alignTo}
          show={showStateIx > -1}
          close={() => setShowStateIx(-1)}
          app={api.model}
          fieldName={field.selections[showStateIx].qField}
          stateName={field.states[showStateIx]}
        />
      )}
    </Grid>
  );
}
