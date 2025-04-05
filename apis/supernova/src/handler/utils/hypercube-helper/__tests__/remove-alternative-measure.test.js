import { splitMeasures } from '../hypercube-utils';
import removeAlternativeMeasure from '../remove-alternative-measure';

jest.mock('../hypercube-utils', () => ({
  splitMeasures: jest.fn(),
}));

describe('removeAlternativeMeasures', () => {
  let self;

  beforeEach(() => {
    self = {
      hcProperties: {
        qMeasures: ['meas1', 'meas2'],
        qLayoutExclude: {
          qHyperCubeDef: {
            qMeasures: ['measure1', 'measure2', 'measure3', 'measure4'],
          },
        },
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should remove alternative measures based on indexes', () => {
    const indexes = [1, 3];
    const deletedMeasures = ['measure2', 'measure4'];
    const remainingMeasures = ['measure1', 'measure3'];

    splitMeasures.mockReturnValue([deletedMeasures, remainingMeasures]);

    const result = removeAlternativeMeasure(self, indexes);

    expect(splitMeasures).toHaveBeenCalledWith(self, indexes);
    expect(self.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures).toEqual(remainingMeasures);
    expect(result).toEqual(deletedMeasures);
  });

  test('should not modify measures if indexes are empty', () => {
    const indexes = [];
    const deletedMeasures = [];
    const remainingMeasures = ['measure1', 'measure2', 'measure3', 'measure4'];

    splitMeasures.mockReturnValue([deletedMeasures, remainingMeasures]);

    const result = removeAlternativeMeasure(self, indexes);

    expect(splitMeasures).toHaveBeenCalledWith(self, indexes);
    expect(self.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures).toEqual(remainingMeasures);
    expect(result).toEqual(deletedMeasures);
  });

  test('should handle non-existing indexes', () => {
    const indexes = [5, 6]; // Non-existing indexes
    const deletedMeasures = [];
    const remainingMeasures = ['measure1', 'measure2', 'measure3', 'measure4'];

    splitMeasures.mockReturnValue([deletedMeasures, remainingMeasures]);

    const result = removeAlternativeMeasure(self, indexes);

    expect(splitMeasures).toHaveBeenCalledWith(self, indexes);
    expect(self.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures).toEqual(remainingMeasures);
    expect(result).toEqual(deletedMeasures);
  });

  test('should update remaining measures correctly', () => {
    const indexes = [0, 2];
    const deletedMeasures = ['measure1', 'measure3'];
    const remainingMeasures = ['measure2', 'measure4'];

    splitMeasures.mockReturnValue([deletedMeasures, remainingMeasures]);

    const result = removeAlternativeMeasure(self, indexes);

    expect(splitMeasures).toHaveBeenCalledWith(self, indexes);
    expect(self.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures).toEqual(remainingMeasures);
    expect(result).toEqual(deletedMeasures);
  });
});
