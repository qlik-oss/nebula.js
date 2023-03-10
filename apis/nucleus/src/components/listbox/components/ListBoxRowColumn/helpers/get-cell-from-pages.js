export default function getCellFromPages({ pages, cellIndex }) {
  let c;
  const page = pages.filter((p) => p.qArea.qTop <= cellIndex && cellIndex < p.qArea.qTop + p.qArea.qHeight)[0];
  if (page) {
    const area = page.qArea;
    if (cellIndex >= area.qTop && cellIndex < area.qTop + area.qHeight) {
      [c] = page.qMatrix[cellIndex - area.qTop];
    }
  }
  return c;
}
