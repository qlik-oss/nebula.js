// Returns the full qMatrix row for a given list index. With list-object `qExpressions`, a row
// holds more than the dimension cell: [dimensionCell, exprCell0, exprCell1, ...].
export default function getRowFromPages({ pages, cellIndex }) {
  const page = pages?.find((p) => p.qArea.qTop <= cellIndex && cellIndex < p.qArea.qTop + p.qArea.qHeight);
  if (page) {
    const area = page.qArea;
    if (cellIndex >= area.qTop && cellIndex < area.qTop + area.qHeight) {
      return page.qMatrix[cellIndex - area.qTop];
    }
  }
  return undefined;
}
