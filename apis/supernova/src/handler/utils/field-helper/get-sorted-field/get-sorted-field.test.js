import getAutoSortFieldDimension from './index';
import findFieldInExpandedList from '../find-field-in-expandedList';
import { setAutoSort } from '../utils';

jest.mock('../find-field-in-expandedList', () => jest.fn());
jest.mock('../utils', () => ({
  setAutoSort: jest.fn(),
}));

describe('getAutoSortFieldDimension', () => {
  let self;
  let dimension;

  beforeEach(() => {
    self = {
      app: {
        getFieldList: jest.fn(),
      },
    };
    dimension = {
      qDef: {
        qFieldDefs: ['field1'],
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should call findFieldInExpandedList with correct arguments', async () => {
    const fieldList = [{ qName: 'field1' }];
    self.app.getFieldList.mockResolvedValue(fieldList);

    const result = await getAutoSortFieldDimension(self, dimension);

    expect(self.app.getFieldList).toHaveBeenCalled();
    expect(findFieldInExpandedList).toHaveBeenCalledWith('field1', fieldList);
    expect(result).toBe(dimension);
  });

  test('should call setAutoSort if a field is found', async () => {
    const fieldList = [{ qName: 'field1' }];
    const field = { qName: 'field1' };
    self.app.getFieldList.mockResolvedValue(fieldList);
    findFieldInExpandedList.mockReturnValue(field);

    await getAutoSortFieldDimension(self, dimension);

    expect(setAutoSort).toHaveBeenCalledWith([field], dimension, self);
  });

  test('should not call setAutoSort if no field is found', async () => {
    self.app.getFieldList.mockResolvedValue([]);
    findFieldInExpandedList.mockReturnValue(null);

    await getAutoSortFieldDimension(self, dimension);

    expect(setAutoSort).not.toHaveBeenCalled();
  });

  test('should handle empty field list', async () => {
    self.app.getFieldList.mockResolvedValue([]);

    const result = await getAutoSortFieldDimension(self, dimension);

    expect(result).toBe(dimension);
    expect(setAutoSort).not.toHaveBeenCalled();
  });

  test('should handle missing qFieldDefs', async () => {
    dimension.qDef.qFieldDefs = undefined;
    self.app.getFieldList.mockResolvedValue([]);

    const result = await getAutoSortFieldDimension(self, dimension);

    expect(result).toBe(dimension);
    expect(setAutoSort).not.toHaveBeenCalled();
  });
});
