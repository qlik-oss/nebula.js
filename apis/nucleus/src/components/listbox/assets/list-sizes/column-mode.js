export default function calculateColumnMode({
  maxVisibleRows,
  itemHeight,
  listCount,
  listHeight,
  columnAutoWidth,
  containerWidth,
  itemMinWidth,
}) {
  let rowCount;
  const maxRows = maxVisibleRows?.maxRows || 3;
  const autoRowCount = Math.floor(listHeight / itemHeight);
  if (maxVisibleRows.auto !== false) {
    rowCount = autoRowCount;
  } else {
    rowCount = Math.min(listCount, maxRows, autoRowCount);
  }

  rowCount = Math.max(rowCount, 1);

  const columnCount = Math.ceil(listCount / rowCount);
  const columnWidth = Math.max(columnAutoWidth, containerWidth / columnCount, itemMinWidth);

  return {
    columnWidth,
    columnCount,
    rowCount,
  };
}
