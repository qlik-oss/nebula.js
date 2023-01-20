const getIndex = (renderProps, isColumnLayout) => {
  if (renderProps?.visibleRowStopIndex || renderProps.visibleColumnStopIndex) {
    return isColumnLayout ? renderProps.visibleColumnStopIndex : renderProps.visibleRowStopIndex;
  }
  return renderProps.visibleStopIndex;
};

export default function handleSetOverflowDisclaimer({
  renderProps,
  layoutOptions,
  maxCount,
  columnCount,
  rowCount,
  overflowDisclaimer,
}) {
  const isColumnLayout = layoutOptions?.layoutOrder === 'column' && layoutOptions.dataLayout !== 'singleColumn';
  const index = getIndex(renderProps, isColumnLayout);
  const stopIndex = isColumnLayout ? maxCount.column : maxCount.row;
  const count = isColumnLayout ? columnCount : rowCount;
  const overflowPossible = count >= stopIndex;
  if (!overflowPossible && overflowDisclaimer.state.show) {
    overflowDisclaimer.set({ show: false });
  } else if (index >= stopIndex - 1) {
    overflowDisclaimer.set({ show: true });
  }
}
