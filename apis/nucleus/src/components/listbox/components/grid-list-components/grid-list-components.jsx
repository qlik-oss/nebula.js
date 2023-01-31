/* eslint-disable react/function-component-definition */
import React from 'react';
import RowColumn from '../ListBoxRowColumn';
import getFrequencyAllowed from './frequency-allowed';
import deriveRenderOptions from './derive-render-options';
import getStyledComponents, { classes } from './styled-components';
import handleSetOverflowDisclaimer from './set-overflow-disclaimer';

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
  textAlign,
  selections,
  keyboard,
  showGray,
  scrollState,
  direction,
  listLayout,
  sizes,
  listCount,
  overflowDisclaimer,
  setScrollPosition,
  focusListItems,
}) {
  const { layoutOptions = {}, frequencyMax } = layout || {};
  const { dense = false } = layoutOptions || {};
  const { listHeight, itemSize, rowCount, columnCount } = sizes || {};

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
    dense,
    frequencyMode,
    freqIsAllowed: getFrequencyAllowed({ width, layout, frequencyMode }),
    isSingleSelect,
    textAlign,
    actions: {
      select,
      confirm: () => selections?.confirm.call(selections),
      cancel: () => selections?.cancel.call(selections),
      setScrollPosition,
    },
    frequencyMax,
    histogram,
    keyboard,
    showGray,
    dataOffset: local.current.dataOffset,
    focusListItems,
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
        itemData={{ ...commonItemData, listCount }}
        itemSize={itemSize}
        onItemsRendered={(renderProps) => {
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
    const { columnWidth, overflowStyling, scrollBarWidth } = sizes;
    const { layoutOrder } = layoutOptions || {};
    const gridHeight = Math.min(listHeight, rowCount * itemSize + scrollBarWidth);
    // eslint-disable-next-line no-param-reassign
    local.current.listRef = ref;

    const handleGridItemsRendered = (renderProps) => {
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
        height={gridHeight}
        width={width}
        columnCount={columnCount}
        columnWidth={columnWidth}
        rowCount={rowCount}
        rowHeight={itemSize}
        style={{ ...overflowStyling }}
        itemData={{
          ...commonItemData,
          column: undefined,
          columnCount,
          rowCount,
          layoutOrder,
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
