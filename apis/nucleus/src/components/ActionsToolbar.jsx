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
  /** @type {'njs-action-toolbar-popover'} */
  className: 'njs-action-toolbar-popover',
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
  focusHandler = null,
}) => {
  const defaultSelectionActions = useDefaultSelectionActions(selections);
  const { itemSpacing } = useStyles();
  const { translator, keyboardNavigation } = useContext(InstanceContext);
  const [showMoreItems, setShowMoreItems] = useState(false);
  const [moreEnabled, setMoreEnabled] = useState(more.enabled);
  const [moreActions, setMoreActions] = useState(more.actions);
  const [moreAlignTo, setMoreAlignTo] = useState(more.alignTo);
  const moreRef = useRef();
  const actionsRef = useRef();
  const theme = useTheme();
  const dividerStyle = useMemo(() => ({ margin: theme.spacing(0.5, 0) }));

  const getEnabledButton = (last) => {
    if (!actionsRef.current) return null;
    const buttons = actionsRef.current.querySelectorAll('button:not(.Mui-disabled)');
    return buttons[last ? buttons.length - 1 : 0];
  };

  useEffect(() => () => setShowMoreItems(false), [popover.show]);

  useEffect(() => {
    setMoreEnabled(more.enabled);
  }, [more.enabled]);

  useEffect(() => {
    if (!focusHandler) return;

    const focusFirst = () => {
      const enabledButon = getEnabledButton(false);
      enabledButon && enabledButon.focus();
    };
    const focusLast = () => {
      const enabledButon = getEnabledButton(true);
      enabledButon && enabledButon.focus();
    };
    focusHandler.on('focus_toolbar_first', focusFirst);
    focusHandler.on('focus_toolbar_last', focusLast);
  }, []);

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

  const tabCallback =
    // if keyboardNavigation is true, create a callback to handle tabbing from the first/last button in the toolbar that resets focus on the content
    keyboardNavigation && focusHandler && focusHandler.refocusContent
      ? (evt) => {
          if (evt.key !== 'Tab') return;
          const isTabbingOut =
            (evt.shiftKey && getEnabledButton(false) === evt.target) ||
            (!evt.shiftKey && getEnabledButton(true) === evt.target);
          if (isTabbingOut) {
            evt.preventDefault();
            evt.stopPropagation();
            focusHandler.refocusContent();
          }
        }
      : null;

  const showActions = newActions.length > 0;
  const showMore = moreActions.length > 0;
  const showDivider = (showActions && selections.show) || (showMore && selections.show);
  const Actions = (
    <Grid ref={actionsRef} onKeyDown={tabCallback} container spacing={0} wrap="nowrap">
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
