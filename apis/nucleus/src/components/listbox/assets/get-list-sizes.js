const scrollBarWidth = 10; // TODO: ignore this - instead set the styling only show on hover...

export default function getListSizes({ layout, width, height, listCount, count, textWidth }) {
  const { layoutOptions = {} } = layout || {};

  const { layoutOrder, maxVisibleRows = {}, maxVisibleColumns, dense, dataLayout } = layoutOptions;
  const columnAutoWidth = Math.min(150, textWidth + 18);

  let overflowStyling;
  let columnCount;
  let columnWidth;
  let rowCount;

  const itemSize = dense ? 20 : 29;
  const listHeight = height || 8 * itemSize;

  if (layoutOrder) {
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
  }
  columnCount = dataLayout === 'singleColumn' ? 1 : columnCount;

  return {
    columnCount,
    columnWidth,
    rowCount,
    overflowStyling,
    itemSize,
    listHeight,
    scrollBarWidth,
    count,
    listCount,
  };
}
