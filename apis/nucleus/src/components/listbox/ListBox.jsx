/* eslint no-underscore-dangle:0 */

import React, { useEffect, useState, useCallback, useRef } from 'react';

import { styled } from '@mui/material/styles';

import { FixedSizeList, FixedSizeGrid } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

import useLayout from '../../hooks/useLayout';

import useSelectionsInteractions from './hooks/selections/useSelectionsInteractions';

import RowColumn from './components/ListBoxRowColumn';
import useTextWidth from './hooks/useTextWidth';

const PREFIX = 'ListBox';
const scrollBarThumb = '#BBB';
const scrollBarThumbHover = '#555';
const scrollBarBackground = '#f1f1f1';

let MINIMUM_BATCH_SIZE = 100;

const classes = {
  styledScrollbars: `${PREFIX}-styledScrollbars`,
};

const scrollbarStyling = {
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
};

const StyledFixedSizeList = styled(FixedSizeList)(() => ({
  [`&.${classes.styledScrollbars}`]: scrollbarStyling,
}));

const StyledFixedSizeGrid = styled(FixedSizeGrid)(() => ({
  [`&.${classes.styledScrollbars}`]: scrollbarStyling,
}));

function getSizeInfo({ checkboxes, dense, height }) {
  let itemSize = checkboxes ? 40 : 33;
  if (dense) {
    itemSize = 20;
  }
  const listHeight = height || 8 * itemSize;

  return {
    itemSize,
    listHeight,
  };
}

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
  frequencyMode = 'N',
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
  const textWidth = useTextWidth({ text: getMeasureText(layout), font: '14px Source sans pro' });

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

  // The time from scroll end until new data is being fetched, may be exposed in API later on.
  const scrollTimeout = 0;

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
                // 2nd one is our starting index + MINIMUM_BATCH_SIZE items
                // 1st one is 2nd ones starting index - MINIMUM_BATCH_SIZE items
                // we do this because we don't want to miss any items between fast scrolls
                [
                  {
                    qTop: lastItemInQueue.start > MINIMUM_BATCH_SIZE ? lastItemInQueue.start - MINIMUM_BATCH_SIZE : 0,
                    qHeight: MINIMUM_BATCH_SIZE,
                    qLeft: 0,
                    qWidth: 1,
                  },
                  {
                    qTop: lastItemInQueue.start,
                    qHeight: MINIMUM_BATCH_SIZE,
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

  if (!layout) {
    return null;
  }

  const { layouting = {} } = layout.qListObject;

  const isVertical = layouting.dataLayout ? layouting.dataLayout === 'singleColumn' : listLayout !== 'horizontal';

  const count = layout.qListObject.qSize.qcy;

  const getCalculatedHeight = (ps) => {
    // If values have been filtered in the currently loaded page, we want to
    // prevent rendering empty rows by assigning the actual number of items to render
    // since count (qcy) does not reflect this in DQ mode currently.
    const hasFilteredValues = ps.some((page) => page.qArea.qHeight < MINIMUM_BATCH_SIZE);
    const h = Math.max(...ps.map((page) => page.qArea.qTop + page.qArea.qHeight));
    return hasFilteredValues ? h : count;
  };

  const listCount = pages && pages.length && calculatePagesHeight ? getCalculatedHeight(pages) : count;
  onSetListCount?.(listCount);
  const dense = layout.layoutOptions?.dense ?? false;
  const { itemSize, listHeight } = getSizeInfo({ isVertical, checkboxes, dense, height });
  const isLocked = layout && layout.qListObject.qDimensionInfo.qLocked;
  const { frequencyMax } = layout;

  const list = ({ onItemsRendered, ref }) => {
    local.current.listRef = ref;
    return (
      <StyledFixedSizeList
        // explicitly set this as it accepts horizontal as well, leading to confusion
        direction={direction === 'rtl' ? 'rtl' : 'ltr'}
        data-testid="fixed-size-list"
        useIsScrolling
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
      </StyledFixedSizeList>
    );
  };

  const grid = ({ onItemsRendered, ref }) => {
    const { layoutOrder, maxVisibleRows, maxVisibleColumns } = layouting;
    const columnAutoWidth = Math.min(150, textWidth + 18);
    const scrollBarWidth = 10; // TODO: ignore this - instead set the styling only show on hover...
    let columnCount;
    let rowCount;
    let columnWidth;
    let overflowStyling;

    if (layoutOrder === 'row') {
      overflowStyling = { overflowX: 'hidden' };
      const maxColumns = maxVisibleColumns.maxColumns || 3;

      if (maxVisibleColumns.auto !== false) {
        columnCount = Math.min(listCount, Math.ceil((width - scrollBarWidth) / columnAutoWidth)); // TODO: smarter sizing... based on glyph count + font size etc...??
      } else {
        columnCount = Math.min(listCount, maxColumns);
      }
      rowCount = Math.ceil(listCount / columnCount);
      columnWidth = (width - scrollBarWidth) / columnCount;
    } else {
      overflowStyling = { overflowY: 'hidden' };
      const maxRows = maxVisibleRows.maxRows || 3;

      if (maxVisibleRows.auto !== false) {
        rowCount = Math.floor(listHeight / itemSize);
      } else {
        rowCount = Math.min(listCount, maxRows);
      }

      columnCount = Math.ceil(listCount / rowCount);
      columnWidth = Math.max(columnAutoWidth, width / columnCount);
    }

    const gridHeight = Math.min(listHeight, rowCount * itemSize + scrollBarWidth);

    local.current.listRef = ref;

    const visibleCellsCount = Math.ceil(width / columnWidth) * Math.ceil(listHeight / itemSize);
    MINIMUM_BATCH_SIZE = visibleCellsCount * 2;

    const newItemsRendered = (gridData) => {
      const { overscanRowStartIndex, overscanRowStopIndex, overscanColumnStartIndex, overscanColumnStopIndex } =
        gridData;

      let toTheLeftOfStart;
      let aboveStart;

      let toTheLeftOfEnd;
      let aboveEnd;

      if (layoutOrder === 'column') {
        toTheLeftOfStart = overscanColumnStartIndex * rowCount;
        aboveStart = overscanRowStartIndex;

        toTheLeftOfEnd = overscanColumnStopIndex * rowCount;
        aboveEnd = overscanRowStopIndex;
      } else {
        toTheLeftOfStart = overscanColumnStartIndex;
        aboveStart = overscanRowStartIndex * columnCount;

        toTheLeftOfEnd = overscanColumnStopIndex;
        aboveEnd = overscanRowStopIndex * columnCount;
      }

      const visibleStartIndex = toTheLeftOfStart + aboveStart;
      const visibleStopIndex = toTheLeftOfEnd + aboveEnd;

      onItemsRendered({
        // call onItemsRendered from InfiniteLoader so it can load more if needed
        visibleStartIndex,
        visibleStopIndex,
      });
    };

    return (
      <StyledFixedSizeGrid
        direction={direction === 'rtl' ? 'rtl' : 'ltr'}
        data-testid="fixed-size-list"
        useIsScrolling
        height={gridHeight}
        width={width}
        columnCount={columnCount}
        columnWidth={columnWidth}
        rowCount={rowCount}
        rowHeight={itemSize}
        className={classes.styledScrollbars}
        style={{ ...overflowStyling }}
        // itemCount={listCount}
        // layout={listLayout}
        // itemSize={itemSize}
        itemData={{
          isLocked,
          // column: !isVertical,
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
          columnCount,
          rowCount,
          layoutOrder,
        }}
        onItemsRendered={(renderProps) => {
          if (scrollState) {
            scrollState.setScrollPos(renderProps.visibleStopIndex);
          }
          newItemsRendered({ ...renderProps });
        }}
        ref={ref}
      >
        {RowColumn}
      </StyledFixedSizeGrid>
    );
  };

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={listCount || 1} // must be more than 0 or loadMoreItems will never be called again
      loadMoreItems={loadMoreItems}
      threshold={0}
      minimumBatchSize={MINIMUM_BATCH_SIZE}
      ref={loaderRef}
    >
      {isVertical ? list : grid}
    </InfiniteLoader>
  );
}
