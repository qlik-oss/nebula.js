import React, { useState, useContext, useRef, useEffect, useMemo } from 'react';

import { styled } from '@mui/material/styles';

import { Grid, Divider, Popover } from '@mui/material';

import { more as moreIcon } from '@nebula.js/ui/icons/more';
import { useTheme } from '@nebula.js/ui/theme';

import Item from './ActionsToolbarItem';
import useDefaultSelectionActions from '../hooks/useDefaultSelectionActions';
import InstanceContext from '../contexts/InstanceContext';
import More from './ActionsToolbarMore';

const PREFIX = 'ActionsToolbar';

const classes = {
  item: `${PREFIX}-item`,
  itemSpacing: `${PREFIX}-itemSpacing`,
  firstItemSpacing: `${PREFIX}-firstItemSpacing`,
  lastItemSpacing: `${PREFIX}-lastItemSpacing`,
};

const StyledPopover = styled(Popover)(({ theme }) => ({
  [`& .${classes.itemSpacing}`]: {
    padding: theme.spacing(0, 0.5),
  },

  [`& .${classes.firstItemSpacing}`]: {
    padding: theme.spacing(0, 0.5, 0, 0),
  },

  [`& .${classes.lastItemSpacing}`]: {
    padding: theme.spacing(0, 0, 0, 0.5),
  },
}));

/**
 * @interface
 * @extends HTMLElement
 * @since 2.1.0
 */
const ActionToolbarElement = {
  /** @type {'njs-action-toolbar-popover'} */
  className: 'njs-action-toolbar-popover',
};

const ActionsGroup = React.forwardRef(
  (
    { className, ariaExpanded = false, actions = [], first = false, last = false, addAnchor = false, isRtl = false },
    ref
  ) =>
    actions.length > 0 ? (
      <Grid item container gap={0} flexDirection={isRtl ? 'row-reverse' : 'row'} wrap="nowrap" className={className}>
        {actions.map((e, ix) => {
          let cls = [];
          const isFirstItem = first && ix === 0;
          const isLastItem = last && actions.length - 1 === ix;
          if (isFirstItem && !isLastItem) {
            cls = [classes.firstItemSpacing, classes.item];
          }
          if (isLastItem && !isFirstItem) {
            cls = [...cls, classes.lastItemSpacing, classes.item];
          }
          if (!isFirstItem && !isLastItem && cls.length === 0) {
            cls = [classes.itemSpacing, classes.item];
          }
          return (
            <Grid item key={e.key} className={cls.join(' ').trim()}>
              <Item
                ariaExpanded={ariaExpanded}
                key={e.key}
                item={e}
                ref={ix === 0 ? ref : null}
                addAnchor={addAnchor}
              />
            </Grid>
          );
        })}
      </Grid>
    ) : null
);

const popoverStyle = { pointerEvents: 'none' };
const popoverTransformOrigin = {
  vertical: 'bottom',
  horizontal: 'right',
};

function ActionsToolbar({
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
  actionsRefMock = null, // for testing
  direction = 'ltr',
}) {
  const defaultSelectionActions = useDefaultSelectionActions(selections);

  const { translator, keyboardNavigation } = useContext(InstanceContext);
  const [showMoreItems, setShowMoreItems] = useState(false);

  const moreRef = useRef();
  const actionsRef = useRef();
  const theme = useTheme();
  const dividerStyle = useMemo(() => ({ margin: theme.spacing(0.5, 0) }));

  const popoverAnchorOrigin = {
    vertical: 15,
    horizontal: (popover.anchorEl?.clientWidth ?? 0) - 7,
  };

  const getEnabledButton = (last) => {
    const actionsElement = actionsRef.current || actionsRefMock;
    if (!actionsElement) return null;
    const buttons = actionsElement.querySelectorAll('button:not(.Mui-disabled)');
    return buttons[last ? buttons.length - 1 : 0];
  };

  useEffect(
    () => () => {
      setShowMoreItems(false);
    },
    [popover.show, show, selections.show]
  );

  useEffect(() => {
    if (!focusHandler) return;

    const focusFirst = () => {
      const enabledButton = getEnabledButton(false);
      enabledButton && enabledButton.focus();
    };
    const focusLast = () => {
      const enabledButton = getEnabledButton(true);
      enabledButton && enabledButton.focus();
    };
    focusHandler.on('focus_toolbar_first', focusFirst);
    focusHandler.on('focus_toolbar_last', focusLast);
  }, []);

  let moreEnabled = more.enabled;
  let moreActions = more.actions;
  const moreAlignTo = more.alignTo || moreRef;
  const newActions = actions.filter((a) => !a.hidden);
  if (newActions.length > maxItems) {
    const newMoreActions = newActions.splice(-(newActions.length - maxItems) - 1);
    moreEnabled = true;
    moreActions = [...newMoreActions, ...more.actions];
  }

  if (!selections.show && newActions.length === 0) return null;

  const handleCloseShowMoreItems = () => {
    setShowMoreItems(false);
  };

  const moreItem = {
    key: 'more',
    label: translator.get('Menu.More'), // TODO: Add translation
    getSvgIconShape: moreIcon,
    hidden: false,
    active: showMoreItems,
    enabled: () => moreEnabled,
    action: () => setShowMoreItems(!showMoreItems),
  };

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
  const isRtl = direction === 'rtl';

  const Actions = (
    <Grid
      ref={actionsRef}
      onKeyDown={tabCallback}
      container
      gap={0}
      wrap="nowrap"
      sx={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}
    >
      {showActions && <ActionsGroup actions={newActions} first last={!showMore && !selections.show} />}
      {showMore && (
        <ActionsGroup
          id="actions-toolbar-show-more"
          data-testid="actions-toolbar-show-more"
          ref={moreRef}
          ariaExpanded={showMoreItems}
          actions={[moreItem]}
          first={!showActions}
          last={!selections.show}
          addAnchor
        />
      )}
      {showDivider && (
        <Grid item className={classes.itemSpacing} style={dividerStyle}>
          <Divider orientation="vertical" />
        </Grid>
      )}
      {selections.show && (
        <ActionsGroup
          className="actions-toolbar-default-actions"
          actions={defaultSelectionActions}
          first={!showActions && !showMore}
          last
          isRtl={isRtl}
        />
      )}
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
    <StyledPopover
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
        id: 'njs-action-toolbar-popover',
        'data-testid': 'njs-action-toolbar-popover',
        className: ActionToolbarElement.className,
        style: {
          pointerEvents: 'auto',
          padding: theme.spacing(0.8),
        },
      }}
    >
      {Actions}
    </StyledPopover>
  ) : (
    show && Actions
  );
}

export default ActionsToolbar;
