/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useCallback, useRef, useEffect, useState } from 'react';
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
import EditableTitle from './components/EditableTitle';
import { getListboxInlineKeyboardNavigation } from './interactions/listbox-keyboard-navigation';
import addListboxTheme from './assets/addListboxTheme';
import useAppSelections from '../../hooks/useAppSelections';
import showToolbarDetached from './interactions/listbox-show-toolbar-detached';
import getListboxActionProps from './interactions/listbox-get-action-props';
import createSelectionState from './hooks/selections/selectionState';
import { CELL_PADDING_LEFT, ICON_WIDTH, ICON_PADDING, BUTTON_ICON_WIDTH } from './constants';

const PREFIX = 'ListBoxInline';
const classes = {
  listBoxHeader: `${PREFIX}-listBoxHeader`,
  screenReaderOnly: `${PREFIX}-screenReaderOnly`,
  listboxWrapper: `${PREFIX}-listboxWrapper`,
};

const StyledGrid = styled(Grid, { shouldForwardProp: (p) => !['containerPadding'].includes(p) })(
  ({ theme, containerPadding }) => ({
    backgroundColor: theme.listBox?.backgroundColor ?? theme.palette.background.default,
    [`& .${classes.listBoxHeader}`]: {
      alignSelf: 'center',
      display: 'flex',
      width: `calc(100% - ${BUTTON_ICON_WIDTH}px)`,
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
    '&:focus-visible': {
      outline: 'none',
    },
  })
);

const Title = styled(Typography)(({ theme }) => ({
  color: theme.listBox?.title?.main?.color,
  fontSize: theme.listBox?.title?.main?.fontSize,
  fontFamily: theme.listBox?.title?.main?.fontFamily,
}));

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
  } = options;
  let { toolbar = true } = options;

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

  const containerRef = useRef();
  const [searchContainer, searchContainerRef] = useRefWithCallback();

  const [showToolbar, setShowToolbar] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [keyboardActive, setKeyboardActive] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [keyScroll, setKeyScroll] = useState({ down: 0, up: 0, scrollPosition: '' });
  const updateKeyScroll = (newState) => setKeyScroll((current) => ({ ...current, ...newState }));
  const [currentScrollIndex, setCurrentScrollIndex] = useState({ start: 0, stop: 0 });
  const [appSelections] = useAppSelections(app);
  const titleRef = useRef(null);
  const [selectionState] = useState(() => createSelectionState());

  const { handleKeyDown, handleOnMouseEnter, handleOnMouseLeave } = getListboxInlineKeyboardNavigation({
    setKeyboardActive,
    hovering,
    setHovering,
    updateKeyScroll,
    containerRef,
    currentScrollIndex,
    app,
    appSelections,
    constraints,
  });

  // Expose the keyboard flags in the same way as the keyboard hook does.
  const keyboard = {
    enabled: keyboardNavigation, // this will be static until we can access the useKeyboard hook
    active: keyboardActive,
  };

  if (layout?.toolbar !== undefined) {
    toolbar = layout.toolbar;
  }
  const toolbarDetachedOnly = toolbar && layout?.title === '';
  toolbar = toolbar && layout?.title !== '';

  useEffect(() => {
    const show = () => {
      setShowToolbar(true);
      if (search === 'toggle' && toolbar === false) {
        setShowSearch(true);
      }
    };
    const hide = () => {
      setShowToolbar(false);
      if (search === 'toggle') {
        setShowSearch(false);
      }
    };
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
  }, [selections, toolbar]);

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

  if (!model || !layout || !translator) {
    return null;
  }

  const isLocked = layout.qListObject.qDimensionInfo.qLocked === true;
  const isRtl = direction === 'rtl';
  const isDrillDown = layout.qListObject.qDimensionInfo.qGrouping === 'H';
  const listboxSelectionToolbarItems = createListboxSelectionToolbar({
    layout,
    model,
    translator,
    selectionState,
  });

  const showTitle = true;
  const showSearchToggle = search === 'toggle' && showSearch;
  const searchVisible = (search === true || showSearchToggle) && !selectDisabled();
  const { layoutOptions = {} } = layout;
  const dense = layoutOptions.dense ?? false;
  const searchHeight = dense ? 27 : 40;
  const extraheight = dense ? 39 : 49;
  const minHeight = 49 + (searchVisible ? searchHeight : 0) + extraheight;
  const headerHeight = 32;
  const { wildCardSearch, searchEnabled } = layout;

  const onShowSearch = () => {
    const newValue = !showSearch;
    setShowSearch(newValue);
  };

  const getActionToolbarProps = (isPopover) =>
    getListboxActionProps({
      isPopover,
      showToolbar,
      containerRef,
      isLocked,
      listboxSelectionToolbarItems,
      selections,
    });

  const shouldAutoFocus = searchVisible && search === 'toggle';
  const showSearchIcon = searchEnabled !== false && search === 'toggle' && !constraints?.active;
  const showSearchOrLockIcon = isLocked || showSearchIcon;
  const showIcons = showSearchOrLockIcon || isDrillDown;
  const iconsWidth = (showSearchOrLockIcon ? BUTTON_ICON_WIDTH : 0) + (isDrillDown ? ICON_WIDTH + ICON_PADDING : 0); // Drill-down icon needs padding right so there is space between the icon and the title
  const headerPaddingLeft = CELL_PADDING_LEFT - (showSearchOrLockIcon ? ICON_PADDING : 0);
  const headerPaddingRight = isRtl ? CELL_PADDING_LEFT - (showIcons ? ICON_PADDING : 0) : 0;

  // Add a container padding for grid mode to harmonize with the grid item margins (should sum to 8px).
  const isGridMode = layoutOptions?.dataLayout === 'grid';
  let containerPadding;
  if (isGridMode) {
    containerPadding = layoutOptions.layoutOrder === 'row' ? '2px 4px' : '2px 6px 2px 4px';
  }

  const TitleComponent = constraints?.active ? (
    <EditableTitle layout={layout} model={model} />
  ) : (
    <Title variant="h6" noWrap ref={titleRef} title={layout.title}>
      {layout.title}
    </Title>
  );
  return (
    <>
      {toolbarDetachedOnly && <ActionsToolbar direction={direction} {...getActionToolbarProps(true)} />}
      <StyledGrid
        className="listbox-container"
        container
        tabIndex={keyboard.enabled && !keyboard.active ? 0 : -1}
        direction="column"
        gap={0}
        containerPadding={containerPadding}
        style={{ height: '100%', minHeight: `${minHeight}px`, flexFlow: 'column nowrap' }}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleOnMouseEnter}
        onMouseLeave={handleOnMouseLeave}
        ref={containerRef}
      >
        {toolbar && (
          <Grid
            item
            container
            style={{
              padding: theme.spacing(1),
              paddingLeft: `${headerPaddingLeft}px`,
              paddingRight: `${headerPaddingRight}px`,
            }}
            sx={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}
            wrap="nowrap"
          >
            <Grid
              item
              container
              height={headerHeight}
              sx={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}
              wrap="nowrap"
            >
              {showIcons && (
                <Grid item sx={{ display: 'flex', alignItems: 'center', width: iconsWidth }}>
                  {isLocked ? (
                    <IconButton tabIndex={-1} onClick={unlock} disabled={selectDisabled()} size="large">
                      <Lock title={translator.get('Listbox.Unlock')} disableRipple style={{ fontSize: '12px' }} />
                    </IconButton>
                  ) : (
                    showSearchIcon && (
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
                    )
                  )}
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
              <Grid item sx={{ justifyContent: isRtl ? 'flex-end' : 'flex-start' }} className={classes.listBoxHeader}>
                {showTitle && TitleComponent}
              </Grid>
            </Grid>
            <Grid item xs />
            <Grid item>
              <ActionsToolbar
                direction={direction}
                {...getActionToolbarProps(showToolbarDetached({ containerRef, titleRef, iconsWidth }))}
              />
            </Grid>
          </Grid>
        )}
        <Grid
          item
          container
          direction="column"
          style={{ height: '100%', minHeight: `${minHeight}px` }}
          role="region"
          aria-label={translator.get('Listbox.ResultFilterLabel')}
        >
          <Grid item ref={searchContainerRef}>
            <div className={classes.screenReaderOnly}>{translator.get('Listbox.Search.ScreenReaderInstructions')}</div>
            <ListBoxSearch
              selections={selections}
              selectionState={selectionState}
              model={model}
              dense={dense}
              keyboard={keyboard}
              visible={searchVisible}
              search={search}
              autoFocus={shouldAutoFocus}
              searchContainerRef={searchContainerRef}
              wildCardSearch={wildCardSearch}
              searchEnabled={searchEnabled}
              direction={direction}
            />
          </Grid>
          <Grid item xs className={classes.listboxWrapper}>
            <div className={classes.screenReaderOnly}>{translator.get('Listbox.ScreenReaderInstructions')}</div>
            <AutoSizer>
              {({ height, width }) => (
                <ListBox
                  model={model}
                  app={app}
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
                />
              )}
            </AutoSizer>
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
