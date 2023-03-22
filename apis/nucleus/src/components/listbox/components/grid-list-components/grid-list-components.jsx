/* eslint-disable react/function-component-definition */
import React from 'react';
import RowColumn from '../ListBoxRowColumn';
import deriveRenderOptions from './derive-render-options';
import getStyledComponents, { classes } from './styled-components';
import handleSetOverflowDisclaimer from './set-overflow-disclaimer';
import { REMOVE_TICK_LIMIT } from '../../constants';

const { StyledFixedSizeList, StyledFixedSizeGrid } = getStyledComponents();

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
  selectAll,
  onCtrlF,
  textAlign,
  selections,
  keyboard,
  showGray,
  scrollState,
  direction,
  sizes,
  listCount,
  overflowDisclaimer,
  setScrollPosition,
  focusListItems,
  setCurrentScrollIndex,
  constraints,
  frequencyMax,
  freqIsAllowed,
}) {
  const { layoutOptions = {} } = layout || {};
  const { columnWidth, itemPadding, listHeight, itemHeight, rowCount, columnCount, frequencyWidth } = sizes || {};

  const itemWidth = layoutOptions.dataLayout === 'grid' ? columnWidth : width;
  const showTick = itemWidth > REMOVE_TICK_LIMIT;

  // Options common for List and Grid.
  const commonComponentOptions = {
    direction: direction === 'rtl' ? 'rtl' : 'ltr',
    useIsScrolling: true,
    className: classes.styledScrollbars,
  };

  const isLocked = layout?.qListObject.qDimensionInfo.qLocked;

  // Item data common for List and Grid.
  const commonItemData = {
    isLocked,
    column: !isVertical,
    pages,
    ...(isLocked || selectDisabled() ? {} : interactionEvents),
    checkboxes,
    layoutOptions,
    frequencyMode,
    freqIsAllowed,
    isSingleSelect,
    textAlign,
    itemPadding,
    frequencyWidth,
    actions: {
      select,
      confirm: () => selections?.confirm.call(selections),
      cancel: () => selections?.cancel.call(selections),
      setScrollPosition,
      selectAll,
      onCtrlF,
    },
    frequencyMax,
    histogram,
    keyboard,
    showGray,
    showTick,
    dataOffset: local.current.dataOffset,
    focusListItems,
    direction,
  };

  const List = ({ onItemsRendered, ref }) => {
    // eslint-disable-next-line no-param-reassign
    local.current.listRef = ref;
    return (
      <StyledFixedSizeList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...commonComponentOptions}
        dataTestid="fixed-size-list"
        scrollDisabled={constraints?.active}
        height={listHeight}
        width={width}
        itemCount={listCount}
        itemData={{ ...commonItemData, listCount }}
        itemSize={itemHeight}
        onItemsRendered={(renderProps) => {
          setCurrentScrollIndex({ start: renderProps.visibleStartIndex, stop: renderProps.visibleStopIndex });
          if (scrollState) {
            scrollState.setScrollPos(renderProps.visibleStopIndex);
          }
          handleSetOverflowDisclaimer({
            renderProps,
            layoutOptions,
            maxCount: sizes.maxCount,
            columnCount,
            rowCount,
            overflowDisclaimer,
            qCardinal: layout?.qListObject?.qDimensionInfo?.qCardinal,
            dataOffset: local.current.dataOffset,
          });
          onItemsRendered({ ...renderProps });
        }}
        ref={ref}
      >
        {RowColumn}
      </StyledFixedSizeList>
    );
  };

  const Grid = ({ onItemsRendered, ref }) => {
    const { overflowStyling, scrollBarWidth } = sizes;
    const { layoutOrder } = layoutOptions || {};
    const gridHeight = Math.min(listHeight, rowCount * itemHeight + scrollBarWidth);
    // eslint-disable-next-line no-param-reassign
    local.current.listRef = ref;

    const handleGridItemsRendered = (renderProps) => {
      const isRow = layoutOrder === 'row';
      setCurrentScrollIndex({
        start: isRow ? renderProps.visibleRowStartIndex : renderProps.visibleColumnStartIndex,
        stop: isRow ? renderProps.visibleRowStopIndex : renderProps.visibleColumnStopIndex,
      });
      const renderOptions = deriveRenderOptions({
        renderProps,
        scrollState,
        layoutOrder,
        rowCount,
        columnCount,
      });
      handleSetOverflowDisclaimer({
        renderProps,
        layoutOptions,
        maxCount: sizes.maxCount,
        columnCount,
        rowCount,
        overflowDisclaimer,
        qCardinal: layout?.qListObject?.qDimensionInfo?.qCardinal,
        dataOffset: local.current.dataOffset,
      });
      onItemsRendered(renderOptions);
    };

    return (
      <StyledFixedSizeGrid
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...commonComponentOptions}
        dataTestid="fixed-size-grid"
        scrollDisabled={constraints?.active}
        height={gridHeight}
        width={width}
        columnCount={columnCount}
        columnWidth={columnWidth}
        rowCount={rowCount}
        rowHeight={itemHeight}
        style={{ ...overflowStyling }}
        itemData={{
          ...commonItemData,
          column: undefined,
          columnCount,
          rowCount,
        }}
        onItemsRendered={handleGridItemsRendered}
        ref={ref}
      >
        {RowColumn}
      </StyledFixedSizeGrid>
    );
  };

  return { List, Grid };
}
