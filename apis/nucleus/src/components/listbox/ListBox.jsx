/* eslint no-underscore-dangle:0 */
import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import InfiniteLoader from 'react-window-infinite-loader';
import { styled } from '@mui/material';
import useSelectionsInteractions from './hooks/selections/useSelectionsInteractions';
import getListBoxComponents from './components/grid-list-components/grid-list-components';
import useListSizes from './assets/list-sizes';
import getHorizontalMinBatchSize from './assets/horizontal-minimum-batch-size';
import useItemsLoader from './hooks/useItemsLoader';
import getListCount from './components/list-count';
import useDataStore from './hooks/useDataStore';
import ListBoxDisclaimer from './components/ListBoxDisclaimer';
import ListBoxFooter from './components/ListBoxFooter';
import getScrollIndex from './interactions/listbox-get-scroll-index';
import getFrequencyAllowed from './components/grid-list-components/frequency-allowed';
import useFrequencyMax from './hooks/useFrequencyMax';
import { ScreenReaderForSelections, getScreenReaderSearchText } from './components/ScreenReaders';
import InstanceContext from '../../contexts/InstanceContext';
import deduceFrequencyMode from './utils/deduce-frequency-mode';

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
  theme,
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
  selectDisabled = () => false,
  keyScroll = { state: {}, reset: () => {} },
  currentScrollIndex = { set: () => {} },
  renderedCallback,
  onCtrlF,
  showSearch,
  isModal,
}) {
  const { translator: translatorDynamic } = useContext(InstanceContext);
  const [initScrollPosIsSet, setInitScrollPosIsSet] = useState(false);
  const isSingleSelect = !!(layout && layout.qListObject.qDimensionInfo.qIsOneAndOnlyOne);
  const { checkboxes = checkboxOption, histogram } = layout ?? {};
  const [screenReaderText, setScreenReaderText] = useState('');

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

  const { isLoadingData, ...itemsLoader } = useItemsLoader({
    local,
    loaderRef,
    model,
    fetchStart,
    scrollTimeout,
    postProcessPages,
    listData,
  });
  const { getStoreValue, setStoreValue } = useDataStore(model);
  const loadMoreItems = useCallback(itemsLoader.loadMoreItems, [layout]);

  const [overflowDisclaimer, setOverflowDisclaimer] = useState({ show: false, dismissed: false });
  const showOverflowDisclaimer = (show) => setOverflowDisclaimer((state) => ({ ...state, show }));

  const [pages, setPages] = useState([]);

  if (itemsLoader?.pages) {
    selectionState.update({
      setPages,
      pages: itemsLoader.pages,
      isSingleSelect,
      selectDisabled,
      layout,
    });
  }

  const cardinal = layout?.qListObject.qDimensionInfo.qCardinal;

  if ((itemsLoader?.pages.length && !awaitingFrequencyMax) || cardinal === 0) {
    // All necessary data fetching done - signal rendering done!
    renderedCallback?.();
  }

  const isItemLoaded = useCallback(
    (index) => {
      if (!pages?.length || !local.current.validPages) {
        return false;
      }
      local.current.checkIdx = index;
      const isLoaded = (p) => p.qArea.qTop <= index && index < p.qArea.qTop + p.qArea.qHeight;
      const page = pages.filter((p) => isLoaded(p))[0];
      return page && isLoaded(page);
    },
    [layout, pages]
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
    isRow = layoutOptions.dataLayout === 'singleColumn' ? true : layoutOptions?.layoutOrder === 'row';
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

  const count = layout?.qListObject.qSize?.qcy;

  const unlimitedListCount = getListCount({
    pages,
    minimumBatchSize,
    count,
    calculatePagesHeight,
    layoutOptions,
    model,
  });

  let freqIsAllowed = getFrequencyAllowed({ itemWidth: width, layout, frequencyMode });
  const deducedFrequencyMode = deduceFrequencyMode(pages);
  const sizes = useListSizes({
    layout,
    width,
    height,
    listCount: unlimitedListCount,
    count,
    freqIsAllowed,
    checkboxes,
    theme,
  });
  if (sizes.columnWidth) {
    // In grid mode, where we have a dynamic item width, get a second opinion on showing/hiding frequency.
    freqIsAllowed = getFrequencyAllowed({ itemWidth: sizes.columnWidth, layout, frequencyMode });
  }

  const { listCount } = sizes;
  setStoreValue('listCount', listCount);

  const inputText = getStoreValue('inputText');

  useEffect(() => {
    if (inputText) {
      const srText = getScreenReaderSearchText(listCount);
      const srFinalText = translatorDynamic.get(srText, [listCount]);
      setScreenReaderText(srFinalText);
    }
  }, [inputText, listCount]);

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
    pages,
    selectDisabled,
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
  });

  const { columnWidth, listHeight, itemHeight } = sizes || {};
  if (!isVertical) {
    minimumBatchSize = getHorizontalMinBatchSize({ width, columnWidth, listHeight, itemHeight });
  }

  return (
    <StyledWrapper>
      <ScreenReaderForSelections className="screenReaderOnly" layout={layout} />
      <div className="screenReaderOnly" aria-live="assertive">
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
