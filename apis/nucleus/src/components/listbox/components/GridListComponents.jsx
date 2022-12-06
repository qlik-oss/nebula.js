/* eslint-disable react/function-component-definition */
import React from 'react';
import styled from '@emotion/styled';
import { FixedSizeList, FixedSizeGrid } from 'react-window';
import RowColumn from './ListBoxRowColumn';

const PREFIX = 'ListBox';
const scrollBarThumb = '#BBB';
const scrollBarThumbHover = '#555';
const scrollBarBackground = '#f1f1f1';

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

const classes = {
  styledScrollbars: `${PREFIX}-styledScrollbars`,
};

const StyledFixedSizeList = styled(FixedSizeList)(() => ({
  [`&.${classes.styledScrollbars}`]: scrollbarStyling,
  // TODO: Verify these props and make generic together with grid component.
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
}));

const StyledFixedSizeGrid = styled(FixedSizeGrid)(() => ({
  [`&.${classes.styledScrollbars}`]: scrollbarStyling,

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
}));

export default function getListBoxComponents({
  layout,
  width,
  checkboxes,
  local,
  isVertical,
  pages,
  selectDisabled,
  interactionEvents,
  frequencyMode,
  histogram,
  isSingleSelect,
  select,
  selections,
  keyboard,
  showGray,
  scrollState,
  direction,
  listLayout,
  sizes,
}) {
  const { layoutOptions = {} } = layout;
  const { dense = false } = layoutOptions;

  const { listHeight, listCount, itemSize, scrollBarWidth, rowCount } = sizes || {};

  const isLocked = layout && layout.qListObject.qDimensionInfo.qLocked;
  const { frequencyMax } = layout;

  const List = ({ onItemsRendered, ref }) => {
    // eslint-disable-next-line no-param-reassign
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

  const Grid = ({ onItemsRendered, ref }) => {
    const { layoutOrder } = layoutOptions || {};

    let columnCount;

    const gridHeight = Math.min(listHeight, rowCount * itemSize + scrollBarWidth);

    // eslint-disable-next-line no-param-reassign
    local.current.listRef = ref;

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

    const { columnWidth, overflowStyling } = sizes;

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

  return { List, Grid };
}
