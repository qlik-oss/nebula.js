import getAutoSortLibraryDimension from './index';
import { findLibraryItem, setAutoSort } from '../utils';

jest.mock('../utils', () => ({
  findLibraryItem: jest.fn(),
  setAutoSort: jest.fn(),
}));

describe('getAutoSortLibraryDimension', () => {
  let self;
  let dimension;

  beforeEach(() => {
    self = {
      app: {
        getDimensionList: jest.fn(),
      },
    };
    dimension = {
      qLibraryId: 'libDim1',
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should call findLibraryItem with correct arguments', async () => {
    const dimensionList = [{ qInfo: { qId: 'libDim1' }, qData: { info: ['field1'] } }];
    const libDim = dimensionList[0];
    self.app.getDimensionList.mockResolvedValue(dimensionList);
    findLibraryItem.mockReturnValue(libDim);

    const result = await getAutoSortLibraryDimension(self, dimension);

    expect(findLibraryItem).toHaveBeenCalledWith('libDim1', dimensionList);
    expect(result).toBe(dimension);
  });

  test('should call setAutoSort if a library dimension is found', async () => {
    const dimensionList = [{ qInfo: { qId: 'libDim1' }, qData: { info: ['field1'] } }];
    const libDim = dimensionList[0];
    self.app.getDimensionList.mockResolvedValue(dimensionList);

    await getAutoSortLibraryDimension(self, dimension);

    expect(setAutoSort).toHaveBeenCalledWith(libDim.qData.info, dimension, self);
  });

  test('should not call setAutoSort if no library dimension is found', async () => {
    self.app.getDimensionList.mockResolvedValue([]);
    findLibraryItem.mockReturnValue(null);

    await getAutoSortLibraryDimension(self, dimension);

    expect(setAutoSort).not.toHaveBeenCalled();
  });

  test('should handle empty dimension list', async () => {
    self.app.getDimensionList.mockResolvedValue([]);

    const result = await getAutoSortLibraryDimension(self, dimension);

    expect(result).toBe(dimension);
    expect(setAutoSort).not.toHaveBeenCalled();
  });

  test('should handle missing dimension list', async () => {
    dimension = undefined;
    self.app.getDimensionList.mockResolvedValue([]);

    const result = await getAutoSortLibraryDimension(self, dimension);

    expect(result).toBe(dimension);
    expect(setAutoSort).not.toHaveBeenCalled();
  });
});
