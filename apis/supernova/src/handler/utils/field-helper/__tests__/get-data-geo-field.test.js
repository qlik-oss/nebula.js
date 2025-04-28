import getDataGeoField from '../get-data-geo-field';
import { isDateField, isGeoField } from '../field-utils';

jest.mock('../field-utils', () => ({
  isDateField: jest.fn(),
  isGeoField: jest.fn(),
}));

describe('getDataGeoField', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return field with the correct property values', () => {
    const field = { name: 'dateField' };
    isDateField.mockReturnValue(true);
    isGeoField.mockReturnValue(false);

    const result = getDataGeoField(field);

    expect(result.isDateField).toBe(true);
    expect(result.isGeoField).toBe(false);
  });
});
