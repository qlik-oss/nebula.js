/* eslint no-underscore-dangle:0 */

import React, { useEffect, useState, useCallback, useRef } from 'react';

import { FixedSizeList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

import useLayout from '../../hooks/useLayout';

import useSelectionsInteractions from './useSelectionsInteractions';

import { MemoRowColumn } from './ListBoxRowColumn';

function getSizeInfo({ isVertical, checkboxes, dense, height }) {
  let sizeVertical = checkboxes ? 40 : 33;
  if (dense) {
    sizeVertical = 24;
  }
  const itemSize = isVertical ? sizeVertical : 200;
  const listHeight = height || 8 * itemSize;

  return {
    itemSize,
    listHeight,
  };
}

export default function ListBox({
  model,
  selections,
  direction,
  height,
  width,
  listLayout = 'vertical',
  frequencyMode = 'N',
  histogram = false,
  rangeSelect = true,
  checkboxes = false,
  update = undefined,
  dense = false,
  selectDisabled = () => false,
}) {
  const [layout] = useLayout(model);
  const isSingleSelect = !!(layout && layout.qListObject.qDimensionInfo.qIsOneAndOnlyOne);
  const [pages, setPages] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { instantPages = [], interactionEvents } = useSelectionsInteractions({
    layout,
    selections,
    pages,
    rangeSelect,
    checkboxes,
    selectDisabled,
    doc: document,
    isSingleSelect,
  });
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

  const loadMoreItems = useCallback(
    (startIndex, stopIndex) => {
      local.current.queue.push({
        start: startIndex,
        stop: stopIndex,
      });

      const isScrolling = loaderRef.current ? loaderRef.current._listRef.state.isScrolling : false;

      if (local.current.queue.length > 10) {
        local.current.queue.shift();
      }
      clearTimeout(local.current.timeout);
      setIsLoadingData(true);
      return new Promise((resolve) => {
        local.current.timeout = setTimeout(
          () => {
            const sorted = local.current.queue.slice(-2).sort((a, b) => a.start - b.start);
            model
              .getListObjectData(
                '/qListObjectDef',
                sorted.map((s) => ({
                  qTop: s.start,
                  qHeight: s.stop - s.start + 1,
                  qLeft: 0,
                  qWidth: 1,
                }))
              )
              .then((p) => {
                local.current.validPages = true;
                listData.current.pages = p;
                setPages(p);
                setIsLoadingData(false);
                resolve();
              });
          },
          isScrolling ? 500 : 0
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
      // Skip scrollToItem if we are in selections
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
  }, [layout]);

  useEffect(() => {
    if (!instantPages || isLoadingData) {
      return;
    }
    setPages(instantPages);
  }, [instantPages]);

  if (!layout) {
    return null;
  }

  const isVertical = listLayout !== 'horizontal';
  const count = layout.qListObject.qSize.qcy;
  const { itemSize, listHeight } = getSizeInfo({ isVertical, checkboxes, dense, height });
  const isLocked = layout && layout.qListObject.qDimensionInfo.qLocked;
  const { frequencyMax } = layout;

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={count}
      loadMoreItems={loadMoreItems}
      threshold={0}
      minimumBatchSize={100}
      ref={loaderRef}
    >
      {({ onItemsRendered, ref }) => {
        local.current.listRef = ref;
        return (
          <FixedSizeList
            direction={direction}
            data-testid="fixed-size-list"
            useIsScrolling
            style={{}}
            height={listHeight}
            width={width}
            itemCount={count}
            layout={listLayout}
            itemData={{
              isLocked,
              column: !isVertical,
              pages,
              ...(isLocked || selectDisabled() ? {} : interactionEvents),
              checkboxes,
              dense,
              frequencyMode,
              frequencyMax,
              histogram,
            }}
            itemSize={itemSize}
            onItemsRendered={onItemsRendered}
            ref={ref}
          >
            {MemoRowColumn}
          </FixedSizeList>
        );
      }}
    </InfiniteLoader>
  );
}
