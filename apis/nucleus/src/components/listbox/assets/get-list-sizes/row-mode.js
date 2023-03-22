import { SCROLL_BAR_WIDTH } from '../../constants';

export default function calculateRowMode({
  maxVisibleColumns,
  listCount,
  containerWidth,
  columnAutoWidth,
  itemMinWidth,
}) {
  const maxColumns = maxVisibleColumns?.maxColumns || 3;
  const innerWidth = containerWidth - SCROLL_BAR_WIDTH;

  let columnCount;
  const autoColumnCount = Math.min(
    listCount,
    Math.max(1, Math.floor(innerWidth / Math.max(itemMinWidth, columnAutoWidth)))
  ); // TODO: smarter sizing... based on glyph count + font size etc...??
  if (maxVisibleColumns?.auto !== false) {
    columnCount = autoColumnCount;
  } else {
    columnCount = Math.min(listCount, maxColumns, autoColumnCount);
  }
  const columnWidth = innerWidth / columnCount;
  const rowCount = Math.ceil(listCount / columnCount);
  return {
    rowCount,
    columnWidth,
    columnCount,
  };
}
