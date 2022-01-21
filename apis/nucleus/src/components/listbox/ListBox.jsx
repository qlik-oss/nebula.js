/* eslint no-underscore-dangle:0 */

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  // useMemo,
} from 'react';

import { FixedSizeList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

import useLayout from '../../hooks/useLayout';

import Row from './ListBoxRow';
import Column from './ListBoxColumn';
import { selectValues } from './listbox-selections';

export default function ListBox({
  model,
  selections,
  direction,
  height,
  width,
  listLayout = 'vertical',
  update = undefined,
}) {
  const [layout] = useLayout(model);
  const [pages, setPages] = useState(null);
  const loaderRef = useRef(null);
  const local = useRef({
    queue: [],
    validPages: false,
  });

  const listData = useRef({
    pages: [],
  });

  const onClick = useCallback(
    (e) => {
      if (layout && layout.qListObject.qDimensionInfo.qLocked) {
        return;
      }
      const elemNumber = +e.currentTarget.getAttribute('data-n');
      const elemNumbers = [elemNumber];
      const isSingleSelect = layout.qListObject.qDimensionInfo.qIsOneAndOnlyOne;

      if (!Number.isNaN(elemNumber)) {
        selectValues({ selections, elemNumbers, isSingleSelect });
      }
    },
    [
      model,
      layout && !!layout.qListObject.qDimensionInfo.qLocked,
      layout && !!layout.qListObject.qDimensionInfo.qIsOneAndOnlyOne,
    ]
  );

  const isItemLoaded = useCallback(
    (index) => {
      if (!pages || !local.current.validPages) {
        return false;
      }
      local.current.checkIdx = index;
      const page = pages.filter((p) => p.qArea.qTop <= index && index < p.qArea.qTop + p.qArea.qHeight)[0];
      return page && page.qArea.qTop <= index && index < page.qArea.qTop + page.qArea.qHeight;
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

  if (!layout) {
    return null;
  }
  const isVertical = listLayout !== 'horizontal';
  const count = layout.qListObject.qSize.qcy;
  const ITEM_SIZE = isVertical ? 33 : 200;
  const listHeight = height || 8 * ITEM_SIZE;

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
            useIsScrolling
            style={{}}
            height={listHeight}
            width={width}
            itemCount={count}
            layout={listLayout}
            itemData={{ onClick, pages }}
            itemSize={ITEM_SIZE}
            onItemsRendered={onItemsRendered}
            ref={ref}
          >
            {isVertical ? Row : Column}
          </FixedSizeList>
        );
      }}
    </InfiniteLoader>
  );
}
