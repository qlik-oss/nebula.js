import React, { useEffect, useState } from 'react';

import { makeStyles, Grid, Typography, Popover } from '@material-ui/core';
import SelectionToolbarWithDefault from './SelectionToolbar';
import useRect from '../hooks/useRect';

const ITEM_WIDTH = 32;
const ITEM_SPACING = 4;
const NUMBER_OF_ITEMS = 6;
const MIN_WIDTH = (ITEM_WIDTH + ITEM_SPACING) * NUMBER_OF_ITEMS;

const useStyles = makeStyles(theme => ({
  containerStyle: {
    flexGrow: 0,
  },
  containerTitleStyle: {
    paddingBottom: theme.spacing(1),
  },
  itemsStyle: {
    whiteSpace: 'nowrap',
    minHeight: '32px',
  },
}));

const Header = ({ layout, sn, anchorEl }) => {
  const showTitle = layout && layout.showTitles && !!layout.title;
  const showSubtitle = layout && layout.showTitles && !!layout.subtitle;
  const showInSelectionActions = sn && layout && layout.qSelectionInfo && layout.qSelectionInfo.qInSelections;
  const [items, setItems] = useState([]);
  const { containerStyle, containerTitleStyle, itemsStyle } = useStyles();
  const [containerRef, containerRect] = useRect();
  const [shouldShowPopoverToolbar, setShouldShowPopoverToolbar] = useState(false);

  useEffect(() => {
    if (!sn || !sn.component || !sn.component.isHooked) {
      return;
    }
    sn.component.observeActions(actions => setItems(actions));
  }, [sn]);

  useEffect(() => {
    if (!containerRect) return;
    const { width } = containerRect;
    setShouldShowPopoverToolbar(width < MIN_WIDTH);
  }, [containerRect]);

  const Toolbar = (
    <SelectionToolbarWithDefault
      inline
      layout={layout}
      api={sn && sn.component.selections}
      xItems={[...items, ...((sn && sn.selectionToolbar.items) || [])]}
    />
  );

  const classes = [containerStyle, ...(showTitle ? [containerTitleStyle] : [])];
  const showPopoverToolbar =
    (!showTitle && showInSelectionActions) || (shouldShowPopoverToolbar && showInSelectionActions);
  const showToolbar = showInSelectionActions && !showPopoverToolbar;

  return (
    <Grid ref={containerRef} item container wrap="nowrap" className={classes.join(' ')}>
      <Grid item zeroMinWidth xs>
        <Grid container wrap="nowrap" direction="column">
          {showTitle && (
            <Typography variant="h6" noWrap>
              {layout.title}
            </Typography>
          )}
          {showSubtitle && (
            <Typography variant="body2" noWrap>
              {layout.subtitle}
            </Typography>
          )}
        </Grid>
      </Grid>
      {showToolbar && (
        <Grid item className={itemsStyle}>
          {Toolbar}
        </Grid>
      )}
      {showPopoverToolbar && (
        <Popover
          open={showInSelectionActions}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          hideBackdrop
          style={{ pointerEvents: 'none' }}
          PaperProps={{
            style: {
              pointerEvents: 'auto',
            },
          }}
        >
          {Toolbar}
        </Popover>
      )}
    </Grid>
  );
};

export default Header;
