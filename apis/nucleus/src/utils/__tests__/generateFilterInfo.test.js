import { generateFiltersString, FilterType, SearchMode, ConditionMode, ModifierType } from '../generateFiltersInfo';

describe('generateFiltersString', () => {
  const translator = { get: (s) => s };
  describe('Value filter', () => {
    let filter;

    beforeEach(() => {
      filter = {
        type: FilterType.VALUES,
        field: 'fieldName',
        exclude: true,
        id: 'filter1',
        options: {
          values: ['value1', 'value2'],
        },
      };
    });

    test('should generate correct filter label when exclude mode is true', async () => {
      const label = generateFiltersString([filter], translator);
      expect(label).toEqual('fieldName: Object.FilterLabel.Exclude value1, value2');
    });

    test('should generate correct filter label when exclude mode is false', async () => {
      filter.exclude = false;
      const label = generateFiltersString([filter], translator);
      expect(label).toEqual('fieldName: value1, value2');
    });
  });

  describe('Search filter', () => {
    let filter;

    beforeEach(() => {
      filter = {
        type: FilterType.SEARCH,
        field: 'fieldName',
        exclude: false,
        id: 'filter1',
        options: {
          values: ['searchInput'],
          mode: SearchMode.CONTAINS,
        },
      };
    });

    test('should generate correct filter label for search', async () => {
      const label = generateFiltersString([filter], translator);
      expect(label).toEqual('fieldName: *searchInput*');
    });
  });

  describe('Condition filter', () => {
    let filter;
    beforeEach(() => {
      filter = {
        type: FilterType.CONDITION,
        field: 'fieldName',
        exclude: false,
        id: 'filter1',
        options: {
          modifier: {
            type: ModifierType.FIXED_VALUE,
            operator: '<',
          },
          mode: ConditionMode.COMPARE,
        },
      };
    });

    test('should generate correct filter label for condition', async () => {
      filter.options.firstValue = { fixedValue: '10' };
      const label = generateFiltersString([filter], translator);
      expect(label).toEqual('fieldName: <10');
    });
  });

  describe('Clear selection filter', () => {
    let filter;

    beforeEach(() => {
      filter = {
        type: FilterType.CLEAR_SELECTION,
        field: 'fieldName',
        exclude: false,
        id: 'filter1',
        options: {},
      };
    });

    test('should generate correct filter label for clear selection', async () => {
      const label = generateFiltersString([filter], translator);
      expect(label).toEqual('fieldName: Object.FilterLabel.All');
    });
  });

  describe('Multiple filters', () => {
    test('should generate correct filter label for multiple filters', async () => {
      const label = generateFiltersString(
        [
          {
            type: FilterType.VALUES,
            field: 'fieldName',
            exclude: true,
            id: 'filter1',
            options: {
              values: ['value1', 'value2'],
            },
          },
          {
            type: FilterType.SEARCH,
            field: 'fieldName',
            exclude: false,
            id: 'filter1',
            options: {
              values: ['searchInput'],
              mode: SearchMode.CONTAINS,
            },
          },
        ],
        translator
      );
      expect(label).toEqual('fieldName: Object.FilterLabel.Exclude value1, value2; fieldName: *searchInput*');
    });
  });
});
