import React, { useState, useRef } from 'react';
import { IconButton, Grid, Popover, List, ListItem, Box, Typography } from '@material-ui/core';
import { makeStyles, useTheme } from '@nebula.js/ui/theme';
import DownArrow from '@nebula.js/ui/icons/down-arrow';

import OneField from './OneField';
import MultiState from './MultiState';

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

export default function More({ items = [], api }) {
  const classes = useStyles();
  const theme = useTheme();
  const [showMoreItems, setShowMoreItems] = useState(false);
  const [showItemIx, setShowItemIx] = useState(-1);
  const [anchorEl, setAnchorEl] = useState(null);
  const alignTo = useRef();

  const handleShowMoreItems = (e) => {
    if (e.currentTarget.contains(e.target)) {
      // because click in popover will propagate to parent
      setAnchorEl(e.currentTarget);
      alignTo.current = e.currentTarget;
      setShowMoreItems(!showMoreItems);
    }
  };

  const handleCloseShowMoreItem = () => {
    setShowMoreItems(false);
  };

  const handleShowItem = (e, ix) => {
    e.stopPropagation();
    setShowMoreItems(false);
    setShowItemIx(ix);
  };

  const handleCloseShowItem = () => {
    setShowItemIx(-1);
  };

  let CurrentItem = null;
  if (showItemIx > -1) {
    CurrentItem =
      items[showItemIx].states.length > 1 ? (
        <MultiState field={items[showItemIx]} api={api} moreAlignTo={alignTo} onClose={handleCloseShowItem} />
      ) : (
        <OneField
          field={items[showItemIx]}
          api={api}
          skipHandleShowListBoxPopover
          moreAlignTo={alignTo}
          onClose={handleCloseShowItem}
        />
      );
  }

  return (
    <Grid container spacing={0} className={classes.item} onClick={handleShowMoreItems}>
      <Grid item>
        <Box
          borderRadius={theme.shape.borderRadius}
          style={{
            padding: '4px 8px 4px 8px',
            backgroundColor: theme.palette.selected.main,
            color: theme.palette.selected.mainContrastText,
          }}
        >
          <Typography noWrap style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 600 }} color="inherit">
            +{items.length}
          </Typography>
        </Box>
      </Grid>
      <Grid item>
        <IconButton>
          <DownArrow />
        </IconButton>
      </Grid>
      {showMoreItems && (
        <Popover
          open={showMoreItems}
          onClose={handleCloseShowMoreItem}
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
          <List dense>
            {items.map((s, ix) => (
              // eslint-disable-next-line react/no-array-index-key
              <ListItem key={ix} title={s.name} onClick={(e) => handleShowItem(e, ix)}>
                <Box border={1} width="100%" borderRadius="borderRadius" borderColor="divider">
                  {s.states.length > 1 ? <MultiState field={s} api={api} /> : <OneField field={s} api={api} />}
                </Box>
              </ListItem>
            ))}
          </List>
        </Popover>
      )}
      {CurrentItem}
    </Grid>
  );
}
