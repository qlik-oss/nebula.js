const getOffset = (layout, listCount) => {
  const totalLength = layout.qListObject.qDimensionInfo.qCardinal;
  const offset = totalLength - listCount;
  return offset;
};

export default function getScrollIndex({ position, isRow, sizes, layout, offset }) {
  let scrollIndex;
  let triggerRerender = false;
  let newOffset = offset ?? 0;
  switch (position) {
    case 'start':
      scrollIndex = 0;
      break;
    case 'end':
      scrollIndex = isRow ? sizes.rowCount : sizes.columnCount;
      break;
    case 'overflowStart':
      newOffset = 0;
      scrollIndex = 0;
      triggerRerender = true;
      break;
    case 'overflowEnd':
      newOffset = getOffset(layout, sizes.listCount);
      scrollIndex = layout.qListObject.qDimensionInfo.qCardinal;
      triggerRerender = true;
      break;
    default:
      break;
  }

  return { scrollIndex, offset: newOffset, triggerRerender };
}
