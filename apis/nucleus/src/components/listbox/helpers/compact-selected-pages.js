// For the image grid's "show selected" mode: once a selection is applied, collapse the loaded
// data pages into a single page that holds only the selected (or locked) values. Selected values
// sort to the top via qSortByState, so the already-loaded top rows are the ones we keep.
const SELECTED_STATES = { S: true, L: true };

export default function compactSelectedPages(pages, dataWidth) {
  const rows = [];
  const seen = new Set();

  (pages || []).forEach((page) => {
    (page?.qMatrix || []).forEach((row) => {
      const dimCell = row?.[0];
      if (!dimCell || !SELECTED_STATES[dimCell.qState]) {
        return;
      }
      const key = dimCell.qElemNumber ?? dimCell.qText;
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      rows.push(row);
    });
  });

  // A single compacted page starting at qTop 0 so getRowFromPages maps index -> qMatrix[index].
  return [
    {
      qArea: { qLeft: 0, qTop: 0, qWidth: dataWidth, qHeight: rows.length },
      qMatrix: rows,
    },
  ];
}
