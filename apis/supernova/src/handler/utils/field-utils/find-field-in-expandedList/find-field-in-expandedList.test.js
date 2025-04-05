import findFieldInExpandedList from './index';
import * as expandFieldsWithDerivedData from '../expand-field-derived-data';
// import * as utils from '../utils';

describe('findFieldInExpandedList', () => {
  let fieldList;
  let expandedList;

  beforeEach(() => {
    fieldList = [{ qName: 'field1' }, { qName: 'field2' }];
    expandedList = [{ qName: 'field1' }, { qName: 'field2' }, { qName: 'derivedField' }];
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return the field if it exists in the expanded list', () => {
    jest.spyOn(expandFieldsWithDerivedData, 'default').mockImplementation(() => expandedList);

    const result = findFieldInExpandedList('field1', fieldList);
    expect(result).toEqual({ qName: 'field1' });
  });

  test('should return null if the field does not exist in the expanded list', () => {
    jest.spyOn(expandFieldsWithDerivedData, 'default').mockImplementation(() => expandedList);

    const result = findFieldInExpandedList('nonExistentField', fieldList);

    expect(result).toBeNull();
  });

  test('should return null if the expanded list is empty', () => {
    fieldList = [];
    expandedList = null;
    jest.spyOn(expandFieldsWithDerivedData, 'default').mockImplementation(() => expandedList);

    const result = findFieldInExpandedList('field1', fieldList);
    expect(result).toBeNull();
  });
});
