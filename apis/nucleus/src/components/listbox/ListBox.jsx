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
import { getListExprIndex, cacheExprValue } from './helpers/expr-cache';
import hasSelections from './assets/has-selections';

const DEFAULT_MIN_BATCH_SIZE = 100;
// Cap on the one-time per-value expression cache warm-up (see the effect below) - a field with a
// higher cardinality than this falls back to the incidental, render-driven cache population only.
const EXPR_CACHE_WARMUP_LIMIT = 2000;
// Engine caps a single qDataPage request at 10,000 cells; page the warm-up fetch to stay under it.
const EXPR_CACHE_WARMUP_CELL_LIMIT = 10000;

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
  scrollState,
  keyScroll = { state: {}, reset: () => {} },
  currentScrollIndex = { set: () => {} },
  renderedCallback,
  onCtrlF,
  showSearch,
  isModal,
  styles,
}) {
  const { translator: translatorDynamic } = useContext(InstanceContext);
  const [initScrollPosIsSet, setInitScrollPosIsSet] = useState(false);
  const [exprCacheReady, setExprCacheReady] = useState(false);
  const isSingleSelect = !!(layout && layout.qListObject.qDimensionInfo.qIsOneAndOnlyOne);
  const { checkboxes = checkboxOption, histogram } = layout ?? {};

  const loaderRef = useRef(null);
  const local = useRef({
    queue: [],
    validPages: false,
    dataOffset: 0,
  });

  const listData = useRef({
    pages: [],
  });

  // Per-value expression cache, keyed by expression qLabel -> dimension value's qElemNumber-> last-known value.
  const exprCache = useRef({});
  const dimensionFieldKey = JSON.stringify(layout?.qListObject?.qDimensionInfo?.qGroupFieldDefs);
  const exprLabelsKey = JSON.stringify(layout?.qListObject?.qExpressions);
  const cacheKey = `${dimensionFieldKey}|${exprLabelsKey}`;
  const prevCacheKey = useRef(cacheKey);
  if (prevCacheKey.current !== cacheKey) {
    prevCacheKey.current = cacheKey;
    exprCache.current = {};
  }

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
  // Frozen against staleLayout so compaction doesn't flicker on/off on every tick while picking.
  const hideActive = isImageMode && showSelected && hasSelections(staleLayout);

  if (itemsLoader?.pages) {
    selectionState.update({
      setPages,
      pages: itemsLoader.pages,
      isSingleSelect,
      layout,
    });
  }

  const cardinal = layout?.qListObject.qDimensionInfo.qCardinal;

  // Only signal render readiness once both data and expression cache are ready.
  // The warm-up effect runs asynchronously when in image mode with a fetchable cardinality.
  const needsExprWarmup = isImageMode && dataWidth > 1 && cardinal && cardinal <= EXPR_CACHE_WARMUP_LIMIT;
  const exprWarmupReady = !needsExprWarmup || exprCacheReady;

  if ((itemsLoader?.pages.length && !awaitingFrequencyMax && exprWarmupReady) || cardinal === 0) {
    // All necessary data fetching done - signal rendering done!
    renderedCallback?.();
  }

  // Warm the per-value expression cache (imageUrl/subtitle/etc.) for the whole field in one go,
  // independent of which rows have actually scrolled into view. Without this, a value that gets
  // excluded before its row is ever rendered has no cached fallback (see helpers/expr-cache.js) -
  // its image/subtitle is lost for good the moment it's excluded, since the engine returns null for
  // excluded values and the render-driven cache never got a chance to capture a valid one.
  useEffect(() => {
    if (!isImageMode || dataWidth <= 1 || !cardinal || cardinal > EXPR_CACHE_WARMUP_LIMIT) {
      return undefined;
    }
    let cancelled = false;
    const exprIndex = getListExprIndex(layout);
    const pageHeight = Math.max(1, Math.floor(EXPR_CACHE_WARMUP_CELL_LIMIT / dataWidth));
    (async () => {
      try {
        for (let top = 0; top < cardinal && !cancelled; top += pageHeight) {
          // eslint-disable-next-line no-await-in-loop
          const [page] = await model.getListObjectData('/qListObjectDef', [
            { qTop: top, qLeft: 0, qWidth: dataWidth, qHeight: Math.min(pageHeight, cardinal - top) },
          ]);
          if (cancelled) return;
          (page?.qMatrix || []).forEach((row) => {
            const valueKey = row[0]?.qElemNumber ?? row[0]?.qText;
            Object.entries(exprIndex).forEach(([key, col]) => {
              cacheExprValue(exprCache.current, key, valueKey, row[col]?.qText);
            });
          });
        }
      } catch (error) {
        if (!cancelled) {
          // Log non-cancellation errors; listbox rendering will proceed with partial cache
          // eslint-disable-next-line no-console
          console.error('ListBox expression cache warm-up failed:', error);
        }
      }
      // Always mark ready (success or error) so rendering is not indefinitely blocked
      if (!cancelled) setExprCacheReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // dimensionFieldKey/exprLabelsKey are stable string keys standing in for layout identity, so
    // this only re-runs when the field or its expressions actually change, not on every layout tick.
  }, [model, isImageMode, dataWidth, cardinal, dimensionFieldKey, exprLabelsKey]);

  // Warm the expression cache for selected values even if the full field warm-up
  // was skipped (cardinality > EXPR_CACHE_WARMUP_LIMIT), so their images/subtitles are available.
  useEffect(() => {
    if (!hideActive) {
      setSelectedValuesPage(null);
      return undefined;
    }
    let cancelled = false;
    const counts = staleLayout?.qListObject.qDimensionInfo.qStateCounts || {};
    const selectedCount = (counts.qSelected || 0) + (counts.qLocked || 0);
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
          // Warm expression cache for selected values (on demand, regardless of cardinality limit)
          const exprIndex = getListExprIndex(staleLayout);
          (page?.qMatrix || []).forEach((row) => {
            const valueKey = row[0]?.qElemNumber ?? row[0]?.qText;
            Object.entries(exprIndex).forEach(([key, col]) => {
              cacheExprValue(exprCache.current, key, valueKey, row[col]?.qText);
            });
          });
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
  }, [hideActive, staleLayout, dataWidth, model]);

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
    exprCache: exprCache.current,
    exprCacheReady,
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
