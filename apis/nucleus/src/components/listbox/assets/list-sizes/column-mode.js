import { SCROLL_BAR_WIDTH } from '../../constants';

function computeColumnLayout({
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

export default function calculateColumnMode({
  maxVisibleRows,
  itemHeight,
  listCount,
  listHeight,
  columnAutoWidth,
  containerWidth,
  itemMinWidth,
}) {
  const layout = computeColumnLayout({
    maxVisibleRows,
    itemHeight,
    listCount,
    listHeight,
    columnAutoWidth,
    containerWidth,
    itemMinWidth,
  });

  // A horizontal scrollbar will render when the columns don't fit the container width.
  // Recompute with less height so a row is freed up for the scrollbar, instead of it covering the last row.
  const hasHorizontalOverflow = layout.columnWidth * layout.columnCount - containerWidth > 1;
  if (!hasHorizontalOverflow) {
    return layout;
  }

  return computeColumnLayout({
    maxVisibleRows,
    itemHeight,
    listCount,
    listHeight: listHeight - SCROLL_BAR_WIDTH,
    columnAutoWidth,
    containerWidth,
    itemMinWidth,
  });
}
