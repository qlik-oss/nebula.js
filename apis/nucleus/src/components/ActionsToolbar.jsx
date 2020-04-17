import React, { useState, useContext, useRef, useEffect, useMemo } from 'react';

import { Grid, Divider, makeStyles, Popover } from '@material-ui/core';

import { more as moreIcon } from '@nebula.js/ui/icons/more';
import { useTheme } from '@nebula.js/ui/theme';

import Item from './ActionsToolbarItem';
import useDefaultSelectionActions from '../hooks/useDefaultSelectionActions';
import InstanceContext from '../contexts/InstanceContext';
import More from './ActionsToolbarMore';

const useStyles = makeStyles((theme) => ({
  itemSpacing: {
    padding: theme.spacing(0, 0.5),
  },
  firstItemSpacing: {
    padding: theme.spacing(0, 0.5, 0, 0),
  },
  lastItemSpacing: {
    padding: theme.spacing(0, 0, 0, 0.5),
  },
}));

const ActionsGroup = React.forwardRef(({ actions = [], first = false, last = false, addAnchor = false }, ref) => {
  const { itemSpacing, firstItemSpacing, lastItemSpacing } = useStyles();
  return actions.length > 0 ? (
    <Grid item container spacing={0} wrap="nowrap">
      {actions.map((e, ix) => {
        let cls = itemSpacing;
        if (first && ix === 0) {
          cls = firstItemSpacing;
        } else if (last && actions.length - 1 === ix) {
          cls = lastItemSpacing;
        }
        return (
          <Grid item key={e.key} className={cls}>
            <Item key={e.key} item={e} ref={ix === 0 ? ref : null} addAnchor={addAnchor} />
          </Grid>
        );
      })}
    </Grid>
  ) : null;
});

const ActionsToolbar = ({
  show = true,
  actions = [],
  maxItems = 3,
  selections = {
    show: false,
    api: null,
    onConfirm: () => {},
    onCancel: () => {},
  },
  more = {
    enabled: false,
    actions: [],
    alignTo: null,
    popoverProps: {},
    popoverPaperStyle: {},
  },
  popover = {
    show: false,
    anchorEl: null,
  },
}) => {
  const defaultSelectionActions = useDefaultSelectionActions(selections);
  const { itemSpacing } = useStyles();
  const { translator } = useContext(InstanceContext);
  const [showMoreItems, setShowMoreItems] = useState(false);
  const [moreEnabled, setMoreEnabled] = useState(more.enabled);
  const [moreActions, setMoreActions] = useState(more.actions);
  const [moreAlignTo, setMoreAlignTo] = useState(more.alignTo);
  const moreRef = useRef();
  const theme = useTheme();

  useEffect(() => {
    return () => setShowMoreItems(false);
  }, [popover.show]);

  const newActions = useMemo(() => actions.filter((a) => !a.hidden), [actions]);

  if (!selections.show && newActions.length === 0) return null;

  const handleCloseShowMoreItems = () => {
    setShowMoreItems(false);
  };

  const moreItem = {
    key: 'more',
    label: translator.get('Menu.More'), // TODO: Add translation
    getSvgIconShape: moreIcon,
    hidden: false,
    enabled: () => moreEnabled,
    action: () => setShowMoreItems(!showMoreItems),
  };

  if (newActions.length > maxItems) {
    const newMoreActions = newActions.splice(-(newActions.length - maxItems) - 1);
    setMoreEnabled(true);
    setMoreActions([...newMoreActions, ...more.actions]);
    setMoreAlignTo(moreRef);
  }

  const showActions = !!(newActions.length > 0 || selections.show);
  const showMore = moreActions.length > 0;
  const showDivider = (showActions && selections.show) || (showMore && selections.show);

  const Actions = (
    <Grid container spacing={0} wrap="nowrap">
      {showActions && <ActionsGroup actions={newActions} first />}
      {showMore && (
        <ActionsGroup ref={moreRef} actions={[moreItem]} first={!showActions} last={!selections.show} addAnchor />
      )}
      {showDivider && (
        <Grid item className={itemSpacing}>
          <Divider orientation="vertical" />
        </Grid>
      )}
      {selections.show && <ActionsGroup actions={defaultSelectionActions} first={!showActions && !showMore} last />}
      {showMoreItems && (
        <More
          show={showMoreItems}
          actions={moreActions}
          alignTo={moreAlignTo}
          popoverProps={more.popoverProps}
          popoverPaperStyle={more.popoverPaperStyle}
          onCloseOrActionClick={handleCloseShowMoreItems}
        />
      )}
    </Grid>
  );

  return popover.show ? (
    <Popover
      open={popover.show}
      anchorEl={popover.anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      hideBackdrop
      style={{ pointerEvents: 'none' }}
      PaperProps={{
        style: {
          pointerEvents: 'auto',
          padding: theme.spacing(1, 1),
        },
      }}
    >
      {Actions}
    </Popover>
  ) : (
    show && Actions
  );
};

export default ActionsToolbar;
