import calculateColumnMode from './column-mode';
import calculateRowMode from './row-mode';
import {
  FREQUENCY_MIN_WIDTH,
  ITEM_MAX_WIDTH,
  ITEM_MIN_WIDTH,
  SCROLL_BAR_WIDTH,
  CHECKBOX_WIDTH,
  REMOVE_TICK_LIMIT,
} from '../../constants';

export default function getListSizes({
  layout,
  width,
  height,
  listCount,
  count,
  textWidth,
  freqIsAllowed,
  checkboxes,
}) {
  const { layoutOptions = {} } = layout || {};
  const { layoutOrder, maxVisibleRows = {}, maxVisibleColumns, dense, dataLayout } = layoutOptions;

  const frequencyAddWidth = freqIsAllowed ? FREQUENCY_MIN_WIDTH : 0;
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
  const itemPadding = 4;

  const denseItemHeight = 20;
  const normalItemHeight = isGridMode ? 32 : 29;
  let itemHeight = dense ? denseItemHeight : normalItemHeight;

  if (isGridMode) {
    // Emulate a margin between items using padding, since the list library
    // needs an explicit row height and cannot handle margins.
    itemHeight += itemPadding;
  }

  const listHeight = height ?? 8 * itemHeight;

  if (layoutOrder) {
    // Modify container width to achieve the exact design with 8px margins on each side (left and right).
    let containerWidth = width;

    if (layoutOrder === 'row') {
      overflowStyling = { overflowX: 'hidden' };
      containerWidth += itemPadding * 2;
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
    scrollBarWidth: SCROLL_BAR_WIDTH,
    count,
    listCount: limitedListCount,
    maxCount: { row: maxRowCount, column: maxColumnCount },
    itemPadding,
  };
}
