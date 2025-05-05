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

    test('should generate correct filter label when no field values are selected', async () => {
      filter.options.values = [];
      const label = generateFiltersString([filter], translator);
      expect(label).toEqual('');
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

    test('should generate correct filter label when exclude mode is true and searchMode is CONTAINS', async () => {
      const label = generateFiltersString([filter], translator);
      expect(label).toEqual('fieldName: *searchInput*');
    });
    test('should generate correct filter label when exclude is false and searchMode is CONTAINS', async () => {
      filter.exclude = false;
      const label = generateFiltersString([filter], translator);
      expect(label).toEqual('fieldName: *searchInput*');
    });
    test('should generate correct filter label when searchMode is MATCHES_EXACTLY', async () => {
      filter.options.mode = SearchMode.MATCHES_EXACTLY;
      const label = generateFiltersString([filter], translator);
      expect(label).toEqual('fieldName: searchInput');
    });
    test('should generate correct filter label when searchMode is STARTS_WITH', async () => {
      filter.options.mode = SearchMode.STARTS_WITH;
      const label = generateFiltersString([filter], translator);
      expect(label).toEqual('fieldName: searchInput*');
    });
    test('should generate correct filter label when searchMode is ENDS_WITH', async () => {
      filter.options.mode = SearchMode.ENDS_WITH;
      const label = generateFiltersString([filter], translator);
      expect(label).toEqual('fieldName: *searchInput');
    });
    test('should generate correct filter label when searchMode is BEGINNING_OF_WORD', async () => {
      filter.options.mode = SearchMode.BEGINNING_OF_WORD;
      const label = generateFiltersString([filter], translator);
      expect(label).toEqual('fieldName: *^searchInput*');
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
          mode: 'compare',
        },
      };
    });
    test('should generate filter label when the filter is invalid', async () => {
      const label = generateFiltersString([filter], translator);
      expect(label).toEqual('');
    });
    test('should generate correct filter label when the filter has COMPARE type and is FIXED_VALUE', async () => {
      filter.options.firstValue = { fixedValue: '10' };
      const label = generateFiltersString([filter], translator);
      expect(label).toEqual('fieldName: <10');
    });
    test('should generate correct filter label when the filter has COMPARE type and is CALCULATED_VALUE', async () => {
      filter.options.modifier = { type: 'calculated_value', operator: '<' };
      filter.options.firstValue = { aggregator: 'sum', field: 'fieldName2' };
      const label = generateFiltersString([filter], translator);
      expect(label).toEqual('fieldName: =fieldName<sum(total fieldName2)');
    });
    test('should generate correct filter label when the filter has COMPARE type and is CALCULATED_VALUE and is between', async () => {
      filter.options.modifier = { type: 'calculated_value', operator: '>= <=' };
      filter.options.firstValue = { aggregator: 'sum', field: 'fieldName2' };
      filter.options.secondValue = {
        aggregator: 'count',
        field: 'fieldName3',
      };
      const label = generateFiltersString([filter], translator);
      expect(label).toEqual('fieldName: =fieldName>=sum(total fieldName2) and fieldName<=count(total fieldName3)');
    });
    test('should generate correct filter label when the filter has COMPARE type and missing secondValue on between', async () => {
      filter.options.modifier = { type: 'calculated_value', operator: '>= <=' };
      filter.options.firstValue = { aggregator: 'sum', field: 'fieldName2' };
      const label = generateFiltersString([filter], translator);
      expect(label).toEqual('');
    });
    test('should generate correct filter label when the filter has GENERAL type and filter is invalid', async () => {
      filter.options.mode = ConditionMode.GENERAL;
      filter.options.firstValue = { fixedValue: '10' };
      const label = generateFiltersString([filter], translator);
      expect(label).toEqual('');
    });
    test('should generate correct filter label when the filter has GENERAL type and is FIXED_VALUE', async () => {
      filter.options.mode = ConditionMode.GENERAL;
      filter.options.firstValue = { fixedValue: '10' };
      filter.options.conditionField = {
        aggregator: 'avg',
        field: 'conditionFieldName1',
      };
      const label = generateFiltersString([filter], translator);
      expect(label).toEqual('fieldName: =avg(conditionFieldName1)<10');
    });
    test('should generate correct filter label when the filter has GENERAL type and is FIXED_VALUE and is between', async () => {
      filter.options.modifier = { type: ModifierType.FIXED_VALUE, operator: '>= <=' };
      filter.options.mode = ConditionMode.GENERAL;
      filter.options.firstValue = { fixedValue: '10' };
      filter.options.secondValue = { fixedValue: '100' };
      filter.options.conditionField = {
        aggregator: 'avg',
        field: 'conditionFieldName1',
      };
      const label = generateFiltersString([filter], translator);
      expect(label).toEqual('fieldName: =avg(conditionFieldName1)>=10 and avg(conditionFieldName1)<=100');
    });
    test('should generate correct filter label when the filter has GENERAL type and is CALCULATED_VALUE', async () => {
      filter.options.modifier = { type: 'calculated_value', operator: '<' };
      filter.options.mode = ConditionMode.GENERAL;
      filter.options.firstValue = { aggregator: 'sum', field: 'fieldName2' };
      filter.options.conditionField = {
        aggregator: 'avg',
        field: 'conditionFieldName1',
      };
      const label = generateFiltersString([filter], translator);
      expect(label).toEqual('fieldName: =avg(conditionFieldName1)<sum(fieldName2)');
    });
    test('should generate correct filter label when the filter has GENERAL type and is CALCULATED_VALUE and is between', async () => {
      filter.options.modifier = { type: 'calculated_value', operator: '>= <=' };
      filter.options.mode = ConditionMode.GENERAL;
      filter.options.firstValue = { aggregator: 'sum', field: 'fieldName2' };
      filter.options.secondValue = {
        aggregator: 'count',
        field: 'fieldName3',
      };
      filter.options.conditionField = {
        aggregator: 'avg',
        field: 'conditionFieldName1',
      };
      const label = generateFiltersString([filter], translator);
      expect(label).toEqual(
        'fieldName: =avg(conditionFieldName1)>=sum(fieldName2) and avg(conditionFieldName1)<=count(fieldName3)'
      );
    });
    test('should handle fields that contains multiple words', async () => {
      filter.options.modifier = { type: 'calculated_value', operator: '>= <=' };
      filter.options.mode = ConditionMode.GENERAL;
      filter.options.firstValue = {
        aggregator: 'sum',
        field: 'field Name2',
      };
      filter.options.secondValue = {
        aggregator: 'count',
        field: 'field Name3',
      };
      filter.options.conditionField = {
        aggregator: 'avg',
        field: 'conditionField Name1',
      };
      const label = generateFiltersString([filter], translator);
      expect(label).toEqual(
        'fieldName: =avg([conditionField Name1])>=sum([field Name2]) and avg([conditionField Name1])<=count([field Name3])'
      );
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
