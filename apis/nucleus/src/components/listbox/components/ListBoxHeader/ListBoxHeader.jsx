/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useRef, useState } from 'react';
import { Button, Grid, IconButton, styled } from '@mui/material';
import Lock from '@nebula.js/ui/icons/lock';
import { unlock } from '@nebula.js/ui/icons/unlock';
import SearchIcon from '@nebula.js/ui/icons/search';
import DrillDownIcon from '@nebula.js/ui/icons/drill-down';
import CyclicIcon from '@nebula.js/ui/icons/reload';
import ActionsToolbar from '../../../ActionsToolbar';
import showToolbarDetached from '../../interactions/listbox-show-toolbar-detached';
import getListboxActionProps from '../../interactions/listbox-action-props';
import createListboxSelectionToolbar from '../../interactions/listbox-selection-toolbar';
import { BUTTON_ICON_WIDTH, CELL_PADDING_LEFT, HEADER_PADDING_RIGHT, ICON_PADDING } from '../../constants';
import hasSelections from '../../assets/has-selections';
import { HeaderTitle, StyledGridHeader, UnlockCoverButton, iconStyle } from './ListBoxHeaderComponents';

const dimensionTypes = {
  single: 'N',
  drillDown: 'H',
  cyclic: 'C',
};

const createDimensionIconData = (dimInfo, app) => {
  switch (dimInfo.qGrouping) {
    case dimensionTypes.drillDown:
      return {
        icon: DrillDownIcon,
        tooltip: 'Tooltip.dimensions.drilldown',
        onClick: undefined,
      };
    case dimensionTypes.cyclic:
      return {
        icon: CyclicIcon,
        tooltip: 'Tooltip.dimensions.cyclic',
        onClick: () => {
          app
            .getDimension(dimInfo.qLibraryId)
            .then((dimensionModel) => {
              dimensionModel.stepCycle(1);
            })
            .catch(() => null);
        },
      };
    default:
      return undefined;
  }
};

const StyledButton = styled(Button)(() => ({
  borderRadius: 4,
  width: 24,
  height: 24,
  minWidth: 22,
  padding: 0,
}));

// ms that needs to pass before the lock button can be toggled again
const lockTimeFrameMs = 500;
let lastTime = 0;

function getToggleLock({ isLocked, setLocked, settingLockedState, model, setSettingLockedState }) {
  return () => {
    const now = new Date();
    const curTime = now - lastTime;
    if (curTime < lockTimeFrameMs) {
      return Promise.resolve();
    }
    if (settingLockedState) {
      return () => {};
    }
    setSettingLockedState(true);
    lastTime = now;
    const func = isLocked ? model.unlock : model.lock;
    setLocked(!isLocked);
    return func
      .call(model, '/qListObjectDef')
      .catch(() => {
        setLocked(isLocked); // revert to the layout value
      })
      .finally(() => {
        setTimeout(() => {
          setSettingLockedState(false);
        }, 0);
      });
  };
}

export default function ListBoxHeader({
  layout,
  translator,
  styles,
  isRtl,
  showLock,
  showSearchIcon,
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
  app,
}) {
  const [isToolbarDetached, setIsToolbarDetached] = useState(showDetachedToolbarOnly);
  const [isLocked, setLocked] = useState(layout?.qListObject?.qDimensionInfo?.qLocked);
  const [settingLockedState, setSettingLockedState] = useState(false);

  useEffect(() => {
    setLocked(layout?.qListObject?.qDimensionInfo?.qLocked);
  }, [layout?.qListObject?.qDimensionInfo?.qLocked]);

  const titleRef = useRef(null);
  const iconData = createDimensionIconData(layout?.qListObject?.qDimensionInfo, app);
  const showUnlock = showLock && isLocked;
  const showLockIcon = !showLock && isLocked; // shows instead of the cover button when field/dim is locked.
  const showLeftIcon = showSearchIcon || showLockIcon || iconData; // the left-most icon outside of the actions/selections toolbar.

  const paddingLeft = CELL_PADDING_LEFT - (showLeftIcon ? ICON_PADDING : 0);
  const paddingRight = isRtl ? CELL_PADDING_LEFT - (showLeftIcon ? ICON_PADDING : 0) : HEADER_PADDING_RIGHT;

  // Calculate explicit width for icons container. Search and lock cannot exist combined.
  const iconsWidth =
    (showSearchIcon ? BUTTON_ICON_WIDTH : 0) +
    (showLockIcon ? BUTTON_ICON_WIDTH : 0) +
    (iconData ? BUTTON_ICON_WIDTH : 0);

  const toggleLock = getToggleLock({ isLocked, setLocked, settingLockedState, setSettingLockedState, model });

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
            enabled: () => !settingLockedState && !selectionState.selectDisabled() && hasSelections(layout),
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

  const dimensionIconComp = () => {
    const DimensionIcon = iconData?.icon;
    const title = translator.get(iconData?.tooltip);
    const isButton = DimensionIcon && iconData.onClick;
    if (DimensionIcon) {
      return isButton ? (
        <StyledButton
          variant="outlined"
          onClick={iconData.onClick}
          tabIndex={-1}
          title={title}
          size="large"
          disableRipple
        >
          <DimensionIcon style={iconStyle} />
        </StyledButton>
      ) : (
        <DimensionIcon title={title} size="large" style={{ ...iconStyle, padding: `${ICON_PADDING}px` }} />
      );
    }
    return undefined;
  };

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

  const actionsToolbar = <ActionsToolbar isRtl={isRtl} layout={layout} {...toolbarProps} />;

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
      {showUnlock && (
        <UnlockCoverButton
          isLoading={settingLockedState}
          translator={translator}
          toggleLock={toggleLock}
          keyboard={keyboard}
        />
      )}
      {showLeftIcon && (
        <Grid item container alignItems="center" width={iconsWidth} className="header-action-container">
          {lockedIconComp || (showSearchIcon && searchIconComp)}
          {dimensionIconComp()}
        </Grid>
      )}
      <Grid
        item
        xs
        minWidth={0} // needed to text-overflow see: https://css-tricks.com/flexbox-truncated-text/
        justifyContent={isRtl ? 'flex-end' : 'flex-start'}
        className={classes.listBoxHeader}
      >
        <HeaderTitle variant="h6" noWrap ref={titleRef} title={layout.title} styles={styles}>
          {layout.title}
        </HeaderTitle>
      </Grid>
      <Grid item display="flex">
        {actionsToolbar}
      </Grid>
    </StyledGridHeader>
  );
}
