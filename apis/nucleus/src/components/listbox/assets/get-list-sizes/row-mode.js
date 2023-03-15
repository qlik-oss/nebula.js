import { ITEM_MIN_WIDTH, SCROLL_BAR_WIDTH } from './constants';

export default function calculateRowMode({ maxVisibleColumns, listCount, containerWidth, columnAutoWidth }) {
  const maxColumns = maxVisibleColumns?.maxColumns || 3;
  const innerWidth = containerWidth - SCROLL_BAR_WIDTH;

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
