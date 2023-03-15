const scrollBarWidth = 10; // TODO: ignore this - instead set the styling only show on hover...

const ITEM_MAX_WIDTH = 150;
const FREQUENCY_WIDTH = 40;

const ITEM_MIN_WIDTH = 56;

function calculateRowMode({ maxVisibleColumns, listCount, containerWidth, columnAutoWidth }) {
  const maxColumns = maxVisibleColumns?.maxColumns || 3;
  const innerWidth = containerWidth - scrollBarWidth;

  let columnCount;
  if (maxVisibleColumns?.auto !== false) {
    columnCount = Math.min(listCount, Math.ceil(innerWidth / Math.max(ITEM_MIN_WIDTH, columnAutoWidth))); // TODO: smarter sizing... based on glyph count + font size etc...??
  } else {
    columnCount = Math.min(listCount, maxColumns);
  }
  const columnWidth = innerWidth / columnCount;
  if (columnWidth < ITEM_MIN_WIDTH && !maxVisibleColumns.auto) {
    // when columnWidth is too low, fall back to auto mode.
    return calculateRowMode({
      maxVisibleColumns: { ...maxVisibleColumns, auto: true },
      listCount,
      containerWidth,
      columnAutoWidth,
    });
  }
  const rowCount = Math.ceil(listCount / columnCount);
  return {
    rowCount,
    columnWidth,
    columnCount,
  };
}

function calculateColumnMode({ maxVisibleRows, itemHeight, listCount, listHeight, columnAutoWidth, containerWidth }) {
  let rowCount;
  const maxRows = maxVisibleRows?.maxRows || 3;
  if (maxVisibleRows.auto !== false) {
    rowCount = Math.floor(listHeight / itemHeight);
  } else {
    rowCount = Math.min(listCount, maxRows);
  }

  const columnCount = Math.ceil(listCount / rowCount);
  const columnWidth = Math.max(columnAutoWidth, containerWidth / columnCount, ITEM_MIN_WIDTH);

  return {
    columnWidth,
    columnCount,
    rowCount,
  };
}

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
  let itemHeight = dense ? denseItemSize : normalItemSize;

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
    scrollBarWidth,
    count,
    listCount: limitedListCount,
    maxCount: { row: maxRowCount, column: maxColumnCount },
    itemPadding,
    frequencyWidth: FREQUENCY_WIDTH,
  };
}
