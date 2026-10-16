// Per-value list-object expressions (qListObjectDef.qExpressions) arrive as extra data columns:
// qMatrix[row] = [dimensionCell, exprCell0, ...]. Map an expression's qLabel (e.g. 'imageUrl') to
// its column index (offset by 1 for the dimension column).
function getListExprIndex(layout) {
  return (layout?.qListObject?.qExpressions || []).reduce((acc, expr, i) => {
    acc[expr.qLabel] = i + 1;
    return acc;
  }, {});
}
export default getListExprIndex;
