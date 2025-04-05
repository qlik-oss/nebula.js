import expandFieldsWithDerivedData from './index';
import * as getDataGeoField from '../get-data-geo-field';
import * as getDerivedFields from '../get-derived-fields';

jest.mock('../get-data-geo-field', () => jest.fn());
jest.mock('../get-derived-fields', () => jest.fn());

describe('expandFieldsWithDerivedData', () => {
  let inputList;
  let geoField;
  let derivedFields;

  beforeEach(() => {
    inputList = [{ name: 'field1' }];
    geoField = { name: 'geoField' };
    derivedFields = [{ name: 'derivedFields' }];
  });

  test('should expand fields with geo and derived fields', () => {
    getDataGeoField.mockReturnValue(geoField);
    getDerivedFields.mockReturnValue(derivedFields);

    const result = expandFieldsWithDerivedData(inputList);

    expect(result).toEqual([geoField, { name: 'derivedFields' }]);
  });

  test('should handle an empty input list', () => {
    inputList = [];
    getDataGeoField.mockReturnValue(geoField);
    getDerivedFields.mockReturnValue(derivedFields);

    const result = expandFieldsWithDerivedData(inputList);

    expect(getDataGeoField.default).not.toHaveBeenCalled();
    expect(getDerivedFields.default).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  test('should handle fields with no derived fields', () => {
    derivedFields = [];
    getDataGeoField.mockReturnValue(geoField);
    getDerivedFields.mockReturnValue(derivedFields);

    const result = expandFieldsWithDerivedData(inputList);

    expect(getDataGeoField).toHaveBeenCalledTimes(1);
    expect(getDataGeoField).toHaveBeenCalledWith({ name: 'field1' });

    expect(getDerivedFields).toHaveBeenCalledTimes(1);
    expect(getDerivedFields).toHaveBeenCalledWith({ name: 'field1' });

    expect(result).toEqual([geoField]);
  });

  test('should handle fields with no geo field', () => {
    geoField = [];
    getDataGeoField.mockReturnValue([]);
    getDerivedFields.mockReturnValue(derivedFields);

    const result = expandFieldsWithDerivedData(inputList);

    expect(getDataGeoField).toHaveBeenCalledTimes(1);
    expect(getDataGeoField).toHaveBeenCalledWith({ name: 'field1' });

    expect(getDerivedFields).toHaveBeenCalledTimes(1);
    expect(getDerivedFields).toHaveBeenCalledWith({ name: 'field1' });
    expect(result).toEqual([[], ...derivedFields]);
  });
});
