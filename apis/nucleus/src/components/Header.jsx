import React, { useEffect, useState } from 'react';

import { makeStyles, Grid, Typography } from '@material-ui/core';
import ActionsToolbar from './ActionsToolbar';
import useRect from '../hooks/useRect';

const ITEM_WIDTH = 32;
const ITEM_SPACING = 4;
const DIVIDER = 1;
const NUMBER_OF_ITEMS = 6;
const MIN_WIDTH = (ITEM_WIDTH + ITEM_SPACING) * NUMBER_OF_ITEMS + DIVIDER + ITEM_SPACING;

/**
 * @interface
 * @extends HTMLElement
 * @since 2.0.0
 */
const CellTitle = {
  /** @type {'njs-cell-title'} */
  className: 'njs-cell-title',
};

/**
 * @interface
 * @extends HTMLElement
 * @since 2.0.0
 */
const CellSubTitle = {
  /** @type {'njs-cell-sub-title'} */
  className: 'njs-cell-sub-title',
};

const useStyles = makeStyles((theme) => ({
  containerStyle: {
    flexGrow: 0,
  },
  containerTitleStyle: {
    paddingBottom: theme.spacing(1),
  },
}));

const Header = ({ layout, sn, anchorEl, hovering }) => {
  const showTitle = layout.showTitles && !!layout.title;
  const showSubtitle = layout.showTitles && !!layout.subtitle;
  const showInSelectionActions = layout.qSelectionInfo && layout.qSelectionInfo.qInSelections;
  const [actions, setActions] = useState([]);
  const { containerStyle, containerTitleStyle } = useStyles();
  const [containerRef, containerRect] = useRect();
  const [shouldShowPopoverToolbar, setShouldShowPopoverToolbar] = useState(false);

  useEffect(() => {
    if (!sn || !sn.component || !sn.component.isHooked) {
      return;
    }
    sn.component.observeActions((a) => {
      setActions([...a, ...((sn && sn.selectionToolbar && sn.selectionToolbar.items) || [])]);
    });
  }, [sn]);

  useEffect(() => {
    if (!containerRect) return;
    const { width } = containerRect;
    setShouldShowPopoverToolbar(width < MIN_WIDTH);
  }, [containerRect]);

  const showTitles = showTitle || showSubtitle;
  const classes = [containerStyle, ...(showTitles ? [containerTitleStyle] : [])];
  const showPopoverToolbar = (hovering || showInSelectionActions) && (shouldShowPopoverToolbar || !showTitles);
  const showToolbar = showTitles && !showPopoverToolbar && !shouldShowPopoverToolbar;
  const refocusContent = () => sn.component && typeof sn.component.focus === 'function' && sn.component.focus();

  const Toolbar = (
    <ActionsToolbar
      show={showToolbar}
      selections={{ show: showInSelectionActions, api: sn.component.selections }}
      actions={actions}
      popover={{ show: showPopoverToolbar, anchorEl }}
      refocusContent={refocusContent}
    />
  );

  return (
    <Grid ref={containerRef} item container wrap="nowrap" className={classes.join(' ')}>
      <Grid item zeroMinWidth xs>
        <Grid container wrap="nowrap" direction="column">
          {showTitle && (
            <Typography variant="h6" noWrap className={CellTitle.className}>
              {layout.title}
            </Typography>
          )}
          {showSubtitle && (
            <Typography variant="body2" noWrap className={CellSubTitle.className}>
              {layout.subtitle}
            </Typography>
          )}
        </Grid>
      </Grid>
      <Grid item>{Toolbar}</Grid>
    </Grid>
  );
};

export default Header;
