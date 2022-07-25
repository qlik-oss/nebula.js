/* eslint no-underscore-dangle:0 */

import React, { useEffect, useState, useCallback, useRef } from 'react';

import { styled } from '@mui/material/styles';

import { FixedSizeList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

import useLayout from '../../hooks/useLayout';

import useSelectionsInteractions from './useSelectionsInteractions';

import RowColumn from './ListBoxRowColumn';

const PREFIX = 'ListBox';
const scrollBarThumb = '#BBB';
const scrollBarThumbHover = '#555';
const scrollBarBackground = '#f1f1f1';

const MINIMUM_BATCH_SIZE = 100;

const classes = {
  styledScrollbars: `${PREFIX}-styledScrollbars`,
};

const StyledInfiniteLoader = styled(InfiniteLoader)(() => ({
  [`& .${classes.styledScrollbars}`]: {
    scrollbarColor: `${scrollBarThumb} ${scrollBarBackground}`,

    '&::-webkit-scrollbar': {
      width: 10,
      height: 10,
    },

    '&::-webkit-scrollbar-track': {
      backgroundColor: scrollBarBackground,
    },

    '&::-webkit-scrollbar-thumb': {
      backgroundColor: scrollBarThumb,
      borderRadius: '1rem',
    },

    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: scrollBarThumbHover,
    },
  },
}));

function getSizeInfo({ isVertical, checkboxes, dense, height }) {
  let sizeVertical = checkboxes ? 40 : 33;
  if (dense) {
    sizeVertical = 20;
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
  checkboxes = false,
  update = undefined,
  fetchStart = undefined,
  postProcessPages = undefined,
  calculatePagesHeight = false,
  dense = false,
  keyboard = {},
  showGray = true,
  scrollState,
  sortByState,
  selectDisabled = () => false,
  setCount,
}) {
  const [layout] = useLayout(model);
  const isSingleSelect = !!(layout && layout.qListObject.qDimensionInfo.qIsOneAndOnlyOne);
  const [pages, setPages] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

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

  // debouncing api call, may be exposed in API later on.
  const scrollTimeout = 500;

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
            const reqPromise = model
              .getListObjectData(
                '/qListObjectDef',
                sorted.map((s) => ({
                  qTop: s.start,
                  // we always need to ask for MINUM_BATCH_SIZE
                  // if backend sends anything less than that
                  // then we know that is last page for us
                  qHeight: MINIMUM_BATCH_SIZE,
                  qLeft: 0,
                  qWidth: 1,
                }))
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
    // we need to reset pages data here
    // since we reset the local.current.queue
    setPages(null);
    if (loaderRef.current) {
      loaderRef.current.resetloadMoreItemsCache(true);
      // Skip scrollToItem if we are in selections, or if we dont sort by state.
      if ((layout && layout.qSelectionInfo.qInSelections) || sortByState === 0) {
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

  if (!layout) {
    return null;
  }

  const isVertical = listLayout !== 'horizontal';

  let count = layout.qListObject.qSize.qcy;

  // Should not allow a count of zero since it will stop executing loadMoreItems
  // this could happen if a seach returns an empty result
  if (count === 0) {
    count = 1;
  }

  const getCalculatedHeight = (ps) => {
    // If values have been filtered in the currently loaded page, we want to
    // prevent rendering empty rows by assigning the actual number of items to render
    // since count (qcy) does not reflect this in DQ mode currently.
    // If any qMatrix was not 100 length && result of it was less that qcy
    // then => qTop + qHeight might indicate length of items as long as you scroll and fetch more items
    const hasFilteredValues = ps.some((p) => p.qArea.qHeight !== MINIMUM_BATCH_SIZE);
    const h = Math.max(...ps.map((page) => page.qArea.qTop + page.qArea.qHeight));
    return h < count && hasFilteredValues ? h : count;
  };

  const listCount = pages && pages.length && calculatePagesHeight ? getCalculatedHeight(pages) : count;
  const { itemSize, listHeight } = getSizeInfo({ isVertical, checkboxes, dense, height });
  const isLocked = layout && layout.qListObject.qDimensionInfo.qLocked;
  const { frequencyMax } = layout;

  return (
    <StyledInfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={count}
      loadMoreItems={loadMoreItems}
      threshold={0}
      minimumBatchSize={MINIMUM_BATCH_SIZE}
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
            itemCount={listCount}
            layout={listLayout}
            className={classes.styledScrollbars}
            itemData={{
              isLocked,
              column: !isVertical,
              pages,
              ...(isLocked || selectDisabled() ? {} : interactionEvents),
              checkboxes,
              dense,
              frequencyMode,
              isSingleSelect,
              actions: {
                select,
                confirm: () => selections && selections.confirm.call(selections),
                cancel: () => selections && selections.cancel.call(selections),
              },
              frequencyMax,
              histogram,
              keyboard,
              showGray,
            }}
            itemSize={itemSize}
            onItemsRendered={(renderProps) => {
              if (scrollState) {
                scrollState.setScrollPos(renderProps.visibleStopIndex);
              }
              onItemsRendered({ ...renderProps });
            }}
            ref={ref}
          >
            {RowColumn}
          </FixedSizeList>
        );
      }}
    </StyledInfiniteLoader>
  );
}
