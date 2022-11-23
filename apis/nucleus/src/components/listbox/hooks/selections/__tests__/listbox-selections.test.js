import * as listboxSelections from '../listbox-selections';

describe('use-listbox-interactions', () => {
  test('getUniques should return unique values', () => {
    expect(listboxSelections.getUniques([1, 1, 2, 5, 7, 7, 7, 1000000, 1000000])).toEqual([1, 2, 5, 7, 1000000]);
    expect(listboxSelections.getUniques([])).toEqual([]);
    expect(listboxSelections.getUniques(['hey hey', 'hey hey'])).toEqual(['hey hey']);
    expect(listboxSelections.getUniques(undefined)).toBe(undefined);
    expect(listboxSelections.getUniques(null)).toBe(undefined);
    expect(listboxSelections.getUniques({})).toBe(undefined);
  });

  test('getSelectedValues should return unique values', () => {
    const pages = [
      {
        qMatrix: [
          [{ qState: 'S', qElemNumber: 0 }],
          [{ qState: 'XS', qElemNumber: 1 }],
          [{ qState: 'L', qElemNumber: 2 }],
          [{ qState: 'A', qElemNumber: 3 }],
          [{ qState: 'XL', qElemNumber: 4 }],
          [{ qState: 'XS', qElemNumber: 5 }],
          [{ qState: 'A', qElemNumber: 6 }],
        ],
      },
    ];

    expect(listboxSelections.getSelectedValues(undefined)).toEqual([]);
    expect(listboxSelections.getSelectedValues(pages)).toEqual([0, 1, 5]);
  });

  describe('applySelectionsOnPages should modify pages so that selections are applied', () => {
    let pages;

    beforeEach(() => {
      pages = [
        {
          qMatrix: [
            [{ qState: 'S', qElemNumber: 0 }],
            [{ qState: 'XS', qElemNumber: 1 }],
            [{ qState: 'L', qElemNumber: 2 }],
            [{ qState: 'A', qElemNumber: 3 }],
            [{ qState: 'XL', qElemNumber: 4 }],
            [{ qState: 'XS', qElemNumber: 5 }],
            [{ qState: 'A', qElemNumber: 6 }],
          ],
        },
      ];
    });

    test('should add selection for element number 2', () => {
      const selectedPages = listboxSelections.applySelectionsOnPages(pages, [2]);
      expect(selectedPages).toEqual([
        {
          qMatrix: [
            [{ qState: 'S', qElemNumber: 0 }, []],
            [{ qState: 'XS', qElemNumber: 1 }, []],
            [{ qState: 'S', qElemNumber: 2 }, []],
            [{ qState: 'A', qElemNumber: 3 }, []],
            [{ qState: 'XL', qElemNumber: 4 }, []],
            [{ qState: 'XS', qElemNumber: 5 }, []],
            [{ qState: 'A', qElemNumber: 6 }, []],
          ],
        },
      ]);
    });

    test('should toggle selection (turn it off)', () => {
      const selectedPages = listboxSelections.applySelectionsOnPages(pages, [0]);
      expect(selectedPages).toEqual([
        {
          qMatrix: [
            [{ qState: 'A', qElemNumber: 0 }, []],
            [{ qState: 'XS', qElemNumber: 1 }, []],
            [{ qState: 'L', qElemNumber: 2 }, []],
            [{ qState: 'A', qElemNumber: 3 }, []],
            [{ qState: 'XL', qElemNumber: 4 }, []],
            [{ qState: 'XS', qElemNumber: 5 }, []],
            [{ qState: 'A', qElemNumber: 6 }, []],
          ],
        },
      ]);
    });

    test('should select a range without toggling any already selected values', () => {
      const selectedPages = listboxSelections.applySelectionsOnPages(pages, [0, 1, 2, 3, 4, 5]);
      expect(selectedPages).toEqual([
        {
          qMatrix: [
            [{ qState: 'S', qElemNumber: 0 }, []],
            [{ qState: 'S', qElemNumber: 1 }, []],
            [{ qState: 'S', qElemNumber: 2 }, []],
            [{ qState: 'S', qElemNumber: 3 }, []],
            [{ qState: 'S', qElemNumber: 4 }, []],
            [{ qState: 'S', qElemNumber: 5 }, []],
            [{ qState: 'A', qElemNumber: 6 }, []],
          ],
        },
      ]);
    });

    test('should deselect all exept the new selection', () => {
      const clearAllButElmNumbers = true;
      const selectedPages = listboxSelections.applySelectionsOnPages(pages, [3], clearAllButElmNumbers);
      expect(selectedPages).toEqual([
        {
          qMatrix: [
            [{ qState: 'A', qElemNumber: 0 }, []],
            [{ qState: 'A', qElemNumber: 1 }, []],
            [{ qState: 'A', qElemNumber: 2 }, []],
            [{ qState: 'S', qElemNumber: 3 }, []],
            [{ qState: 'A', qElemNumber: 4 }, []],
            [{ qState: 'A', qElemNumber: 5 }, []],
            [{ qState: 'A', qElemNumber: 6 }, []],
          ],
        },
      ]);
    });
  });

  describe('selectValues should call the select method', () => {
    let selections;

    beforeEach(() => {
      const SUCCESS = true;
      selections = {
        select: jest.fn().mockResolvedValue(SUCCESS),
      };
    });

    test('should abort if nan values exist', async () => {
      const promise = listboxSelections.selectValues({
        selections,
        elemNumbers: [1, 2, NaN, 4],
        isSingleSelect: false,
      });
      expect(typeof promise.then).toBe('function');
      const resp = await promise;
      expect(resp).toBe(false);
      expect(selections.select).not.toHaveBeenCalled();
    });

    test('should call select', async () => {
      const resp = await listboxSelections.selectValues({
        selections,
        elemNumbers: [1, 2, 3, 4],
        isSingleSelect: false,
      });
      expect(resp).toBe(true);
      expect(selections.select).toHaveBeenCalledTimes(1);
      expect(selections.select).toHaveBeenCalledWith({
        method: 'selectListObjectValues',
        params: ['/qListObjectDef', [1, 2, 3, 4], true],
      });
    });

    test('single select true should translate to toggle false', async () => {
      const resp = await listboxSelections.selectValues({
        selections,
        elemNumbers: [4],
        isSingleSelect: true,
      });
      expect(resp).toBe(true);
      expect(selections.select).toHaveBeenCalledTimes(1);
      expect(selections.select).toHaveBeenCalledWith({
        method: 'selectListObjectValues',
        params: ['/qListObjectDef', [4], false],
      });
    });

    test('should catch errors in backend call', async () => {
      selections.select.mockRejectedValue('error');
      expect(async () => {
        await listboxSelections.selectValues({
          selections,
          elemNumbers: [4],
          isSingleSelect: false,
        });
      }).not.toThrow();
    });

    test('should call select', () => {
      listboxSelections
        .selectValues({ selections, elemNumbers: [1, 2, 4], isSingleSelect: false })
        .then((successStory) => {
          expect(successStory).toBe(true);
        });
      expect(selections.select).toHaveBeenCalledTimes(1);
      expect(selections.select).toHaveBeenCalledWith({
        method: 'selectListObjectValues',
        params: ['/qListObjectDef', [1, 2, 4], true],
      });
    });

    test('should call select with toggle false when single select', () => {
      listboxSelections.selectValues({ selections, elemNumbers: [2], isSingleSelect: true }).then((successStory) => {
        expect(successStory).toBe(true);
      });
      expect(selections.select).toHaveBeenCalledTimes(1);
      expect(selections.select).toHaveBeenCalledWith({
        method: 'selectListObjectValues',
        params: ['/qListObjectDef', [2], false],
      });
    });

    test('should not call select when NaN values exist', () => {
      listboxSelections
        .selectValues({ selections, elemNumbers: [1, NaN, 4], isSingleSelect: false })
        .then((successStory) => {
          expect(successStory).toBe(false);
        });
      expect(selections.select).not.toHaveBeenCalled();
    });

    test('should handle select failure and then resolve false', () => {
      selections.select.mockRejectedValue(false);
      listboxSelections
        .selectValues({ selections, elemNumbers: [1, 2, 4], isSingleSelect: false })
        .then((successStory) => {
          expect(successStory).toBe(false);
        });
      expect(selections.select).toHaveBeenCalledTimes(1);
    });
  });

  describe('getElemNumbersFromPages', () => {
    let pages;

    beforeEach(() => {
      pages = [
        {
          qMatrix: [
            [{ qState: 'S', qElemNumber: 0 }],
            [{ qState: 'XS', qElemNumber: 1 }],
            [{ qState: 'L', qElemNumber: 2 }],
            [{ qState: 'A', qElemNumber: 3 }],
            [{ qState: 'XL', qElemNumber: 4 }],
            [{ qState: 'XS', qElemNumber: 5 }],
            [{ qState: 'A', qElemNumber: 6 }],
          ],
        },
      ];
    });

    test('listboxSelections', () => {
      expect(listboxSelections.getElemNumbersFromPages(undefined)).toEqual([]);
      const resp = listboxSelections.getElemNumbersFromPages(pages);
      expect(resp).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });
  });

  describe('fillRange', () => {
    test('should fill the numbers according to ground-truth array', () => {
      expect(listboxSelections.fillRange([], [])).toEqual([]);
      expect(listboxSelections.fillRange([1, 10], [])).toEqual([]);

      expect(listboxSelections.fillRange([0, 5], [0, 1, 2, 3, 4, 5, 6])).toEqual([0, 1, 2, 3, 4, 5]);
      expect(listboxSelections.fillRange([0], [0, 1, 2, 3, 4, 5, 6])).toEqual([0]);
      expect(listboxSelections.fillRange([], [0, 1, 2, 3, 4, 5, 6])).toEqual([]);
      expect(listboxSelections.fillRange([1, 6], [0, 1, 8, 16, 6, 2])).toEqual([1, 8, 16, 6]);
    });
  });
});
