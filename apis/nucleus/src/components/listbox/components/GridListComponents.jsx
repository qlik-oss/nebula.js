/* eslint-disable react/function-component-definition */
import React from 'react';
import styled from '@emotion/styled';
import { FixedSizeList, FixedSizeGrid } from 'react-window';
import RowColumn from './ListBoxRowColumn';

const PREFIX = 'ListBox';
const scrollBarThumb = '#BBB';
const scrollBarThumbHover = '#555';
const scrollBarBackground = '#f1f1f1';

const FREQUENCY_MIN_SHOW_WIDTH = 80;

const getFrequencyAllowed = ({ width, layout, frequencyMode }) => {
  const widthPermitsFreq = width > FREQUENCY_MIN_SHOW_WIDTH;
  const { frequencyEnabled = false } = layout.qListObject;
  const hasValidFreqOption = !['none', undefined].includes(frequencyMode);
  return widthPermitsFreq && (hasValidFreqOption || frequencyEnabled);
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

  const commonComponentOptions = {
    direction: direction === 'rtl' ? 'rtl' : 'ltr',
    useIsScrolling: true,
    className: classes.styledScrollbars,
  };

  const { listHeight, listCount, itemSize, scrollBarWidth, rowCount, columnCount } = sizes || {};

  const freqIsAllowed = getFrequencyAllowed({ width, layout, frequencyMode });

  const isLocked = layout && layout.qListObject.qDimensionInfo.qLocked;
  const { frequencyMax } = layout;

  const defaultItemData = {
    isLocked,
    column: !isVertical,
    pages,
    ...(isLocked || selectDisabled() ? {} : interactionEvents),
    checkboxes,
    dense,
    frequencyMode,
    freqIsAllowed,
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
  };

  const List = ({ onItemsRendered, ref }) => {
    // eslint-disable-next-line no-param-reassign
    local.current.listRef = ref;
    return (
      <StyledFixedSizeList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...commonComponentOptions}
        dataTestid="fixed-size-list"
        height={listHeight}
        width={width}
        itemCount={listCount}
        layout={listLayout}
        itemData={{ ...defaultItemData }}
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
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...commonComponentOptions}
        dataTestid="fixed-size-grid"
        height={gridHeight}
        width={width}
        columnCount={columnCount}
        columnWidth={columnWidth}
        rowCount={rowCount}
        rowHeight={itemSize}
        style={{ ...overflowStyling }}
        itemData={{
          ...defaultItemData,
          column: undefined,
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
