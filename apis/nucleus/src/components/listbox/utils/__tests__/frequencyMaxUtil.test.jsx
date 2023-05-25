import { getFrequencyMaxExpression, getFrequencyMaxGlyphCount } from '../frequencyMaxUtil';

const getPages = (inclFreq = true) => {
  const pages = [
    {
      qArea: { qTop: 0, qHeight: 4 },
      qMatrix: [
        [{ qFrequency: inclFreq && '12' }],
        [{ qFrequency: inclFreq && '1' }],
        [{ qFrequency: inclFreq && '1' }],
        [{ qFrequency: inclFreq && '12345' }],
      ],
    },
    {
      qArea: { qTop: 4, qHeight: 4 },
      qMatrix: [
        [{ qFrequency: inclFreq && '1' }],
        [{ qFrequency: inclFreq && '1' }],
        [{ qFrequency: inclFreq && '1' }],
        [{ qFrequency: inclFreq && '1234' }],
      ],
    },
  ];
  return pages;
};

describe('frequencyMaxUtil', () => {
  describe('getFrequencyMaxExpression', () => {
    test('should create correct expression and wrap and escape field if needed', async () => {
      const result = getFrequencyMaxExpression('dimension with ] in it');

      expect(result).toEqual('Max(AGGR(Count([dimension with ]] in it]), [dimension with ]] in it]))');
    });
  });

  describe('getFrequencyMaxGlyphCount', () => {
    test('should extract number from the item with the longest frequency string', () => {
      const pages = getPages(true);
      const maxCount = getFrequencyMaxGlyphCount(pages);
      expect(maxCount).toBe(5);
    });

    test('should return 0 if no qFrequency values are present', () => {
      const pages = getPages(false);
      const maxCount = getFrequencyMaxGlyphCount(pages);
      expect(maxCount).toBe(0);
    });

    test('should pick up qFrequency even if only one value is present', () => {
      const pages = getPages(false);
      pages[0].qMatrix[2][0].qFrequency = '123';
      const maxCount = getFrequencyMaxGlyphCount(pages);
      expect(maxCount).toBe(3);
    });
  });
});
