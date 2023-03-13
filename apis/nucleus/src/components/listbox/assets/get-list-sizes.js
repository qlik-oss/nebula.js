const scrollBarWidth = 10; // TODO: ignore this - instead set the styling only show on hover...

const ITEM_MIN_WIDTH = 56;
const ITEM_MAX_WIDTH = 150;
const FREQUENCY_WIDTH = 40;

export default function getListSizes({ layout, width, height, listCount, count, textWidth, freqIsAllowed }) {
  const { layoutOptions = {} } = layout || {};
  const { layoutOrder, maxVisibleRows = {}, maxVisibleColumns, dense, dataLayout } = layoutOptions;

  const frequencyAddWidth = freqIsAllowed ? FREQUENCY_WIDTH : 0;

  const columnAutoWidth = Math.max(
    Math.min(ITEM_MAX_WIDTH, textWidth + 18 + frequencyAddWidth),
    ITEM_MIN_WIDTH + frequencyAddWidth
  );

  let overflowStyling;
  let columnCount;
  let columnWidth;
  let rowCount;
  const isGridMode = dataLayout === 'grid';
  const itemPadding = 4;

  const denseItemSize = 20;
  const normalItemSize = isGridMode ? 32 : 29;
  let itemSize = dense ? denseItemSize : normalItemSize;

  if (isGridMode) {
    // Emulate a margin between items using padding, since the list library
    // needs an explicit row height and cannot handle margins.
    itemSize += itemPadding;
  }

  const listHeight = height ?? 8 * itemSize;

  if (layoutOrder) {
    // Modify container width to achieve the exact design, with same margins on the sides.
    let containerWidth = width;

    if (layoutOrder === 'row') {
      const CONTAINER_PADDING_LEFT = 2; // paddingLeft of .listbox-container
      containerWidth += itemPadding * 2 + CONTAINER_PADDING_LEFT;
      overflowStyling = { overflowX: 'hidden' };
      const maxColumns = maxVisibleColumns?.maxColumns || 3;

      if (maxVisibleColumns?.auto !== false) {
        columnCount = Math.min(listCount, Math.ceil((containerWidth - scrollBarWidth) / columnAutoWidth)); // TODO: smarter sizing... based on glyph count + font size etc...??
      } else {
        columnCount = Math.min(listCount, maxColumns);
      }
      rowCount = Math.ceil(listCount / columnCount);
      columnWidth = (containerWidth - scrollBarWidth) / columnCount;
    } else {
      overflowStyling = { overflowY: 'hidden' };
      const maxRows = maxVisibleRows?.maxRows || 3;

      if (maxVisibleRows.auto !== false) {
        rowCount = Math.floor(listHeight / itemSize);
      } else {
        rowCount = Math.min(listCount, maxRows);
      }

      columnCount = Math.ceil(listCount / rowCount);
      columnWidth = Math.max(columnAutoWidth, containerWidth / columnCount);
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
    itemSize,
    listHeight,
    scrollBarWidth,
    count,
    listCount: limitedListCount,
    maxCount: { row: maxRowCount, column: maxColumnCount },
    itemPadding,
    frequencyWidth: FREQUENCY_WIDTH,
  };
}
