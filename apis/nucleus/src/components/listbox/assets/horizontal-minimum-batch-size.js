export default function getHorizontalMinBatchSize({ width, columnWidth, listHeight, itemSize }) {
  const visibleCellsCount = Math.ceil(width / columnWidth) * Math.ceil(listHeight / itemSize);
  const minSize = visibleCellsCount * 2;
  return minSize;
}
