/* eslint no-underscore-dangle:0 */

import React, { useEffect, useState, useCallback, useRef } from 'react';

import InfiniteLoader from 'react-window-infinite-loader';

import useLayout from '../../hooks/useLayout';

import useSelectionsInteractions from './hooks/selections/useSelectionsInteractions';

import getListBoxComponents from './components/grid-list-components/grid-list-components';
import useListSizes from './hooks/use-list-sizes';
import useTextWidth from './hooks/useTextWidth';
import getMeasureText from './assets/measure-text';
import getMinimumBatchSize from './assets/minimum-batch-size';
import useItemsLoader from './hooks/use-items-loader';
import { useVizDataStore } from '../../stores/viz-store';

export default function ListBox({
  model,
  selections,
  direction,
  height,
  width,
  listLayout = 'vertical',
  frequencyMode,
  histogram = false,
  checkboxes = false,
  update = undefined,
  fetchStart = undefined,
  postProcessPages = undefined,
  calculatePagesHeight = false,
  keyboard = {},
  showGray = true,
  scrollState,
  selectDisabled = () => false,
}) {
  const [layout] = useLayout(model);
  const isSingleSelect = !!(layout && layout.qListObject.qDimensionInfo.qIsOneAndOnlyOne);

  const loaderRef = useRef(null);
  const local = useRef({
    queue: [],
    validPages: false,
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
  const loadMoreItems = useCallback(itemsLoader.loadMoreItems, [layout]);
  const [vizDataStore] = useVizDataStore();

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

  const fetchData = () => {
    local.current.queue = [];
    local.current.validPages = false;
    if (loaderRef.current) {
      loaderRef.current.resetloadMoreItemsCache(true);
      // Skip scrollToItem if we are in selections.
      if (layout && layout.qSelectionInfo.qInSelections) {
        return;
      }
      loaderRef.current._listRef.scrollToItem(0);
    }
  };

  if (update) {
    // Hand over the update function for manual refresh from hosting application.
    update.call(null, fetchData);
  }

  useEffect(() => {
    fetchData();
    vizDataStore.set(`${model.id}_listCount`, layout?.qListObject.qSize.qcy);
  }, [layout, layout && layout.qListObject.qSize.qcy]);

  // Update with "simulated" pages.
  useEffect(() => {
    if (!instantPages || isLoadingData) {
      return;
    }
    setPages(instantPages);
  }, [instantPages]);

  const [initScrollPosIsSet, setInitScrollPosIsSet] = useState(false);

  useEffect(() => {
    if (scrollState && !initScrollPosIsSet && loaderRef.current) {
      loaderRef.current._listRef.scrollToItem(scrollState.initScrollPos);
      setInitScrollPosIsSet(true);
    }
  }, [loaderRef.current]);

  const textWidth = useTextWidth({ text: getMeasureText(layout), font: '14px Source sans pro' });

  if (!layout) {
    return undefined;
  }

  const { layoutOptions = {} } = layout;

  let minimumBatchSize;

  const isVertical = layoutOptions.dataLayout
    ? layoutOptions.dataLayout === 'singleColumn'
    : listLayout !== 'horizontal';

  const sizes = useListSizes({
    layout,
    width,
    height,
    checkboxes,
    pages,
    calculatePagesHeight,
    textWidth,
    minimumBatchSize,
  });

  const { textAlign } = layout?.qListObject.qDimensionInfo || {};

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
  });

  // const listCount = pages && pages.length && calculatePagesHeight ? getCalculatedHeight(pages) : count;
  // onSetListCount?.(listCount);
  // const dense = layout.layoutOptions?.dense ?? false;
  // const { itemSize, listHeight } = getSizeInfo({ isVertical, checkboxes, dense, height });
  // const isLocked = layout && layout.qListObject.qDimensionInfo.qLocked;
  // const { textAlign } = layout?.qListObject.qDimensionInfo || {};
  // const { frequencyMax } = layout;
  // const freqIsAllowed = getFrequencyAllowed();

  const { columnWidth, listHeight, itemSize, listCount } = sizes || {};
  minimumBatchSize = getMinimumBatchSize({ isVertical, width, columnWidth, listHeight, itemSize });

  return (
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
  );
}
