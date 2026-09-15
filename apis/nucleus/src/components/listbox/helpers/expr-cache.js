// Per-value list-object expressions (qListObjectDef.qExpressions) arrive as extra data columns:
// qMatrix[row] = [dimensionCell, exprCell0, ...]. Map an expression's qLabel (e.g. 'imageUrl') to
// its column index (offset by 1 for the dimension column).
export function getListExprIndex(layout) {
  return (layout?.qListObject?.qExpressions || []).reduce((acc, expr, i) => {
    acc[expr.qLabel] = i + 1;
    return acc;
  }, {});
}

// Write a non-empty per-value expression result into the shared cache, keyed by the dimension
// value's stable identity (valueKey), and return the current (cached-or-just-written) value. A
// null/empty raw (e.g. the engine excluding this value from the current selection) leaves the
// previously cached value untouched rather than clobbering it.
export function cacheExprValue(exprCache, key, valueKey, raw) {
  // eslint-disable-next-line no-param-reassign
  const bucket = exprCache[key] || (exprCache[key] = {});
  if (raw != null && raw !== '') {
    bucket[valueKey] = raw;
  }
  return bucket[valueKey];
}
