import escapeField from './escape-field';

export const FilterType = {
  VALUES: 'values',
  CONDITION: 'condition',
  SEARCH: 'search',
  CLEAR_SELECTION: 'clear_selection',
};

export const SearchMode = {
  CONTAINS: 'contains',
  MATCHES_EXACTLY: 'matches_exactly',
  STARTS_WITH: 'starts_with',
  ENDS_WITH: 'ends_with',
  BEGINNING_OF_WORD: 'beginning_of_word',
};

export const ConditionMode = {
  COMPARE: 'compare',
  GENERAL: 'general',
};

export const ModifierType = {
  FIXED_VALUE: 'fixed_value',
  CALCULATED_VALUE: 'calculated_value',
};

const generateSearchValue = (filter) => {
  let prefix = '';
  let postfix = '';
  const mode = filter.options?.mode;
  switch (mode) {
    case SearchMode.BEGINNING_OF_WORD:
      prefix = '*^';
      postfix = '*';
      break;
    case SearchMode.ENDS_WITH:
      prefix = '*';
      break;
    case SearchMode.STARTS_WITH:
      postfix = '*';
      break;
    case SearchMode.MATCHES_EXACTLY:
      break;
    case SearchMode.CONTAINS:
    default:
      prefix = '*';
      postfix = '*';
      break;
  }
  const value = filter.options.values?.[0] ?? '';
  return value !== '' ? `"${prefix}${value}${postfix}"` : '';
};

const generateConditionValue = (filter) => {
  const { options } = filter;

  const isGeneralMode = options?.mode === ConditionMode.GENERAL;
  const isFixedModifier = options?.modifier?.type === ModifierType.FIXED_VALUE;
  const modifierOperators = options?.modifier?.operator ? options.modifier.operator.split(' ') : [];

  if (
    modifierOperators.length === 0 ||
    (!isFixedModifier && (!options.firstValue?.aggregator || !options.firstValue?.field)) ||
    (isFixedModifier && !options.firstValue?.fixedValue) ||
    (isGeneralMode && (!options.conditionField?.aggregator || !options.conditionField?.field))
  ) {
    return '';
  }

  let conditionField;
  let firstValue;
  let conditionPrefix = '=';
  if (isGeneralMode && isFixedModifier) {
    // general mode with fixed modifiers
    conditionField = `${options.conditionField?.aggregator}(${escapeField(options.conditionField?.field)})`;
    firstValue = `${options.firstValue?.fixedValue}`;
  } else if (!isGeneralMode && isFixedModifier) {
    // comparing mode with fixed modifiers
    conditionField = ``;
    firstValue = `${options.firstValue?.fixedValue}`;
    conditionPrefix = '';
  } else if (!isGeneralMode && !isFixedModifier) {
    // comparing mode without fixed modifiers
    conditionField = `${escapeField(filter.field)}`;
    firstValue = `${options.firstValue?.aggregator}(total ${escapeField(options.firstValue?.field)})`;
  } else {
    // general mode without fixed modifiers
    conditionField = `${options.conditionField?.aggregator}(${escapeField(options.conditionField?.field)})`;
    firstValue = `${options.firstValue?.aggregator}(${escapeField(options.firstValue?.field)})`;
  }
  const leftConditionResult = `${conditionPrefix}${conditionField}${modifierOperators[0]}${firstValue}`;

  let rightConditionResult = '';
  if (modifierOperators.length > 1) {
    if (
      (!isFixedModifier && (!options.secondValue?.aggregator || !options.secondValue?.field)) ||
      (isFixedModifier && !options.secondValue?.fixedValue)
    ) {
      return '';
    }

    let secondValue;
    let rightConditionField;
    if (isGeneralMode && isFixedModifier) {
      // general mode with fixed modifiers
      secondValue = `${options.secondValue?.fixedValue}`;
      rightConditionField = ` and ${conditionField}`;
    } else if (!isGeneralMode && isFixedModifier) {
      // comparing mode with fixed modifiers
      secondValue = `${options.secondValue?.fixedValue}`;
      rightConditionField = '';
    } else if (!isGeneralMode && !isFixedModifier) {
      // comparing mode without fixed modifiers
      secondValue = `${options.secondValue?.aggregator}(total ${escapeField(options.secondValue?.field)})`;
      rightConditionField = ` and ${conditionField}`;
    } else {
      // general mode without fixed modifiers
      secondValue = `${options.secondValue?.aggregator}(${escapeField(options.secondValue?.field)})`;
      rightConditionField = ` and ${conditionField}`;
    }
    rightConditionResult = `${rightConditionField}${modifierOperators[1]}${secondValue}`;
  }

  return `"${leftConditionResult}${rightConditionResult}"`;
};

export const generateFiltersLabels = (filters, translator) => {
  if (!Array.isArray(filters)) {
    // QB-15075: when the property `filters` was already used by older apps
    return [];
  }
  const EXCLUDE = translator.get('Object.FilterLabel.Exclude');
  const filtersToShow = filters.filter((filter) => filter.showInFooter !== false);
  return filtersToShow
    .map((filter) => {
      let label = '';
      switch (filter.type) {
        case FilterType.SEARCH:
          label += generateSearchValue(filter);
          break;
        case FilterType.CONDITION:
          label += generateConditionValue(filter);
          break;
        case FilterType.CLEAR_SELECTION:
          label += translator.get('Object.FilterLabel.All');
          break;
        case FilterType.VALUES:
        default:
          label += filter.options?.values
            ? filter.options.values.join(', ')
            : translator.get('Object.FilterLabel.Unknown');
          break;
      }

      if (label !== '') {
        // Trim quotes
        label = label.replace(/^"|"$/g, '');
        // Prefix with exclude if filter inverted
        if (filter.exclude) label = `${EXCLUDE} ${label}`;
      }

      return {
        field: filter.field,
        label,
      };
    })
    .filter((filter) => filter.label !== '');
};

export const generateFiltersString = (filters, translator) =>
  generateFiltersLabels(filters, translator)
    .map((f) => `${f.field}: ${f.label}`)
    .join('; ');
