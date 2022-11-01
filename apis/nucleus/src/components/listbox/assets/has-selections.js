const getValue = (obj, prop, defaultValue = undefined) => obj?.[prop] ?? defaultValue;

export default function hasSelections(layout) {
  const counts = layout?.qListObject.qDimensionInfo.qStateCounts || {};
  const totalCounts =
    getValue(counts, 'qSelected', 0) +
    getValue(counts, 'qSelectedExcluded', 0) +
    getValue(counts, 'qLocked', 0) +
    getValue(counts, 'qLockedExcluded', 0);
  return totalCounts > 0;
}
