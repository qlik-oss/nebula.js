/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { styled } from '@mui/material/styles';
import { ButtonBase, Grid, IconButton, Typography } from '@mui/material';
import Lock from '@nebula.js/ui/icons/lock';
import { unlock } from '@nebula.js/ui/icons/unlock';
import SearchIcon from '@nebula.js/ui/icons/search';
import DrillDownIcon from '@nebula.js/ui/icons/drill-down';
import ActionsToolbar from '../ActionsToolbar';
import showToolbarDetached from './interactions/listbox-show-toolbar-detached';
import getListboxActionProps from './interactions/listbox-action-props';
import createListboxSelectionToolbar from './interactions/listbox-selection-toolbar';
import { BUTTON_ICON_WIDTH, CELL_PADDING_LEFT, HEADER_PADDING_RIGHT, ICON_PADDING } from './constants';
import hasSelections from './assets/has-selections';

const UnlockButton = styled(ButtonBase)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  height: 48,
  zIndex: 2, // so it goes on top of action buttons
  background: theme.palette.custom.disabledBackground,
  opacity: 1,
  color: theme.palette.custom.disabledContrastText,
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-start',
  paddingLeft: 16,
  paddingRight: 16,
  borderRadius: 0,
  '& *, & p': {
    color: theme.palette.custom.disabledContrastText,
  },
  '& i': {
    padding: `${ICON_PADDING}px`,
  },
}));

const StyledGridHeader = styled(Grid, { shouldForwardProp: (p) => !['styles', 'isRtl'].includes(p) })(
  ({ styles, isRtl }) => ({
    flexDirection: isRtl ? 'row-reverse' : 'row',
    wrap: 'nowrap',
    minHeight: 32,
    alignContent: 'center',
    ...styles.header,
    '& *': {
      color: styles.header.color,
    },
  })
);

const iconStyle = {
  fontSize: '12px',
};

const Title = styled(Typography)(({ styles }) => ({
  ...styles.header,
  display: 'block', // needed for text-overflow to work
  alignItems: 'center',
  paddingRight: '1px', // make place for italic font style
}));

function UnlockCoverButton({ translator, toggleLock, keyboard }) {
  const fontSize = '14px';
  const unLockText = translator.get('SelectionToolbar.ClickToUnlock');
  const component = (
    <UnlockButton
      title={unLockText}
      tabIndex={keyboard.enabled ? 0 : -1}
      onClick={toggleLock}
      data-testid="listbox-unlock-button"
      id="listbox-unlock-button"
    >
      <Lock disableRipple style={iconStyle} />
      <Typography fontSize={fontSize}>{unLockText}</Typography>
    </UnlockButton>
  );
  return component;
}

export default function ListBoxHeader({
  layout,
  translator,
  styles,
  isRtl,
  direction,
  showLock,
  selectDisabled,
  showSearchIcon,
  isDrillDown,
  constraints,
  onShowSearch,
  classes,
  containerRect,
  isPopover,
  showToolbar,
  showDetachedToolbarOnly,
  containerRef,
  model,
  selectionState,
  isDirectQuery,
  selections,
  keyboard,
  autoConfirm,
}) {
  const [isToolbarDetached, setIsToolbarDetached] = useState(showDetachedToolbarOnly);
  const [isLocked, setLocked] = useState(layout?.qListObject?.qDimensionInfo?.qLocked);

  useEffect(() => {
    setLocked(layout?.qListObject?.qDimensionInfo?.qLocked);
  }, [layout?.qListObject?.qDimensionInfo?.qLocked]);

  const titleRef = useRef(null);

  const showUnlock = showLock && isLocked;
  const showLockIcon = !showLock && isLocked; // shows instead of the cover button when field/dim is locked.
  const showLeftIcon = showSearchIcon || showLockIcon || isDrillDown; // the left-most icon outside of the actions/selections toolbar.

  const paddingLeft = CELL_PADDING_LEFT - (showLeftIcon ? ICON_PADDING : 0);
  const paddingRight = isRtl ? CELL_PADDING_LEFT - (showLeftIcon ? ICON_PADDING : 0) : HEADER_PADDING_RIGHT;

  // Calculate explicit width for icons container. Search and lock cannot exist combined.
  const iconsWidth =
    (showSearchIcon ? BUTTON_ICON_WIDTH : 0) +
    (showLockIcon ? BUTTON_ICON_WIDTH : 0) +
    (isDrillDown ? BUTTON_ICON_WIDTH : 0);

  const toggleLock = useCallback(() => {
    const func = isLocked ? model.unlock : model.lock;
    setLocked(!isLocked);
    func.call(model, '/qListObjectDef').catch(() => {
      setLocked(isLocked); // revert to the layout value
    });
  }, [isLocked, setLocked, model, layout]);

  const listboxSelectionToolbarItems = createListboxSelectionToolbar({
    layout,
    model,
    translator,
    selectionState,
    isDirectQuery,
  });

  const extraItems =
    isLocked || !showLock
      ? undefined
      : [
          {
            key: 'lock',
            type: undefined,
            label: translator.get('SelectionToolbar.ClickToLock'),
            getSvgIconShape: unlock,
            enabled: () => !selectDisabled() && hasSelections(layout),
            action: toggleLock,
          },
        ];

  const searchIconComp = constraints?.active ? (
    <SearchIcon
      title={translator.get('Listbox.Search')}
      size="large"
      style={{ ...iconStyle, padding: `${ICON_PADDING}px` }}
    />
  ) : (
    <IconButton
      onClick={onShowSearch}
      tabIndex={-1}
      title={translator.get('Listbox.Search')}
      size="large"
      disableRipple
      data-testid="search-toggle-btn"
    >
      <SearchIcon style={iconStyle} />
    </IconButton>
  );

  useEffect(() => {
    if (!titleRef.current || !containerRect) {
      return;
    }

    const mustShowDetached = showToolbarDetached({
      containerRect,
      titleRef,
      iconsWidth,
      paddingLeft,
      paddingRight,
    });
    const isDetached = showDetachedToolbarOnly || mustShowDetached;
    setIsToolbarDetached(isDetached);
  }, [
    iconsWidth,
    paddingLeft,
    paddingRight,
    titleRef.current,
    showDetachedToolbarOnly,
    Object.entries(containerRect || {})
      .sort()
      .join(','),
  ]);

  const toolbarProps = getListboxActionProps({
    isDetached: isPopover ? false : isToolbarDetached,
    showToolbar,
    containerRef,
    isLocked,
    extraItems,
    listboxSelectionToolbarItems,
    selections,
    keyboard,
    autoConfirm,
  });

  const actionsToolbar = <ActionsToolbar direction={direction} layout={layout} {...toolbarProps} />;

  if (showDetachedToolbarOnly) {
    return actionsToolbar;
  }

  // Always show a lock symbol when locked and showLock is false
  const lockedIconComp = showLockIcon ? (
    <Lock size="large" style={{ ...iconStyle, padding: `${ICON_PADDING}px` }} />
  ) : undefined;

  return (
    <StyledGridHeader
      item
      container
      styles={styles}
      isRtl={isRtl}
      marginY={1}
      paddingLeft={`${paddingLeft}px`}
      paddingRight={`${paddingRight}px`}
      className="header-container"
    >
      {showUnlock && <UnlockCoverButton translator={translator} toggleLock={toggleLock} keyboard={keyboard} />}
      {showLeftIcon && (
        <Grid item container alignItems="center" width={iconsWidth} className="header-action-container">
          {lockedIconComp || (showSearchIcon && searchIconComp)}
          {isDrillDown && (
            <DrillDownIcon
              tabIndex={-1}
              title={translator.get('Listbox.DrillDown')}
              style={{ ...iconStyle, padding: `${ICON_PADDING}px` }}
            />
          )}
        </Grid>
      )}
      <Grid
        item
        xs
        minWidth={0} // needed to text-overflow see: https://css-tricks.com/flexbox-truncated-text/
        justifyContent={isRtl ? 'flex-end' : 'flex-start'}
        className={classes.listBoxHeader}
      >
        <Title variant="h6" noWrap ref={titleRef} title={layout.title} styles={styles}>
          {layout.title}
        </Title>
      </Grid>
      <Grid item display="flex">
        {actionsToolbar}
      </Grid>
    </StyledGridHeader>
  );
}
