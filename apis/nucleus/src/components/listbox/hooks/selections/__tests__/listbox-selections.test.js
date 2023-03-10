/* eslint-disable prettier/prettier */
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

  describe('selectValues should call the select method', () => {
    let selections;

    beforeEach(() => {
      const SUCCESS = true;
      selections = {
        cancel: jest.fn(),
        clear: jest.fn(),
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

    test('should catch errors in backend call', async () => {
      selections.select.mockRejectedValue('error');
      await expect(async () => {
        await listboxSelections.selectValues({
          selections,
          elemNumbers: [4],
          isSingleSelect: false,
        });
      }).not.toThrow();
    });

    test('should call select', async () => {
      const successStory = await listboxSelections.selectValues({ selections, elemNumbers: [1, 2, 4], toggle: true });
      expect(successStory).toBe(true);
      expect(selections.select).toHaveBeenCalledTimes(1);
      expect(selections.select).toHaveBeenCalledWith({
        method: 'selectListObjectValues',
        params: ['/qListObjectDef', [1, 2, 4], true],
      });
    });

    test('should call select with toggle', async () => {
      const successStory = await listboxSelections.selectValues({ selections, elemNumbers: [2], toggle: false });
      expect(successStory).toBe(true);
      expect(selections.select).toHaveBeenCalledTimes(1);
      expect(selections.select).toHaveBeenCalledWith({
        method: 'selectListObjectValues',
        params: ['/qListObjectDef', [2], false],
      });
    });

    test('should not call select when NaN values exist', async () => {
      const successStory = await listboxSelections.selectValues({ selections, elemNumbers: [1, NaN, 4], toggle: true });
      expect(successStory).toBe(false);
      expect(selections.select).not.toHaveBeenCalled();
    });

    test('should handle select failure and then resolve false', async () => {
      selections.select.mockRejectedValue(false);
      const successStory = await listboxSelections.selectValues({ selections, elemNumbers: [1, 2, 4], toggle: true });
      expect(successStory).toBe(false);
      expect(selections.select).toHaveBeenCalledTimes(1);
    });

    test('should call clear on failed select', async () => {
      selections.select.mockResolvedValue(false);
      const successStory = await listboxSelections.selectValues({
        selections,
        elemNumbers: [1, 2, 4],
        toggle: true,
        isSingleSelect: false,
      });
      expect(successStory).toBe(false);
      expect(selections.clear).toHaveBeenCalledTimes(1);
    });

    test('should call cancel on failed select when isSingleSelect is true', async () => {
      selections.select.mockResolvedValue(false);
      const successStory = await listboxSelections.selectValues({
        selections,
        elemNumbers: [1, 2, 4],
        toggle: true,
        isSingleSelect: true,
      });
      expect(successStory).toBe(false);
      expect(selections.cancel).toHaveBeenCalledTimes(1);
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
