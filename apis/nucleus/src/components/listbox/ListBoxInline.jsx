import React, { useContext, useCallback, useRef, useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import AutoSizer from 'react-virtualized-auto-sizer';
import Lock from '@nebula.js/ui/icons/lock';
import { IconButton, Grid, Typography } from '@mui/material';
import { useTheme } from '@nebula.js/ui/theme';
import SearchIcon from '@nebula.js/ui/icons/search';
import useLayout from '../../hooks/useLayout';
import ListBox from './ListBox';
import createListboxSelectionToolbar from './interactions/listbox-selection-toolbar';
import ActionsToolbar from '../ActionsToolbar';
import InstanceContext from '../../contexts/InstanceContext';
import ListBoxSearch from './components/ListBoxSearch';
import { getListboxInlineKeyboardNavigation } from './interactions/listbox-keyboard-navigation';
import addListboxTheme from './assets/addListboxTheme';

const PREFIX = 'ListBoxInline';

const classes = {
  listBoxHeader: `${PREFIX}-listBoxHeader`,
  screenReaderOnly: `${PREFIX}-screenReaderOnly`,
};

const StyledGrid = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.listBox?.backgroundColor ?? theme.palette.background.default,
  [`& .${classes.listBoxHeader}`]: {
    alignSelf: 'center',
    display: 'inline-flex',
  },
  [`& .${classes.screenReaderOnly}`]: {
    position: 'absolute',
    height: 0,
    width: 0,
    overflow: 'hidden',
  },
}));

const Title = styled(Typography)(({ theme }) => ({
  color: theme.listBox?.title?.main?.color,
  fontSize: theme.listBox?.title?.main?.fontSize,
  fontFamily: theme.listBox?.title?.main?.fontFamily,
}));

export default function ListBoxInline({ options = {} }) {
  const {
    direction,
    frequencyMode,
    listLayout,
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

  const moreAlignTo = useRef();
  const [searchContainer, searchContainerRef] = useRefWithCallback();

  const [layout] = useLayout(model);
  const [showToolbar, setShowToolbar] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [keyboardActive, setKeyboardActive] = useState(false);

  const handleKeyDown = getListboxInlineKeyboardNavigation({ setKeyboardActive });

  // Expose the keyboard flags in the same way as the keyboard hook does.
  const keyboard = {
    enabled: keyboardNavigation, // this will be static until we can access the useKeyboard hook
    active: keyboardActive,
  };

  if (layout?.toolbar !== undefined) {
    toolbar = layout.toolbar;
  }

  useEffect(() => {
    const show = () => {
      setShowToolbar(true);
      if (search === 'inSelection') {
        setShowSearch(true);
      }
    };
    const hide = () => {
      setShowToolbar(false);
      if (search === 'toggle' || search === 'inSelection') {
        setShowSearch(false);
      }
    };
    if (selections) {
      if (!selections.isModal()) {
        selections.on('deactivated', hide);
        selections.on('activated', show);
      }
      setShowToolbar(selections.isActive());
    }
    return () => {
      if (selections && selections.removeListener) {
        selections.removeListener('deactivated', show);
        selections.removeListener('activated', hide);
      }
    };
  }, [selections]);

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

  const listboxSelectionToolbarItems = toolbar
    ? createListboxSelectionToolbar({
        layout,
        model,
        translator,
      })
    : [];

  const showTitle = true;

  const searchVisible =
    (search === true || ((search === 'toggle' || search === 'inSelection') && showSearch)) && !selectDisabled();
  const dense = layout.layoutOptions?.dense ?? false;
  const searchHeight = dense ? 27 : 40;
  const extraheight = dense ? 39 : 49;
  const minHeight = 49 + (searchVisible ? searchHeight : 0) + extraheight;
  const { wildCardSearch, searchEnabled } = layout;

  const onShowSearch = () => {
    const newValue = !showSearch;
    setShowSearch(newValue);
  };

  const hideSearch = searchEnabled !== false && constraints.passive && constraints.active && !constraints.select;

  return (
    <StyledGrid
      className="listbox-container"
      container
      tabIndex={keyboard.enabled && !keyboard.active ? 0 : -1}
      direction="column"
      gap={0}
      style={{ height: '100%', minHeight: `${minHeight}px`, flexFlow: 'column nowrap' }}
      onKeyDown={handleKeyDown}
    >
      {toolbar && layout.title && (
        <Grid item container style={{ padding: theme.spacing(1) }}>
          <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
            {isLocked ? (
              <IconButton tabIndex={-1} onClick={unlock} disabled={!isLocked} size="large">
                <Lock title={translator.get('Listbox.Unlock')} style={{ fontSize: '12px' }} />
              </IconButton>
            ) : (
              !hideSearch && (
                <IconButton onClick={onShowSearch} tabIndex={-1} title={translator.get('Listbox.Search')} size="large">
                  <SearchIcon style={{ fontSize: '12px' }} />
                </IconButton>
              )
            )}
          </Grid>
          <Grid item className={classes.listBoxHeader}>
            {showTitle && (
              <Title variant="h6" noWrap>
                {layout.title}
              </Title>
            )}
          </Grid>
          <Grid item xs />
          <Grid item>
            <ActionsToolbar
              more={{
                enabled: !isLocked,
                actions: listboxSelectionToolbarItems,
                alignTo: moreAlignTo,
                popoverProps: {
                  elevation: 0,
                },
                popoverPaperStyle: {
                  boxShadow: '0 12px 8px -8px rgba(0, 0, 0, 0.2)',
                  minWidth: '250px',
                },
              }}
              selections={{
                show: showToolbar,
                api: selections,
                onConfirm: () => {},
                onCancel: () => {},
              }}
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
            model={model}
            dense={dense}
            keyboard={keyboard}
            visible={searchVisible}
            searchContainerRef={searchContainerRef}
            wildCardSearch={wildCardSearch}
            searchEnabled={searchEnabled}
          />
        </Grid>
        <Grid item xs>
          <div ref={moreAlignTo} />
          <div className={classes.screenReaderOnly}>{translator.get('Listbox.ScreenReaderInstructions')}</div>
          <AutoSizer>
            {({ height, width }) => (
              <ListBox
                model={model}
                selections={selections}
                direction={direction}
                listLayout={listLayout}
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
              />
            )}
          </AutoSizer>
        </Grid>
      </Grid>
    </StyledGrid>
  );
}
