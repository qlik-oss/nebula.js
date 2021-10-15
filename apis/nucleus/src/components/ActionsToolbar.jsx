import React, { useState, useContext, useRef, useEffect, useMemo } from 'react';

import { Grid, Divider, makeStyles, Popover } from '@material-ui/core';

import { more as moreIcon } from '@nebula.js/ui/icons/more';
import { useTheme } from '@nebula.js/ui/theme';

import Item from './ActionsToolbarItem';
import useDefaultSelectionActions from '../hooks/useDefaultSelectionActions';
import InstanceContext from '../contexts/InstanceContext';
import More from './ActionsToolbarMore';

/**
 * @interface
 * @extends HTMLElement
 * @since 2.1.0
 */
const ActionToolbarElement = {
  /** @type {'njs-cell-action-toolbar'} */
  className: 'njs-cell-action-toolbar',
};

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
        let cls = [];
        const isFirstItem = first && ix === 0;
        const isLastItem = last && actions.length - 1 === ix;
        if (isFirstItem && !isLastItem) {
          cls = [firstItemSpacing];
        }
        if (isLastItem && !isFirstItem) {
          cls = [...cls, lastItemSpacing];
        }
        if (!isFirstItem && !isLastItem && cls.length === 0) {
          cls = [itemSpacing];
        }
        return (
          <Grid item key={e.key} className={cls.join(' ').trim()}>
            <Item key={e.key} item={e} ref={ix === 0 ? ref : null} addAnchor={addAnchor} />
          </Grid>
        );
      })}
    </Grid>
  ) : null;
});

const popoverStyle = { pointerEvents: 'none' };
const popoverAnchorOrigin = {
  vertical: 'top',
  horizontal: 'right',
};
const popoverTransformOrigin = {
  vertical: 'bottom',
  horizontal: 'right',
};

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
  const dividerStyle = useMemo(() => ({ margin: theme.spacing(0.5, 0) }));

  useEffect(() => () => setShowMoreItems(false), [popover.show]);

  useEffect(() => {
    setMoreEnabled(more.enabled);
  }, [more.enabled]);

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

  const showActions = newActions.length > 0;
  const showMore = moreActions.length > 0;
  const showDivider = (showActions && selections.show) || (showMore && selections.show);
  const Actions = (
    <Grid container spacing={0} wrap="nowrap" className={popover.show ? '' : ActionToolbarElement.className}>
      {showActions && <ActionsGroup actions={newActions} first last={!showMore && !selections.show} />}
      {showMore && (
        <ActionsGroup ref={moreRef} actions={[moreItem]} first={!showActions} last={!selections.show} addAnchor />
      )}
      {showDivider && (
        <Grid item className={itemSpacing} style={dividerStyle}>
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
      disableEnforceFocus
      disableAutoFocus
      disableRestoreFocus
      open={popover.show}
      anchorEl={popover.anchorEl}
      anchorOrigin={popoverAnchorOrigin}
      transformOrigin={popoverTransformOrigin}
      hideBackdrop
      style={popoverStyle}
      PaperProps={{
        className: ActionToolbarElement.className,
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
