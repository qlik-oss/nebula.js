const getIndex = (renderProps, isColumnLayout) => {
  if (renderProps?.visibleRowStopIndex || renderProps.visibleColumnStopIndex) {
    return isColumnLayout ? renderProps.visibleColumnStopIndex : renderProps.visibleRowStopIndex;
  }
  return renderProps.visibleStopIndex;
};

const getIsScrollTop = (renderProps, isColumnLayout) => {
  if (renderProps?.visibleRowStartIndex !== undefined || renderProps.visibleColumnStartIndex !== undefined) {
    return isColumnLayout ? renderProps.visibleColumnStartIndex === 0 : renderProps.visibleRowStartIndex === 0;
  }
  return renderProps.visibleStartIndex === 0;
};

const getIsEndOfData = (qCardinal, index, count, dataOffset) => qCardinal === index * count + count + dataOffset;

export default function handleSetOverflowDisclaimer({
  renderProps,
  layoutOptions,
  maxCount,
  columnCount,
  rowCount,
  overflowDisclaimer,
  qCardinal,
  dataOffset,
}) {
  const isColumnLayout = layoutOptions?.layoutOrder === 'column' && layoutOptions.dataLayout !== 'singleColumn';
  const index = getIndex(renderProps, isColumnLayout);
  const stopIndex = isColumnLayout ? maxCount.column : maxCount.row;
  const count = isColumnLayout ? columnCount : rowCount;
  const overflowPossible = count >= stopIndex;
  const isEndOfData = getIsEndOfData(qCardinal, index, isColumnLayout ? rowCount : columnCount, dataOffset);
  const isTopOfOverflowData = !!dataOffset && getIsScrollTop(renderProps, isColumnLayout);

  const show =
    (overflowPossible && !isEndOfData && index >= stopIndex - 1) ||
    isTopOfOverflowData ||
    overflowDisclaimer.state.show; // If its shown once, the user have to dismiss to hide it.
  overflowDisclaimer.set(show);
}
