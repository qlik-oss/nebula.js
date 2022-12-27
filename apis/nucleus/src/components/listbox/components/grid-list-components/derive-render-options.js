export default function deriveRenderOptions(options) {
  const { renderProps, scrollState, layoutOrder, rowCount, columnCount } = options;

  const {
    overscanRowStartIndex,
    overscanRowStopIndex,
    overscanColumnStartIndex,
    overscanColumnStopIndex,
    visibleStopIndex: initialVisibleStopIndex,
  } = renderProps;

  if (scrollState) {
    scrollState.setScrollPos(initialVisibleStopIndex);
  }

  let toTheLeftOfStart;
  let aboveStart;

  let toTheLeftOfEnd;
  let aboveEnd;

  if (layoutOrder === 'column') {
    toTheLeftOfStart = overscanColumnStartIndex * rowCount;
    aboveStart = overscanRowStartIndex;

    toTheLeftOfEnd = overscanColumnStopIndex * rowCount;
    aboveEnd = overscanRowStopIndex;
  } else {
    toTheLeftOfStart = overscanColumnStartIndex;
    aboveStart = overscanRowStartIndex * columnCount;

    toTheLeftOfEnd = overscanColumnStopIndex;
    aboveEnd = overscanRowStopIndex * columnCount;
  }

  const visibleStartIndex = toTheLeftOfStart + aboveStart;
  const visibleStopIndex = toTheLeftOfEnd + aboveEnd;

  return {
    visibleStartIndex,
    visibleStopIndex,
  };
}
