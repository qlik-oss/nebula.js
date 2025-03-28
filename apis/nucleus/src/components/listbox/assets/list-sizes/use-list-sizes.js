import calculateColumnMode from './column-mode';
import calculateRowMode from './row-mode';
import {
  ITEM_MAX_WIDTH,
  ITEM_MIN_WIDTH,
  SCROLL_BAR_WIDTH,
  CHECKBOX_WIDTH,
  REMOVE_TICK_LIMIT,
  GRID_ITEM_PADDING,
} from '../../constants';
import useTextWidth from '../../hooks/useTextWidth';
import getMeasureText from '../measure-text';
import getItemHeight from './item-height';

export default function useListSizes({ layout, width, height, listCount, count, freqIsAllowed, checkboxes, styles }) {
  const { layoutOptions = {} } = layout || {};
  const { layoutOrder, maxVisibleRows = {}, maxVisibleColumns, dense, dataLayout } = layoutOptions;

  const { fontSize = '12px', fontFamily = 'Source sans pro' } = styles?.content || {};
  const font = `${fontSize} ${fontFamily}`; // font format as supported by HTML canvas
  const textWidth = useTextWidth({ text: getMeasureText(layout), font });
  const freqMinWidth = useTextWidth({ text: getMeasureText(5), font });
  const freqMaxWidth = useTextWidth({ text: getMeasureText(8), font });
  const frequencyAddWidth = freqIsAllowed ? freqMinWidth : 0;
  const checkboxAddWidth = checkboxes ? CHECKBOX_WIDTH : 0;
  const tickIconWidth = CHECKBOX_WIDTH;

  let dynamicItemMinWidth = ITEM_MIN_WIDTH + frequencyAddWidth + checkboxAddWidth;
  if (!checkboxes && dynamicItemMinWidth >= REMOVE_TICK_LIMIT) {
    dynamicItemMinWidth += tickIconWidth;
  }

  let columnAutoWidth = textWidth + 18 + frequencyAddWidth + checkboxAddWidth;
  if (!checkboxes && columnAutoWidth >= REMOVE_TICK_LIMIT) {
    columnAutoWidth += tickIconWidth;
  }
  columnAutoWidth = Math.min(ITEM_MAX_WIDTH, Math.max(columnAutoWidth, dynamicItemMinWidth));

  let overflowStyling;
  let columnCount;
  let columnWidth;
  let rowCount;
  const isGridMode = dataLayout === 'grid';

  const itemHeight = getItemHeight({ isGridMode, dense });

  const listHeight = height ?? 8 * itemHeight;

  if (layoutOrder) {
    // Modify container width to achieve the exact design with 8px margins on each side (left and right).
    let containerWidth = width;

    if (layoutOrder === 'row') {
      overflowStyling = { overflowX: 'hidden' };
      containerWidth += GRID_ITEM_PADDING * 2;
      ({ rowCount, columnWidth, columnCount } = calculateRowMode({
        maxVisibleColumns,
        listCount,
        containerWidth,
        columnAutoWidth,
        itemMinWidth: dynamicItemMinWidth,
      }));
    } else {
      overflowStyling = { overflowY: 'hidden' };

      ({ rowCount, columnWidth, columnCount } = calculateColumnMode({
        maxVisibleRows,
        itemHeight,
        listCount,
        listHeight,
        columnAutoWidth,
        containerWidth,
        itemMinWidth: dynamicItemMinWidth,
      }));
    }
  }

  columnCount = (dataLayout === 'singleColumn' ? 1 : columnCount) || 1;
  rowCount = (dataLayout === 'singleColumn' ? count : rowCount) || listCount;
  const maxRowCount = layoutOptions.dense ? 838000 : 577000; // Styling breaks on items above this number: https://github.com/bvaughn/react-window/issues/659
  rowCount = Math.min(rowCount, maxRowCount);
  const maxScrollWidth = 33550000; // Styling breaks on items above this width: https://github.com/bvaughn/react-window/issues/659
  const maxColumnCount = Math.floor(maxScrollWidth / columnWidth);
  columnCount = Math.min(columnCount, maxColumnCount) || 1;

  const maxListCount = rowCount * columnCount;
  const limitedListCount = Math.min(listCount, maxListCount);

  return {
    columnCount,
    columnWidth,
    rowCount,
    overflowStyling,
    itemHeight,
    listHeight,
    listWidth: width,
    scrollBarWidth: SCROLL_BAR_WIDTH,
    count,
    listCount: limitedListCount,
    maxCount: { row: maxRowCount, column: maxColumnCount },
    itemPadding: GRID_ITEM_PADDING,
    textWidth,
    freqMinWidth,
    freqMaxWidth,
  };
}
