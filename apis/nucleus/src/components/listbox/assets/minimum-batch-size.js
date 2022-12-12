export default function getMinimumBatchSize({ isVertical, width, columnWidth, listHeight, itemSize }) {
  const DEFAULT_BATCH_SIZE = 100;
  let minSize;
  if (isVertical) {
    minSize = DEFAULT_BATCH_SIZE;
  } else {
    const visibleCellsCount = Math.ceil(width / columnWidth) * Math.ceil(listHeight / itemSize);
    minSize = visibleCellsCount * 2;
  }
  return minSize;
}
