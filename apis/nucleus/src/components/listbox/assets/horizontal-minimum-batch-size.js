export default function getHorizontalMinBatchSize({ width, columnWidth, listHeight, itemHeight }) {
  const visibleCellsCount = Math.ceil(width / columnWidth) * Math.ceil(listHeight / itemHeight);
  const minSize = visibleCellsCount * 2;
  return minSize;
}
