/* eslint no-underscore-dangle:0 */
import React, { useEffect, useState, useCallback, useRef, useContext, useMemo } from 'react';
import InfiniteLoader from 'react-window-infinite-loader';
import { styled } from '@mui/material';
import useSelectionsInteractions from './hooks/selections/useSelectionsInteractions';
import getListBoxComponents from './components/grid-list-components/grid-list-components';
import useListSizes from './assets/list-sizes';
import getHorizontalMinBatchSize from './assets/horizontal-minimum-batch-size';
import useItemsLoader from './hooks/useItemsLoader';
import useStaleLayout from './hooks/useStaleLayout';
import getListCount from './components/list-count';
import useDataStore from './hooks/useDataStore';
import ListBoxDisclaimer from './components/ListBoxDisclaimer';
import ListBoxFooter from './components/ListBoxFooter';
import getScrollIndex from './interactions/listbox-get-scroll-index';
import getFrequencyAllowed from './components/grid-list-components/frequency-allowed';
import useFrequencyMax from './hooks/useFrequencyMax';
import getScreenReaderAssertiveText from './components/screen-reader/assertive-screen-reader';
import InstanceContext from '../../contexts/InstanceContext';
import deduceFrequencyMode from './utils/deduce-frequency-mode';
import compactSelectedPages from './helpers/compact-selected-pages';

const DEFAULT_MIN_BATCH_SIZE = 100;

const StyledWrapper = styled('div')(() => ({
  [`& .screenReaderOnly`]: {
    position: 'absolute',
    height: 0,
    width: 0,
    overflow: 'hidden',
  },
}));

export default function ListBox({
  model,
  app,
  constraints,
  layout,
  selections,
  selectionState,
  direction,
  checkboxes: checkboxOption,
  height,
  width,
  frequencyMode,
  update = undefined,
  fetchStart = undefined,
  postProcessPages = undefined,
  calculatePagesHeight = false,
  keyboard = {},
  showGray = true,
  hideLastRowDivider = false,
  scrollState,
  keyScroll = { state: {}, reset: () => {} },
  currentScrollIndex = { set: () => {} },
  renderedCallback,
  onCtrlF,
  showSearch,
  isModal,
  styles,
  flags = {},
}) {
  const { translator: translatorDynamic } = useContext(InstanceContext);
  const [initScrollPosIsSet, setInitScrollPosIsSet] = useState(false);
  const isSingleSelect = !!(layout && layout.qListObject.qDimensionInfo.qIsOneAndOnlyOne);
  const { checkboxes = checkboxOption, histogram, selectionMode } = layout ?? {};
  // Keep legacy click behavior until VIZ-410 is enabled
  const resolvedSelectionMode = flags?.isEnabled?.('VIZ-410-SELECTION_BEHAVIOR_LISTBOXES') ? selectionMode : 'add';

  const loaderRef = useRef(null);
  const local = useRef({
    queue: [],
    validPages: false,
    dataOffset: 0,
  });

  const listData = useRef({
    pages: [],
  });

  // The time from scroll end until new data is being fetched, may be exposed in API later on.
  const scrollTimeout = 0;

  const { frequencyMax, awaitingFrequencyMax } = useFrequencyMax(app, layout);
  const dataWidth = 1 + (layout?.qListObject?.qExpressions?.length ?? 0);
  // eslint-disable-next-line no-unused-vars
  const { isLoadingData, ...itemsLoader } = useItemsLoader({
    local,
    loaderRef,
    model,
    fetchStart,
    scrollTimeout,
    postProcessPages,
    listData,
    dataWidth,
  });
  const { getStoreValue, setStoreValue } = useDataStore(model);
  const loadMoreItems = useCallback(itemsLoader.loadMoreItems, [layout]);

  const [overflowDisclaimer, setOverflowDisclaimer] = useState({ show: false, dismissed: false });
  const showOverflowDisclaimer = (show) => setOverflowDisclaimer((state) => ({ ...state, show }));

  const representation = layout?.representation;
  const isImageMode = representation?.type === 'image';
  const showSelected = representation?.showSelected ?? false;
  const staleLayout = useStaleLayout(layout);

  const [pages, setPages] = useState([]);
  const [selectedValuesPage, setSelectedValuesPage] = useState(null);
  // Own qSelected/qLocked count - matches SELECTED_STATES in compact-selected-pages.js.
  const selectedCount = (() => {
    const counts = staleLayout?.qListObject.qDimensionInfo.qStateCounts || {};
    return (counts.qSelected || 0) + (counts.qLocked || 0);
  })();
  // Frozen against staleLayout so compaction doesn't flicker on/off on every tick while picking.
  const hideActive = isImageMode && showSelected && selectedCount > 0;

  if (itemsLoader?.pages) {
    selectionState.update({
      setPages,
      pages: itemsLoader.pages,
      isSingleSelect,
      layout,
    });
  }

  const cardinal = layout?.qListObject.qDimensionInfo.qCardinal;

  if ((itemsLoader?.pages.length && !awaitingFrequencyMax) || cardinal === 0) {
    // All necessary data fetching done - signal rendering done!
    renderedCallback?.();
  }
  useEffect(() => {
    if (!hideActive) {
      setSelectedValuesPage(null);
      return undefined;
    }
    let cancelled = false;
    if (selectedCount === 0) {
      setSelectedValuesPage(null);
      return undefined;
    }
    (async () => {
      try {
        // Fetch a page with all selected/locked values (they sort to the top via qSortByState)
        const [page] = await model.getListObjectData('/qListObjectDef', [
          { qTop: 0, qLeft: 0, qWidth: dataWidth, qHeight: selectedCount },
        ]);
        if (!cancelled) {
          setSelectedValuesPage(page || null);
        }
      } catch (error) {
        if (!cancelled) {
          // Log non-cancellation errors; compaction will proceed with just loaded pages
          // eslint-disable-next-line no-console
          console.error('ListBox selected values fetch failed:', error);
          setSelectedValuesPage(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hideActive, selectedCount, staleLayout, dataWidth, model]);

  // Reset scroll offset when entering compacted mode to prevent misaligned indices.
  // The compacted page is rebased to qTop: 0, so all row indices start from 0.
  // If we kept the old dataOffset, rendering would add it to all indices and look past the page.
  useEffect(() => {
    if (hideActive) {
      local.current.dataOffset = 0;
    }
  }, [hideActive]);

  const renderPages = useMemo(() => {
    if (!hideActive) return pages;
    // Merge selected values page with loaded pages before compacting
    const pagesToCompact = selectedValuesPage ? [selectedValuesPage, ...pages] : pages;
    return compactSelectedPages(pagesToCompact, dataWidth);
  }, [hideActive, pages, selectedValuesPage, dataWidth]);
  const renderCount = hideActive ? renderPages[0].qMatrix.length : undefined;

  const isItemLoaded = useCallback(
    (index) => {
      if (!renderPages?.length || !local.current.validPages) {
        return false;
      }
      local.current.checkIdx = index;
      const isLoaded = (p) => p.qArea.qTop <= index && index < p.qArea.qTop + p.qArea.qHeight;
      const page = renderPages.filter((p) => isLoaded(p))[0];
      return page && isLoaded(page);
    },
    [layout, renderPages]
  );

  const { interactionEvents, select } = useSelectionsInteractions({
    selectionState,
    selections,
    checkboxes,
    selectionMode: resolvedSelectionMode,
    doc: document,
    loaderRef,
  });

  const { layoutOptions = {} } = layout || {};

  let isRow = true;
  if (layoutOptions.dataLayout) {
    isRow = layoutOptions.dataLayout === 'singleColumn' || isImageMode ? true : layoutOptions?.layoutOrder === 'row';
  }

  const isGrid = layoutOptions?.dataLayout === 'grid';

  const scrollToIndex = (index) => {
    const gridIndex = {
      ...(isRow ? { rowIndex: index } : { columnIndex: index }),
    };
    const scrollIndex = isGrid ? gridIndex : index;
    loaderRef.current._listRef.scrollToItem(scrollIndex);
  };

  const fetchData = () => {
    local.current.queue = [];
    local.current.validPages = false;
    if (loaderRef.current) {
      loaderRef.current.resetloadMoreItemsCache(true);
      const isScrollingToEnd = keyScroll.state.scrollPosition === 'overflowEnd';
      // Skip scrollToItem if we are in selections or if scrolling to the end.
      if ((layout && layout.qSelectionInfo.qInSelections) || isScrollingToEnd) {
        if (isScrollingToEnd) {
          keyScroll.reset();
        }
        return;
      }
      local.current.dataOffset = 0;
      scrollToIndex(0);
    }
  };

  if (update) {
    // Hand over the update function for manual refresh from hosting application.
    update.call(null, fetchData);
  }

  useEffect(() => {
    if (scrollState && !initScrollPosIsSet && loaderRef.current) {
      loaderRef.current._listRef.scrollToItem(scrollState.initScrollPos);
      setInitScrollPosIsSet(true);
    }
  }, [loaderRef.current]);

  useEffect(() => {
    fetchData();
  }, [layout, local.current.dataOffset]);

  let minimumBatchSize = DEFAULT_MIN_BATCH_SIZE;

  const isVertical = layoutOptions.dataLayout !== 'grid';

  const count = hideActive ? renderCount : layout?.qListObject.qSize?.qcy;

  const unlimitedListCount = hideActive
    ? renderCount
    : getListCount({
        pages,
        minimumBatchSize,
        count,
        calculatePagesHeight,
        layoutOptions,
        model,
      });

  let freqIsAllowed = getFrequencyAllowed({ itemWidth: width, layout, frequencyMode });
  const deducedFrequencyMode = deduceFrequencyMode(renderPages);
  const sizes = useListSizes({
    layout,
    width,
    height,
    listCount: unlimitedListCount,
    count,
    freqIsAllowed,
    checkboxes,
    styles,
  });
  if (sizes.columnWidth) {
    // In grid mode, where we have a dynamic item width, get a second opinion on showing/hiding frequency.
    freqIsAllowed = getFrequencyAllowed({ itemWidth: sizes.columnWidth, layout, frequencyMode });
  }

  const { listCount } = sizes;
  setStoreValue('listCount', listCount);

  const searchInputText = getStoreValue('inputText');
  const screenReaderText = getScreenReaderAssertiveText({ layout, searchInputText, listCount });

  const setScrollPosition = (position) => {
    const { scrollIndex, offset, triggerRerender } = getScrollIndex({
      position,
      isRow,
      sizes,
      layout,
      offset: local.current.dataOffset,
    });
    local.current.dataOffset = offset;
    if (triggerRerender) {
      selectionState.triggerStateChanged();
    }
    scrollToIndex(scrollIndex);
  };

  useEffect(() => {
    const s = keyScroll.state;
    if (s.up) {
      scrollToIndex(currentScrollIndex.state.start - s.up);
    } else if (s.down) {
      scrollToIndex(currentScrollIndex.state.stop + s.down);
    } else if (s.scrollPosition) {
      setScrollPosition(s.scrollPosition);
    }
    if (s.scrollPosition === 'overflowEnd') {
      return; // Do keyScroll.reset() in fetchData() to avoid scrolling to top.
    }
    keyScroll.reset();
  }, [keyScroll.state.up, keyScroll.state.down, keyScroll.state.scrollPosition]);

  const { textAlign } = layout?.qListObject.qDimensionInfo || {};

  const [focusListItem, setFocusListItem] = useState({ first: false, last: false });
  const getFocusState = () => ({
    first: focusListItem.first,
    setFirst: (first) => setFocusListItem((prevState) => ({ ...prevState, first })),
    last: focusListItem.last,
    setLast: (last) => setFocusListItem((prevState) => ({ ...prevState, last })),
  });

  const selectAll = () => {
    selectionState.clearItemStates(false);
    model.selectListObjectAll('/qListObjectDef');
  };

  const { List, Grid } = getListBoxComponents({
    direction,
    layout,
    height,
    width,
    checkboxes,
    deducedFrequencyMode,
    histogram,
    keyboard,
    showGray,
    hideLastRowDivider,
    interactionEvents,
    select,
    selectAll,
    onCtrlF,
    textAlign,
    isVertical,
    pages: renderPages,
    selectionState,
    isSingleSelect,
    selections,
    scrollState,
    local,
    sizes,
    listCount,
    overflowDisclaimer: { state: overflowDisclaimer, set: showOverflowDisclaimer },
    setScrollPosition,
    focusListItems: getFocusState(),
    setCurrentScrollIndex: currentScrollIndex.set,
    constraints,
    frequencyMax,
    freqIsAllowed,
    translator: translatorDynamic,
    showSearch,
    isModal,
    styles,
    flags,
  });

  const { columnWidth, listHeight, itemHeight } = sizes || {};
  if (!isVertical) {
    minimumBatchSize = getHorizontalMinBatchSize({ width, columnWidth, listHeight, itemHeight });
  }

  return (
    <StyledWrapper>
      <div className="screenReaderOnly" aria-live="assertive" aria-atomic="true">
        {screenReaderText}
      </div>
      {!listCount && cardinal > 0 && <ListBoxDisclaimer width={width} text="Listbox.NoMatchesForYourTerms" />}
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={listCount || 1} // must be more than 0 or loadMoreItems will never be called again
        loadMoreItems={loadMoreItems.with({ minimumBatchSize })}
        threshold={0}
        minimumBatchSize={minimumBatchSize}
        ref={loaderRef}
        role="grid"
      >
        {isVertical ? List : Grid}
      </InfiniteLoader>
      {overflowDisclaimer.show && !overflowDisclaimer.dismissed && (
        <ListBoxFooter
          text="Listbox.ItemsOverflow"
          dismiss={() => setOverflowDisclaimer((state) => ({ ...state, dismissed: true }))}
          parentWidth={loaderRef?.current?._listRef?.props?.width}
          dense={layoutOptions?.dense}
        />
      )}
    </StyledWrapper>
  );
}
