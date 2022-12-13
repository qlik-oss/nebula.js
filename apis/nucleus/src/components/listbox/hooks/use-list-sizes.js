const scrollBarWidth = 10; // TODO: ignore this - instead set the styling only show on hover...

const getCalculatedHeight = ({ pages = [], minimumBatchSize, count }) => {
  // If values have been filtered in the currently loaded page, we want to
  // prevent rendering empty rows by assigning the actual number of items to render
  // since count (qcy) does not reflect this in DQ mode currently.
  const hasFilteredValues = pages.some((page) => page.qArea.qHeight < minimumBatchSize);
  const h = Math.max(...pages.map((page) => page.qArea.qTop + page.qArea.qHeight));
  const out = hasFilteredValues ? h : count;
  return out;
};

export default function useListSizes({
  layout,
  width,
  height,
  checkboxes,
  pages,
  calculatePagesHeight,
  minimumBatchSize,
  textWidth,
}) {
  const { layoutOptions = {}, qListObject = {} } = layout;

  const count = qListObject.qSize?.qcy;

  const { layoutOrder, maxVisibleRows = {}, maxVisibleColumns, dense } = layoutOptions || {};
  const columnAutoWidth = Math.min(150, textWidth + 18);

  let overflowStyling;
  let columnCount;
  let columnWidth;
  let rowCount;

  let itemSize = checkboxes ? 40 : 33;
  if (dense) {
    itemSize = 20;
  }
  const listHeight = height || 8 * itemSize;
  const listCount =
    pages?.length && calculatePagesHeight ? getCalculatedHeight({ pages, minimumBatchSize, count }) : count;

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
