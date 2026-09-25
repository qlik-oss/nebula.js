import compactSelectedPages from '../compact-selected-pages';

describe('compactSelectedPages', () => {
  const dimCell = (qElemNumber, qState, qText = `v${qElemNumber}`) => ({ qElemNumber, qState, qText });

  it('keeps only selected and locked values, dropping optional/alternative/excluded ones', () => {
    const pages = [
      {
        qArea: { qLeft: 0, qTop: 0, qWidth: 1, qHeight: 5 },
        qMatrix: [[dimCell(0, 'S')], [dimCell(1, 'L')], [dimCell(2, 'O')], [dimCell(3, 'A')], [dimCell(4, 'X')]],
      },
    ];

    const [page] = compactSelectedPages(pages, 1);

    expect(page.qMatrix.map((row) => row[0].qElemNumber)).toEqual([0, 1]);
    expect(page.qArea).toEqual({ qLeft: 0, qTop: 0, qWidth: 1, qHeight: 2 });
  });

  it('deduplicates by qElemNumber so values with duplicate labels are not repeated', () => {
    const pages = [
      {
        qArea: { qLeft: 0, qTop: 0, qWidth: 1, qHeight: 3 },
        // Two distinct values (0 and 1) share the same display text 'Amadeus'; value 0 also appears
        // twice across overlapping pages.
        qMatrix: [[dimCell(0, 'S', 'Amadeus')], [dimCell(1, 'S', 'Amadeus')], [dimCell(0, 'S', 'Amadeus')]],
      },
    ];

    const [page] = compactSelectedPages(pages, 1);

    expect(page.qMatrix.map((row) => row[0].qElemNumber)).toEqual([0, 1]);
    expect(page.qArea.qHeight).toBe(2);
  });

  it('merges selected rows across multiple pages and preserves expression columns', () => {
    const pages = [
      { qArea: { qLeft: 0, qTop: 0, qWidth: 2, qHeight: 1 }, qMatrix: [[dimCell(0, 'S'), { qText: 'url-0' }]] },
      { qArea: { qLeft: 0, qTop: 1, qWidth: 2, qHeight: 1 }, qMatrix: [[dimCell(1, 'L'), { qText: 'url-1' }]] },
    ];

    const [page] = compactSelectedPages(pages, 2);

    expect(page.qMatrix).toHaveLength(2);
    expect(page.qMatrix[0][1].qText).toBe('url-0');
    expect(page.qMatrix[1][1].qText).toBe('url-1');
    expect(page.qArea.qWidth).toBe(2);
  });

  it('falls back to qText for the dedup key when qElemNumber is missing', () => {
    const pages = [
      {
        qArea: { qLeft: 0, qTop: 0, qWidth: 1, qHeight: 2 },
        qMatrix: [[{ qState: 'S', qText: 'same' }], [{ qState: 'S', qText: 'same' }]],
      },
    ];

    const [page] = compactSelectedPages(pages, 1);

    expect(page.qMatrix).toHaveLength(1);
  });

  it('returns an empty single page when there are no pages or no selected values', () => {
    expect(compactSelectedPages(undefined, 1)).toEqual([
      { qArea: { qLeft: 0, qTop: 0, qWidth: 1, qHeight: 0 }, qMatrix: [] },
    ]);
    expect(compactSelectedPages([{ qMatrix: [[dimCell(0, 'O')]] }], 1)[0].qMatrix).toEqual([]);
  });
});
