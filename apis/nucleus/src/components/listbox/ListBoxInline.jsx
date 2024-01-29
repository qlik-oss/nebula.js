/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Grid } from '@mui/material';
import { useTheme } from '@nebula.js/ui/theme';
import useLayout from '../../hooks/useLayout';
import ListBox from './ListBox';
import InstanceContext from '../../contexts/InstanceContext';
import ListBoxSearch from './components/ListBoxSearch';
import getListboxContainerKeyboardNavigation from './interactions/keyboard-navigation/keyboard-nav-container';
import getStyles from './assets/styling';
import useAppSelections from '../../hooks/useAppSelections';
import createSelectionState from './hooks/selections/selectionState';
import { DENSE_ROW_HEIGHT, SCROLL_BAR_WIDTH } from './constants';
import useTempKeyboard from './components/useTempKeyboard';
import ListBoxError from './components/ListBoxError';
import useRect from '../../hooks/useRect';
import isDirectQueryEnabled from './utils/is-direct-query';
import getContainerPadding from './assets/list-sizes/container-padding';
import ListBoxHeader from './ListBoxHeader';

const PREFIX = 'ListBoxInline';
const classes = {
  listBoxHeader: `${PREFIX}-listBoxHeader`,
  screenReaderOnly: `${PREFIX}-screenReaderOnly`,
  listboxWrapper: `${PREFIX}-listboxWrapper`,
};

const StyledGrid = styled(Grid, {
  shouldForwardProp: (p) => !['containerPadding', 'isGridMode', 'styles'].includes(p),
})(({ theme, containerPadding, isGridMode, styles }) => ({
  ...styles.background, // sets background color and image of listbox
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
}));

const isModal = ({ app, appSelections }) => app.isInModalSelection?.() ?? appSelections.isInModal();

function ListBoxInline({ options, layout }) {
  const {
    app,
    direction,
    frequencyMode,
    checkboxes: checkboxesOption,
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
    showLock = false,
    components,
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

  const { translator, keyboardNavigation, themeApi, constraints } = useContext(InstanceContext);

  const { checkboxes = checkboxesOption } = layout || {};
  const styles = getStyles({ app, themeApi, theme, components, checkboxes });

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
  const [selectionState] = useState(() => createSelectionState());
  const keyboard = useTempKeyboard({ containerRef, enabled: keyboardNavigation });
  const isModalMode = useCallback(() => isModal({ app, appSelections }), [app, appSelections]);
  const isInvalid = layout?.qListObject.qDimensionInfo.qError;
  const errorText = isInvalid && constraints.active ? 'Visualization.Invalid.Dimension' : 'Visualization.Incomplete';

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

  useEffect(() => {
    document.addEventListener('keydown', globalKeyDown);
    return () => {
      document.removeEventListener('keydown', globalKeyDown);
    };
  }, [globalKeyDown]);

  useEffect(() => {
    if (search === true) {
      setShowSearch(true);
    }
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
      // When isPopover toolbar == false will be ignored.
      if (!selections.isActive()) {
        selections.begin('/qListObjectDef');
        selections.on('activated', show);
        selections.on('deactivated', hide);
      }
      setShowToolbar(isPopover);
    }
    if (toolbar && selections) {
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
  }, [toolbar, selections, isPopover]);

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
  const isLocked = layout?.qListObject?.qDimensionInfo?.qLocked;
  const showSearchIcon = searchEnabled !== false && search === 'toggle' && !isLocked;
  const isDrillDown = layout?.qListObject?.qDimensionInfo?.qGrouping === 'H';

  const canShowTitle = layout?.title?.length && layout?.showTitle !== false;
  const showDetachedToolbarOnly = toolbar && !canShowTitle && !isPopover;
  const showAttachedToolbar = (toolbar && canShowTitle) || isPopover;

  const isRtl = direction === 'rtl';

  if (!model || !layout || !translator) {
    return null;
  }

  const showSearchToggle = search === 'toggle' && showSearch;
  const searchVisible = search === true || (showSearchToggle && !selectDisabled() && searchEnabled !== false);
  const dense = layoutOptions.dense ?? false;

  const handleShowSearch = () => {
    const newValue = !showSearch;
    setShowSearch(newValue);
  };

  const onCtrlF = () => {
    if (search === 'toggle') {
      handleShowSearch();
    } else {
      const input = searchContainer.current.querySelector('input');
      input?.focus();
    }
  };

  const shouldAutoFocus = searchVisible && search === 'toggle';

  // Add a container padding for grid mode to harmonize with the grid item margins (should sum to 8px).
  const isGridMode = layoutOptions?.dataLayout === 'grid';

  const containerPadding = getContainerPadding({
    isGridMode,
    dense,
    height: containerRef.current?.clientHeight,
    layoutOrder: layoutOptions.layoutOrder,
  });

  if (isInvalid) {
    renderedCallback?.();
  }

  const listBoxMinHeight = showAttachedToolbar ? DENSE_ROW_HEIGHT + SCROLL_BAR_WIDTH : 0;

  const listBoxHeader = (
    <ListBoxHeader
      direction={direction}
      selectDisabled={selectDisabled}
      showSearchIcon={showSearchIcon}
      isDrillDown={isDrillDown}
      onShowSearch={handleShowSearch}
      isPopover={isPopover}
      showToolbar={showToolbar}
      isDirectQuery={isDirectQuery}
      autoConfirm={autoConfirm}
      showDetachedToolbarOnly={showDetachedToolbarOnly}
      layout={layout}
      translator={translator}
      styles={styles}
      isRtl={isRtl}
      showLock={showLock}
      constraints={constraints}
      classes={classes}
      containerRect={containerRect}
      containerRef={containerRef}
      model={model}
      selectionState={selectionState}
      selections={selections}
      keyboard={keyboard}
    />
  );

  return (
    <>
      {showDetachedToolbarOnly && listBoxHeader}
      <StyledGrid
        className="listbox-container"
        container
        tabIndex={keyboard.enabled ? -1 : undefined}
        direction="column"
        gap={0}
        containerPadding={containerPadding}
        styles={styles}
        style={{ height: '100%', flexFlow: 'column nowrap' }}
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
        {showAttachedToolbar && listBoxHeader}
        <Grid
          item
          container
          direction="column"
          height="100%"
          minHeight={listBoxMinHeight}
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
              hide={showSearchIcon && handleShowSearch}
              styles={styles}
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
                    styles={styles}
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
