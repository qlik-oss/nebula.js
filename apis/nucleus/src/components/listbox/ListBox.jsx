/* eslint no-underscore-dangle:0 */

import React, { useEffect, useState, useCallback, useRef } from 'react';

import InfiniteLoader from 'react-window-infinite-loader';

import useLayout from '../../hooks/useLayout';

import useSelectionsInteractions from './hooks/selections/useSelectionsInteractions';

import getListBoxComponents from './components/grid-list-components/grid-list-components';
import calculateGridListSizes from './components/grid-list-sizes';
import useTextWidth from './hooks/useTextWidth';

const getMinimumBatchSize = ({ isVertical, width, columnWidth, listHeight, itemSize }) => {
  const DEFAULT_BATCH_SIZE = 100;
  let minSize;
  if (isVertical) {
    minSize = DEFAULT_BATCH_SIZE;
  } else {
    const visibleCellsCount = Math.ceil(width / columnWidth) * Math.ceil(listHeight / itemSize);
    minSize = visibleCellsCount * 2;
  }
  return minSize;
};

function getMeasureText(layout) {
  if (!layout) {
    return '';
  }

  const maxGlyphCount = layout.qListObject.qDimensionInfo.qApprMaxGlyphCount;
  let measureString = '';
  for (let i = 0; i < maxGlyphCount; i++) {
    measureString += 'M';
  }
  return measureString;
}

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
  onSetListCount = () => {},
  setCount,
}) {
  const [layout] = useLayout(model);
  const isSingleSelect = !!(layout && layout.qListObject.qDimensionInfo.qIsOneAndOnlyOne);
  const [pages, setPages] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const loaderRef = useRef(null);
  const local = useRef({
    queue: [],
    validPages: false,
  });

  const listData = useRef({
    pages: [],
  });

  const isItemLoaded = useCallback(
    (index) => {
      if (!pages || !local.current.validPages) {
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

  // The time from scroll end until new data is being fetched, may be exposed in API later on.
  const scrollTimeout = 0;

  let minimumBatchSize;

  const loadMoreItems = useCallback(
    (startIndex, stopIndex) => {
      local.current.queue.push({
        start: startIndex,
        stop: stopIndex,
      });

      const isScrolling = loaderRef.current
        ? loaderRef.current._listRef && loaderRef.current._listRef.state.isScrolling
        : false;

      if (local.current.queue.length > 10) {
        local.current.queue.shift();
      }
      clearTimeout(local.current.timeout);
      setIsLoadingData(true);
      return new Promise((resolve) => {
        local.current.timeout = setTimeout(
          () => {
            const lastItemInQueue = local.current.queue.slice(-1)[0];
            const reqPromise = model
              .getListObjectData(
                '/qListObjectDef',
                // we need to ask for two payloads
                // 2nd one is our starting index + minimumBatchSize items
                // 1st one is 2nd ones starting index - minimumBatchSize items
                // we do this because we don't want to miss any items between fast scrolls
                [
                  {
                    qTop: lastItemInQueue.start > minimumBatchSize ? lastItemInQueue.start - minimumBatchSize : 0,
                    qHeight: minimumBatchSize,
                    qLeft: 0,
                    qWidth: 1,
                  },
                  {
                    qTop: lastItemInQueue.start,
                    qHeight: minimumBatchSize,
                    qLeft: 0,
                    qWidth: 1,
                  },
                ]
              )
              .then((p) => {
                const processedPages = postProcessPages ? postProcessPages(p) : p;
                local.current.validPages = true;
                listData.current.pages = processedPages;
                setPages(processedPages);
                setIsLoadingData(false);
                resolve();
              });
            fetchStart && fetchStart(reqPromise);
          },
          isScrolling ? scrollTimeout : 0
        );
      });
    },
    [layout]
  );

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
    if (typeof setCount === 'function' && layout) {
      setCount(layout.qListObject.qSize.qcy);
    }
  }, [layout, layout && layout.qListObject.qSize.qcy]);

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

  const isVertical = layoutOptions.dataLayout
    ? layoutOptions.dataLayout === 'singleColumn'
    : listLayout !== 'horizontal';

  const sizes = calculateGridListSizes({
    layout,
    width,
    height,
    checkboxes,
    pages,
    calculatePagesHeight,
    textWidth,
  });

  const { List, Grid } = getListBoxComponents({
    direction,
    layout,
    height,
    width,
    frequencyMode,
    histogram,
    keyboard,
    showGray,
    interactionEvents,
    select,
    isVertical,
    pages,
    selectDisabled,
    isSingleSelect,
    selections,
    scrollState,
    local,
    sizes,
  });

  const { columnWidth, listHeight, itemSize, listCount } = sizes || {};
  onSetListCount?.(listCount);
  minimumBatchSize = getMinimumBatchSize({ isVertical, width, columnWidth, listHeight, itemSize });

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={listCount || 1} // must be more than 0 or loadMoreItems will never be called again
      loadMoreItems={loadMoreItems}
      threshold={0}
      minimumBatchSize={minimumBatchSize}
      ref={loaderRef}
    >
      {isVertical ? List : Grid}
    </InfiniteLoader>
  );
}
