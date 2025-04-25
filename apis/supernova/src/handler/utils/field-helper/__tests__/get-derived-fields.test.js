import getDerivedFields from '../get-derived-fields';
import { trimAutoCalendarName } from '../field-utils';

jest.mock('../utils', () => ({
  trimAutoCalendarName: jest.fn((name) => `trimmed_${name}`),
}));

describe('getDerivedFields', () => {
  let field;

  beforeEach(() => {
    field = {
      qName: 'field1',
      qSrcTables: ['table1'],
      isDateField: true,
      qDerivedFieldData: {
        qDerivedFieldLists: [
          {
            qDerivedDefinitionName: 'DerivedDef1',
            qFieldDefs: [
              {
                qName: 'derivedField1',
                qTags: ['tag1'],
              },
            ],
          },
        ],
      },
    };
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return an empty array if derived field data is undefined', () => {
    field = { qName: 'field1' };

    const result = getDerivedFields(field);

    expect(result).toEqual([]);
  });

  test('should return an empty array if derived field data list is empty', () => {
    field = {
      qName: 'field1',
      qDerivedFieldData: {
        qDerivedFieldLists: [],
      },
    };

    const result = getDerivedFields(field);

    expect(result).toEqual([]);
  });

  test('should return derived fields with correct properties', () => {
    const result = getDerivedFields(field);

    expect(trimAutoCalendarName).toHaveBeenCalledWith('derivedField1');
    expect(result).toEqual([
      {
        qName: 'derivedField1',
        displayName: 'trimmed_derivedField1',
        qSrcTables: ['table1'],
        qTags: ['tag1'],
        isDerived: true,
        isDerivedFromDate: true,
        sourceField: 'field1',
        derivedDefinitionName: 'DerivedDef1',
      },
    ]);
  });

  test('should set isDerivedFromDate to false if field.isDateField is false', () => {
    field.isDateField = false;

    const result = getDerivedFields(field);

    expect(result[0].isDerivedFromDate).toBe(false);
  });

  test('should handle multiple derived fields', () => {
    field = {
      qName: 'field1',
      qSrcTables: ['table1'],
      isDateField: true,
      qDerivedFieldData: {
        qDerivedFieldLists: [
          {
            qDerivedDefinitionName: 'DerivedDef1',
            qFieldDefs: [
              {
                qName: 'derivedField1',
                qTags: ['tag1'],
              },
              {
                qName: 'derivedField2',
                qTags: ['tag2'],
              },
            ],
          },
        ],
      },
    };

    const result = getDerivedFields(field);

    expect(result).toEqual([
      {
        qName: 'derivedField1',
        displayName: 'trimmed_derivedField1',
        qSrcTables: ['table1'],
        qTags: ['tag1'],
        isDerived: true,
        isDerivedFromDate: true,
        sourceField: 'field1',
        derivedDefinitionName: 'DerivedDef1',
      },
      {
        qName: 'derivedField2',
        displayName: 'trimmed_derivedField2',
        qSrcTables: ['table1'],
        qTags: ['tag2'],
        isDerived: true,
        isDerivedFromDate: true,
        sourceField: 'field1',
        derivedDefinitionName: 'DerivedDef1',
      },
    ]);
  });
});
