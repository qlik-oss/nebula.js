import React, { useContext, useCallback, useRef, useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import AutoSizer from 'react-virtualized-auto-sizer';

import Lock from '@nebula.js/ui/icons/lock';
import Unlock from '@nebula.js/ui/icons/unlock';

import { IconButton, Grid, Typography } from '@mui/material';
import { useTheme } from '@nebula.js/ui/theme';
import SearchIcon from '@nebula.js/ui/icons/search';
import useSessionModel from '../../hooks/useSessionModel';
import useLayout from '../../hooks/useLayout';

import ListBox from './ListBox';
import createListboxSelectionToolbar from './listbox-selection-toolbar';

import ActionsToolbar from '../ActionsToolbar';

import InstanceContext from '../../contexts/InstanceContext';

import ListBoxSearch from './ListBoxSearch';
import useObjectSelections from '../../hooks/useObjectSelections';
import { getListboxInlineKeyboardNavigation } from './listbox-keyboard-navigation';
import useConfirmUnfocus from './useConfirmUnfocus';

const PREFIX = 'ListBoxInline';

const classes = {
  listBoxHeader: `${PREFIX}-listBoxHeader`,
};

const StyledGrid = styled(Grid)(() => ({
  [`& .${classes.listBoxHeader}`]: {
    alignSelf: 'center',
    display: 'inline-flex',
  },
}));

export default function ListBoxInline({ app, fieldIdentifier, stateName = '$', options = {}, fieldDef }) {
  const {
    title,
    direction,
    listLayout,
    search = true,
    focusSearch = false,
    toolbar = true,
    rangeSelect = true,
    checkboxes = false,
    properties = {},
    sessionModel = undefined,
    selectionsApi = undefined,
    update = undefined,
    fetchStart = undefined,
    dense = false,
    selectDisabled = () => false,
    postProcessPages = undefined,
    calculatePagesHeight,
    showGray = true,
    sortByState = 1,
    scrollState = undefined,
    setCount = undefined,
    shouldConfirmOnBlur = undefined,
  } = options;
  let { frequencyMode, histogram = false } = options;

  if (fieldDef && fieldDef.failedToFetchFieldDef) {
    histogram = false;
    frequencyMode = 'N';
  }

  switch (true) {
    case ['none', 'N', 'NX_FREQUENCY_NONE'].includes(frequencyMode):
      frequencyMode = 'N';
      break;
    case ['value', 'V', 'NX_FREQUENCY_VALUE', 'default'].includes(frequencyMode):
      frequencyMode = 'V';
      break;
    case ['percent', 'P', 'NX_FREQUENCY_PERCENT'].includes(frequencyMode):
      frequencyMode = 'P';
      break;
    case ['relative', 'R', 'NX_FREQUENCY_RELATIVE'].includes(frequencyMode):
      frequencyMode = 'R';
      break;
    default:
      frequencyMode = 'N';
      break;
  }

  const getListdefFrequencyMode = () => (histogram && frequencyMode === 'N' ? 'V' : frequencyMode);

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

  const listdef = {
    qInfo: {
      qType: 'njsListbox',
    },
    qListObjectDef: {
      qStateName: stateName,
      qShowAlternatives: true,
      qFrequencyMode: getListdefFrequencyMode(),
      qInitialDataFetch: [
        {
          qTop: 0,
          qLeft: 0,
          qWidth: 0,
          qHeight: 0,
        },
      ],
      qDef: {
        qSortCriterias: [
          {
            qSortByState: sortByState,
            qSortByAscii: 1,
            qSortByNumeric: 1,
            qSortByLoadOrder: 1,
          },
        ],
      },
    },
    title,
    ...properties,
  };

  // Something something lib dimension
  let fieldName;
  if (fieldIdentifier.qLibraryId) {
    listdef.qListObjectDef.qLibraryId = fieldIdentifier.qLibraryId;
    fieldName = fieldIdentifier.qLibraryId;
  } else {
    listdef.qListObjectDef.qDef.qFieldDefs = [fieldIdentifier];
    fieldName = fieldIdentifier;
  }

  if (frequencyMode !== 'N' || histogram) {
    const field = fieldIdentifier.qLibraryId ? fieldDef : fieldName;
    listdef.frequencyMax = {
      qValueExpression: `Max(AGGR(Count([${field}]), [${field}]))`,
    };
  }

  let [model] = useSessionModel(listdef, sessionModel ? null : app, fieldName, stateName);
  if (sessionModel) {
    model = sessionModel;
  }

  let selections = useObjectSelections(selectionsApi ? {} : app, model)[0];
  if (selectionsApi) {
    selections = selectionsApi;
  }

  const theme = useTheme();

  const lock = useCallback(() => {
    model.lock('/qListObjectDef');
  }, [model]);

  const unlock = useCallback(() => {
    model.unlock('/qListObjectDef');
  }, [model]);

  const { translator, keyboardNavigation } = useContext(InstanceContext);
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

  useEffect(() => {
    const show = () => setShowToolbar(true);
    const hide = () => setShowToolbar(false);
    if (selections) {
      if (!selections.isModal(model)) {
        selections.on('deactivated', hide);
        selections.on('activated', show);
      }
    }
    return () => {
      if (selections) {
        selections.removeListener('deactivated', show);
        selections.removeListener('activated', hide);
      }
    };
  }, [selections]);

  useEffect(() => {
    if (selections) {
      setShowToolbar(selections.isActive());
    }
  }, [selections]);

  const listBoxRef = useRef(null);
  useConfirmUnfocus(listBoxRef, selections, shouldConfirmOnBlur);

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

  const counts = layout.qListObject.qDimensionInfo.qStateCounts;

  const hasSelections = counts.qSelected + counts.qSelectedExcluded + counts.qLocked + counts.qLockedExcluded > 0;

  const showTitle = true;

  const searchVisible = (search === true || (search === 'toggle' && showSearch)) && !selectDisabled();
  const searchHeight = dense ? 27 : 40;
  const extraheight = dense ? 39 : 49;
  const minHeight = 49 + (searchVisible ? searchHeight : 0) + extraheight;

  const onShowSearch = () => {
    const newValue = !showSearch;
    setShowSearch(newValue);
  };

  const getSearchOrUnlock = () =>
    search === 'toggle' && !hasSelections ? (
      <IconButton onClick={onShowSearch} tabIndex={-1} title={translator.get('Listbox.Search')} size="large">
        <SearchIcon />
      </IconButton>
    ) : (
      <IconButton onClick={lock} tabIndex={-1} disabled={!hasSelections} size="large">
        <Unlock />
      </IconButton>
    );

  return (
    <StyledGrid
      container
      tabIndex={keyboard.enabled && !keyboard.active ? 0 : -1}
      direction="column"
      gap={0}
      style={{ height: '100%', minHeight: `${minHeight}px` }}
      onKeyDown={handleKeyDown}
      ref={listBoxRef}
    >
      {toolbar && (
        <Grid item container style={{ padding: theme.spacing(1) }}>
          <Grid item>
            {isLocked ? (
              <IconButton tabIndex={-1} onClick={unlock} disabled={!isLocked} size="large">
                <Lock title={translator.get('Listbox.Unlock')} />
              </IconButton>
            ) : (
              getSearchOrUnlock()
            )}
          </Grid>
          <Grid item className={classes.listBoxHeader}>
            {showTitle && (
              <Typography variant="h6" noWrap>
                {layout.title || layout.qListObject.qDimensionInfo.qFallbackTitle}
              </Typography>
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
      <Grid item ref={searchContainerRef}>
        <ListBoxSearch model={model} dense={dense} keyboard={keyboard} visible={searchVisible} />
      </Grid>
      <Grid item xs>
        <div ref={moreAlignTo} />
        <AutoSizer>
          {({ height, width }) => (
            <ListBox
              model={model}
              selections={selections}
              direction={direction}
              listLayout={listLayout}
              frequencyMode={frequencyMode}
              histogram={histogram}
              rangeSelect={rangeSelect}
              checkboxes={checkboxes}
              height={height}
              width={width}
              update={update}
              fetchStart={fetchStart}
              postProcessPages={postProcessPages}
              calculatePagesHeight={calculatePagesHeight}
              dense={dense}
              selectDisabled={selectDisabled}
              keyboard={keyboard}
              showGray={showGray}
              scrollState={scrollState}
              sortByState={sortByState}
              setCount={setCount}
            />
          )}
        </AutoSizer>
      </Grid>
    </StyledGrid>
  );
}
