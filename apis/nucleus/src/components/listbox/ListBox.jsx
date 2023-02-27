/* eslint no-underscore-dangle:0 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import InfiniteLoader from 'react-window-infinite-loader';
import useLayout from '../../hooks/useLayout';
import useSelectionsInteractions from './hooks/selections/useSelectionsInteractions';
import getListBoxComponents from './components/grid-list-components/grid-list-components';
import getListSizes from './assets/get-list-sizes';
import useTextWidth from './hooks/useTextWidth';
import getMeasureText from './assets/measure-text';
import getHorizontalMinBatchSize from './assets/horizontal-minimum-batch-size';
import useItemsLoader from './hooks/useItemsLoader';
import getListCount from './components/list-count';
import useDataStore from './hooks/useDataStore';
import ListBoxDisclaimer from './components/ListBoxDisclaimer';
import ListBoxFooter from './components/ListBoxFooter';
import getScrollIndex from './interactions/listbox-get-scroll-index';

const DEFAULT_MIN_BATCH_SIZE = 100;

export default function ListBox({
  model,
  selections,
  direction,
  checkboxes: checkboxOption,
  height,
  width,
  listLayout = 'vertical',
  frequencyMode,
  update = undefined,
  fetchStart = undefined,
  postProcessPages = undefined,
  calculatePagesHeight = false,
  keyboard = {},
  showGray = true,
  scrollState,
  selectDisabled = () => false,
}) {
  const [initScrollPosIsSet, setInitScrollPosIsSet] = useState(false);
  const [layout] = useLayout(model);
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

  // The time from scroll end until new data is being fetched, may be exposed in API later on.
  const scrollTimeout = 0;

  const { isLoadingData, ...itemsLoader } = useItemsLoader({
    local,
    loaderRef,
    model,
    fetchStart,
    scrollTimeout,
    postProcessPages,
    listData,
  });
  const [pages, setPages] = useState([]);
  const { setStoreValue } = useDataStore(model);
  const loadMoreItems = useCallback(itemsLoader.loadMoreItems, [layout]);

  const [overflowDisclaimer, setOverflowDisclaimer] = useState({ show: false, dismissed: false });
  const showOverflowDisclaimer = (show) => setOverflowDisclaimer((state) => ({ ...state, show }));

  useEffect(() => {
    setPages(itemsLoader?.pages || []);
  }, [itemsLoader?.pages]);

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

  const {
    instantPages = [],
    interactionEvents,
    select,
  } = useSelectionsInteractions({
    layout,
    selections,
    pages,
    checkboxes,
    selectDisabled,
    doc: document,
    isSingleSelect,
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
      // Skip scrollToItem if we are in selections.
      if (layout && layout.qSelectionInfo.qInSelections) {
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
    if (!instantPages || isLoadingData) {
      return;
    }
    setPages(instantPages);
  }, [instantPages]);

  useEffect(() => {
    if (scrollState && !initScrollPosIsSet && loaderRef.current) {
      loaderRef.current._listRef.scrollToItem(scrollState.initScrollPos);
      setInitScrollPosIsSet(true);
    }
  }, [loaderRef.current]);

  useEffect(() => {
    fetchData();
  }, [layout, local.current.dataOffset]);

  const textWidth = useTextWidth({ text: getMeasureText(layout), font: '14px Source sans pro' });

  let minimumBatchSize = DEFAULT_MIN_BATCH_SIZE;

  const isVertical = layoutOptions.dataLayout
    ? layoutOptions.dataLayout === 'singleColumn'
    : listLayout !== 'horizontal';

  const count = layout?.qListObject.qSize?.qcy;

  const unlimitedListCount = getListCount({
    pages,
    minimumBatchSize,
    count,
    calculatePagesHeight,
    layoutOptions,
    model,
  });

  const sizes = getListSizes({ layout, width, height, listCount: unlimitedListCount, count, textWidth, checkboxes });
  const { listCount } = sizes;
  setStoreValue('listCount', listCount);

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
      setPages((currentPages) => [...currentPages]);
    }
    scrollToIndex(scrollIndex);
  };

  const { textAlign } = layout?.qListObject.qDimensionInfo || {};

  const [focusListItem, setFocusListItem] = useState({ first: false, last: false });
  const getFocusState = () => ({
    first: focusListItem.first,
    setFirst: (first) => setFocusListItem((prevState) => ({ ...prevState, first })),
    last: focusListItem.last,
    setLast: (last) => setFocusListItem((prevState) => ({ ...prevState, last })),
  });

  const { List, Grid } = getListBoxComponents({
    direction,
    layout,
    height,
    width,
    checkboxes,
    frequencyMode,
    histogram,
    keyboard,
    showGray,
    interactionEvents,
    select,
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
  });

  const { columnWidth, listHeight, itemSize } = sizes || {};
  if (!isVertical) {
    minimumBatchSize = getHorizontalMinBatchSize({ width, columnWidth, listHeight, itemSize });
  }

  return (
    <>
      {!listCount && <ListBoxDisclaimer width={width} text="Listbox.NoMatchesForYourTerms" />}
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={listCount || 1} // must be more than 0 or loadMoreItems will never be called again
        loadMoreItems={loadMoreItems.with({ minimumBatchSize })}
        threshold={0}
        minimumBatchSize={minimumBatchSize}
        ref={loaderRef}
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
    </>
  );
}
