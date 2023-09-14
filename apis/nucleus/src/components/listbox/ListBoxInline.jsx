/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import AutoSizer from 'react-virtualized-auto-sizer';
import Lock from '@nebula.js/ui/icons/lock';
import { IconButton, Grid, Typography } from '@mui/material';
import { useTheme } from '@nebula.js/ui/theme';
import SearchIcon from '@nebula.js/ui/icons/search';
import DrillDownIcon from '@nebula.js/ui/icons/drill-down';
import useLayout from '../../hooks/useLayout';
import ListBox from './ListBox';
import createListboxSelectionToolbar from './interactions/listbox-selection-toolbar';
import ActionsToolbar from '../ActionsToolbar';
import InstanceContext from '../../contexts/InstanceContext';
import ListBoxSearch from './components/ListBoxSearch';
import getListboxContainerKeyboardNavigation from './interactions/keyboard-navigation/keyboard-nav-container';
import addListboxTheme from './assets/addListboxTheme';
import useAppSelections from '../../hooks/useAppSelections';
import showToolbarDetached from './interactions/listbox-show-toolbar-detached';
import getListboxActionProps from './interactions/listbox-get-action-props';
import createSelectionState from './hooks/selections/selectionState';
import { CELL_PADDING_LEFT, ICON_WIDTH, ICON_PADDING, BUTTON_ICON_WIDTH, HEADER_PADDING_RIGHT } from './constants';
import useTempKeyboard from './components/useTempKeyboard';
import ListBoxError from './components/ListBoxError';
import useRect from '../../hooks/useRect';
import isDirectQueryEnabled from './utils/is-direct-query';

const PREFIX = 'ListBoxInline';
const classes = {
  listBoxHeader: `${PREFIX}-listBoxHeader`,
  screenReaderOnly: `${PREFIX}-screenReaderOnly`,
  listboxWrapper: `${PREFIX}-listboxWrapper`,
};

const StyledGrid = styled(Grid, { shouldForwardProp: (p) => !['containerPadding', 'isGridMode'].includes(p) })(
  ({ theme, containerPadding, isGridMode }) => ({
    backgroundColor: theme.listBox?.backgroundColor ?? theme.palette.background.default,
    [`& .${classes.listBoxHeader}`]: {
      alignSelf: 'center',
      display: 'flex',
    },
    [`& .${classes.screenReaderOnly}`]: {
      position: 'absolute',
      height: 0,
      width: 0,
      overflow: 'hidden',
    },
    [`& .${classes.listboxWrapper}`]: {
      padding: containerPadding,
    },
    '&:focus': {
      boxShadow: `inset 0 0 0 2px ${theme.palette.custom.focusBorder} !important`,
    },
    '&:focus ::-webkit-scrollbar-track': {
      boxShadow: !isGridMode ? 'inset -2px -2px 0px #3F8AB3' : undefined,
    },
    '&:focus-visible': {
      outline: 'none',
    },
  })
);

const Title = styled(Typography)(({ theme }) => ({
  color: theme.listBox?.title?.main?.color,
  fontSize: theme.listBox?.title?.main?.fontSize,
  fontFamily: theme.listBox?.title?.main?.fontFamily,
  fontWeight: theme.listBox?.title?.main?.fontWeight || 'bold',
}));
const isModal = ({ app, appSelections }) => app.isInModalSelection?.() ?? appSelections.isInModal();

function ListBoxInline({ options, layout }) {
  const {
    app,
    direction,
    frequencyMode,
    checkboxes,
    search = true,
    focusSearch = false,
    rangeSelect = true,
    model,
    selections,
    update = undefined,
    fetchStart = undefined,
    selectDisabled = () => false,
    postProcessPages = undefined,
    calculatePagesHeight,
    showGray = true,
    scrollState = undefined,
    renderedCallback,
    toolbar = true,
    isPopover = false,
  } = options;

  // Hook that will trigger update when used in useEffects.
  // Modified from: https://medium.com/@teh_builder/ref-objects-inside-useeffect-hooks-eb7c15198780
  const useRefWithCallback = () => {
    const [ref, setInternalRef] = useState({});
    const setRef = useCallback(
      (node) => {
        setInternalRef({ current: node });
      },
      [setInternalRef]
    );

    return [ref, setRef];
  };

  const theme = useTheme();

  const unlock = useCallback(() => {
    model.unlock('/qListObjectDef');
  }, [model]);

  const { translator, keyboardNavigation, themeApi, constraints } = useContext(InstanceContext);
  theme.listBox = addListboxTheme(themeApi);

  const isDirectQuery = isDirectQueryEnabled({ appLayout: app?.layout });

  const containerRef = useRef();
  const [containerRectRef, containerRect] = useRect();
  const [searchContainer, searchContainerRef] = useRefWithCallback();

  const [showToolbar, setShowToolbar] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const hovering = useRef(false);
  const [keyScroll, setKeyScroll] = useState({ down: 0, up: 0, scrollPosition: '' });
  const updateKeyScroll = (newState) => setKeyScroll((current) => ({ ...current, ...newState }));
  const [currentScrollIndex, setCurrentScrollIndex] = useState({ start: 0, stop: 0 });
  const [appSelections] = useAppSelections(app);
  const titleRef = useRef(null);
  const [selectionState] = useState(() => createSelectionState());
  const keyboard = useTempKeyboard({ containerRef, enabled: keyboardNavigation });
  const isModalMode = useCallback(() => isModal({ app, appSelections }), [app, appSelections]);
  const isInvalid = layout?.qListObject.qDimensionInfo.qError;
  const errorText = isInvalid && constraints.active ? 'Visualization.Invalid.Dimension' : 'Visualization.Incomplete';
  const [isToolbarDetached, setIsToolbarDetached] = useState(false);

  const { handleKeyDown, handleOnMouseEnter, handleOnMouseLeave, globalKeyDown } = useMemo(
    () =>
      getListboxContainerKeyboardNavigation({
        keyboard,
        hovering,
        updateKeyScroll,
        containerRef,
        currentScrollIndex,
        app,
        appSelections,
        constraints,
        isModal: isModalMode,
      }),
    [
      keyboard,
      hovering,
      updateKeyScroll,
      containerRef,
      currentScrollIndex,
      app,
      appSelections,
      constraints,
      isModalMode,
    ]
  );

  const showDetachedToolbarOnly = toolbar && (layout?.title === '' || layout?.showTitle === false) && !isPopover;
  const showToolbarWithTitle = (toolbar && layout?.title !== '' && layout?.showTitle !== false) || isPopover;

  useEffect(() => {
    document.addEventListener('keydown', globalKeyDown);
    return () => {
      document.removeEventListener('keydown', globalKeyDown);
    };
  }, [globalKeyDown]);

  useEffect(() => {
    const show = () => {
      setShowToolbar(true);
    };
    const hide = () => {
      setShowToolbar(false);
      if (search === 'toggle') {
        setShowSearch(false);
      }
    };
    if (isPopover) {
      if (!selections.isActive()) {
        selections.begin('/qListObjectDef');
        selections.on('activated', show);
        selections.on('deactivated', hide);
      }
      setShowToolbar(isPopover);
    }
    if (selections) {
      if (!selections.isModal()) {
        selections.on('activated', show);
        selections.on('deactivated', hide);
      }
      setShowToolbar(selections.isActive());
    }

    return () => {
      if (selections && selections.removeListener) {
        selections.removeListener('activated', show);
        selections.removeListener('deactivated', hide);
      }
    };
  }, [selections, isPopover]);

  useEffect(() => {
    if (!searchContainer || !searchContainer.current) {
      return;
    }
    // Focus search field on toggle-show or when focusSearch is true.
    if ((search && focusSearch) || (search === 'toggle' && showSearch)) {
      const input = searchContainer.current.querySelector('input');
      input && input.focus();
    }
  }, [searchContainer && searchContainer.current, showSearch, search, focusSearch]);

  const { wildCardSearch, searchEnabled, autoConfirm = false, layoutOptions = {} } = layout ?? {};
  const showSearchIcon = searchEnabled !== false && search === 'toggle';
  const isLocked = layout?.qListObject?.qDimensionInfo?.qLocked === true;
  const showSearchOrLockIcon = isLocked || showSearchIcon;
  const isDrillDown = layout?.qListObject?.qDimensionInfo?.qGrouping === 'H';
  const showIcons = showSearchOrLockIcon || isDrillDown;
  const iconsWidth = (showSearchOrLockIcon ? BUTTON_ICON_WIDTH : 0) + (isDrillDown ? ICON_WIDTH + ICON_PADDING : 0); // Drill-down icon needs padding right so there is space between the icon and the title
  const isRtl = direction === 'rtl';
  const headerPaddingLeft = CELL_PADDING_LEFT - (showSearchOrLockIcon ? ICON_PADDING : 0);
  const headerPaddingRight = isRtl ? CELL_PADDING_LEFT - (showIcons ? ICON_PADDING : 0) : HEADER_PADDING_RIGHT;

  useEffect(() => {
    if (!titleRef.current || !containerRect) {
      return;
    }

    const isDetached = showToolbarDetached({
      containerRect,
      titleRef,
      iconsWidth,
      headerPaddingLeft,
      headerPaddingRight,
    });
    setIsToolbarDetached(isDetached);
  }, [titleRef.current, containerRect]);

  if (!model || !layout || !translator) {
    return null;
  }

  const listboxSelectionToolbarItems = createListboxSelectionToolbar({
    layout,
    model,
    translator,
    selectionState,
    isDirectQuery,
  });

  const showTitle = true;
  const showSearchToggle = search === 'toggle' && showSearch;
  const searchVisible = (search === true || showSearchToggle) && !selectDisabled() && searchEnabled !== false;
  const dense = layoutOptions.dense ?? false;
  const searchHeight = dense ? 27 : 40;
  const extraheight = dense ? 39 : 49;
  const searchAddHeight = searchVisible ? searchHeight : 0;
  const minHeight = showToolbarWithTitle ? 49 + searchAddHeight + extraheight : 0;
  const headerHeight = 32;

  const onShowSearch = () => {
    const newValue = !showSearch;
    setShowSearch(newValue);
  };

  const onCtrlF = () => {
    if (search === 'toggle') {
      onShowSearch();
    } else {
      const input = searchContainer.current.querySelector('input');
      input?.focus();
    }
  };

  const getActionToolbarProps = (isDetached) => ({
    ...getListboxActionProps({
      isDetached: isPopover ? false : isDetached,
      showToolbar,
      containerRef,
      isLocked,
      listboxSelectionToolbarItems,
      selections,
      keyboard,
    }),
    autoConfirm,
  });

  const shouldAutoFocus = searchVisible && search === 'toggle';

  // Add a container padding for grid mode to harmonize with the grid item margins (should sum to 8px).
  const isGridMode = layoutOptions?.dataLayout === 'grid';
  let containerPadding;
  if (isGridMode) {
    containerPadding = layoutOptions.layoutOrder === 'row' ? '2px 4px' : '2px 6px 2px 4px';
  }

  const searchIconComp = constraints?.active ? (
    <SearchIcon title={translator.get('Listbox.Search')} size="large" style={{ fontSize: '12px', padding: '7px' }} />
  ) : (
    <IconButton
      onClick={onShowSearch}
      tabIndex={-1}
      title={translator.get('Listbox.Search')}
      size="large"
      disableRipple
      data-testid="search-toggle-btn"
    >
      <SearchIcon style={{ fontSize: '12px' }} />
    </IconButton>
  );

  const lockIconComp = selectDisabled() ? (
    <Lock size="large" style={{ fontSize: '12px', padding: '7px' }} />
  ) : (
    <IconButton title={translator.get('SelectionToolbar.ClickToUnlock')} tabIndex={-1} onClick={unlock} size="large">
      <Lock disableRipple style={{ fontSize: '12px' }} />
    </IconButton>
  );

  if (isInvalid) {
    renderedCallback?.();
  }

  return (
    <>
      {showDetachedToolbarOnly && <ActionsToolbar direction={direction} {...getActionToolbarProps(true)} />}
      <StyledGrid
        className="listbox-container"
        container
        tabIndex={keyboard.enabled ? -1 : undefined}
        direction="column"
        gap={0}
        containerPadding={containerPadding}
        style={{ height: '100%', minHeight: `${minHeight}px`, flexFlow: 'column nowrap' }}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleOnMouseEnter}
        onMouseLeave={handleOnMouseLeave}
        ref={(el) => {
          containerRef.current = el;
          containerRectRef(el);
        }}
        isGridMode={isGridMode}
        aria-label={keyboard.active ? translator.get('Listbox.ScreenReaderInstructions') : ''}
      >
        {showToolbarWithTitle && (
          <Grid
            item
            container
            minHeight={headerHeight}
            flexDirection={isRtl ? 'row-reverse' : 'row'}
            marginY={1}
            paddingLeft={`${headerPaddingLeft}px`}
            paddingRight={`${headerPaddingRight}px`}
            wrap="nowrap"
          >
            {showIcons && (
              <Grid item container alignItems="center" width={iconsWidth}>
                {isLocked ? lockIconComp : showSearchIcon && searchIconComp}
                {isDrillDown && (
                  <DrillDownIcon
                    tabIndex={-1}
                    title={translator.get('Listbox.DrillDown')}
                    size="large"
                    style={{ fontSize: '12px' }}
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
              {showTitle && (
                <Title variant="h6" noWrap ref={titleRef} title={layout.title}>
                  {layout.title}
                </Title>
              )}
            </Grid>
            <Grid item>
              <ActionsToolbar direction={direction} {...getActionToolbarProps(isToolbarDetached)} />
            </Grid>
          </Grid>
        )}
        <Grid
          item
          container
          direction="column"
          style={{ height: '100%', minHeight: '50px' }}
          role="region"
          aria-label={translator.get('Listbox.ResultFilterLabel')}
        >
          <Grid item ref={searchContainerRef}>
            <ListBoxSearch
              selections={selections}
              selectionState={selectionState}
              model={model}
              dense={dense}
              keyboard={keyboard}
              visible={searchVisible}
              search={search}
              autoFocus={shouldAutoFocus}
              wildCardSearch={wildCardSearch}
              searchEnabled={searchEnabled}
              direction={direction}
              hide={showSearchIcon && onShowSearch}
            />
          </Grid>
          <Grid item xs className={classes.listboxWrapper}>
            {isInvalid ? (
              <ListBoxError text={errorText} />
            ) : (
              <AutoSizer>
                {({ height, width }) => (
                  <ListBox
                    model={model}
                    app={app}
                    theme={theme}
                    constraints={constraints}
                    layout={layout}
                    selections={selections}
                    selectionState={selectionState}
                    direction={direction}
                    frequencyMode={frequencyMode}
                    rangeSelect={rangeSelect}
                    checkboxes={checkboxes}
                    height={height}
                    width={width}
                    update={update}
                    fetchStart={fetchStart}
                    postProcessPages={postProcessPages}
                    calculatePagesHeight={calculatePagesHeight}
                    selectDisabled={selectDisabled}
                    keyboard={keyboard}
                    showGray={showGray}
                    scrollState={scrollState}
                    keyScroll={{
                      state: keyScroll,
                      reset: () => setKeyScroll({ up: 0, down: 0, scrollPosition: '' }),
                    }}
                    currentScrollIndex={{
                      state: currentScrollIndex,
                      set: setCurrentScrollIndex,
                    }}
                    renderedCallback={renderedCallback}
                    onCtrlF={onCtrlF}
                    isModal={isModalMode}
                  />
                )}
              </AutoSizer>
            )}
          </Grid>
        </Grid>
      </StyledGrid>
    </>
  );
}

const ListBoxInlineMemoed = React.memo(ListBoxInline);

function IsolateUseLayoutWrapper({ options = {} }) {
  const { model } = options;
  const [layout] = useLayout(model);
  return <ListBoxInlineMemoed options={options} layout={layout} />;
}

export default IsolateUseLayoutWrapper;
