import { isDateField } from '../field-utils';

describe('isDateField', () => {
  test('should return true if field has $date tag', () => {
    const field01 = {
      qDerivedFieldData: {},
      qTags: ['$date', 'otherTag'],
    };

    const field02 = {
      qDerivedFieldData: {},
      qTags: ['otherTag', '$timestamp'],
    };

    const result01 = isDateField(field01);
    expect(result01).toBe(true);

    const result02 = isDateField(field02);
    expect(result02).toBe(true);
  });

  test('should return false if field does not have $date or $timestamp tag', () => {
    const field = {
      qDerivedFieldData: {},
      qTags: ['otherTag'],
    };

    const result = isDateField(field);
    expect(result).toBeFalsy();
  });

  test('should return false if qDerivedFieldData is missing', () => {
    const field = {
      qTags: ['$date'],
    };

    const result = isDateField(field);
    expect(result).toBeFalsy();
  });

  test('should return false if qTags is empty', () => {
    const field = {
      qDerivedFieldData: {},
      qTags: [],
    };

    const result = isDateField(field);
    expect(result).toBeFalsy();
  });

  test('should return false if field is null or undefined', () => {
    expect(isDateField([])).toBeFalsy();
    expect(isDateField(undefined)).toBeFalsy();
  });

  test('should return false if qTags is not an array', () => {
    const field = {
      qDerivedFieldData: {},
      qTags: null,
    };

    const result = isDateField(field);
    expect(result).toBeFalsy();
  });
});
