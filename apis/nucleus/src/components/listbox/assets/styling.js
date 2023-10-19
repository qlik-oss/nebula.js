import { getContrastRatio } from '@mui/material/styles';

const LIGHT = '#FFF';
const DARK = '#000';

function getContrastingColor(backgroundColor, desiredTextColor = undefined, dark = DARK, light = LIGHT) {
  const CONTRAST_THRESHOLD = 3.0;
  let contrastingColor;
  if (desiredTextColor && getContrastRatio(desiredTextColor, backgroundColor) > CONTRAST_THRESHOLD) {
    contrastingColor = desiredTextColor;
  } else {
    contrastingColor = getContrastRatio(light, backgroundColor) > CONTRAST_THRESHOLD ? light : dark;
  }
  return contrastingColor;
}

function getOverridesAsObject(components = []) {
  const overrides = {};

  components.forEach((c) => {
    overrides[c.key] = c;
  });

  return overrides;
}

function getSelectionColors(theme, getListboxStyle, overrides) {
  const desiredTextColor =
    overrides.content?.fontColor?.color || getListboxStyle('content', 'color') || theme.palette?.text.primary;

  const useContrastTextColor = overrides.content?.useContrastColor ?? true;

  // Background colors
  const selected = overrides.selections?.selected?.color || theme.palette?.selected.main || '#009845';
  const alternative = overrides.selections?.alternative?.color || theme.palette?.selected.alternative || '#E4E4E4';
  const excluded = overrides.selections?.excluded?.color || theme.palette?.selected.excluded || '#A9A9A9';
  const selectedExcluded =
    overrides.selections?.selectedExcluded?.color || theme.palette?.selected.selectedExcluded || '#A9A9A9';
  const possible =
    overrides.selections?.possible?.color ||
    getListboxStyle('', 'backgroundColor') ||
    theme.palette?.selected.possible ||
    '#FFFFFF';

  // Font colors
  let selectedContrast = desiredTextColor || theme.palette?.selected.main;
  let alternativeContrast = desiredTextColor || theme.palette?.selected.alternativeContrastText;
  let excludedContrast = desiredTextColor || theme.palette?.selected.excludedContrastText;
  let selectedExcludedContrast = desiredTextColor || theme.palette?.selected.selectedExcludedContrastText;
  let possibleContrast = desiredTextColor || theme.palette?.selected.possibleContrastText;

  if (useContrastTextColor) {
    // Override preferred text color if it does not contrast enough with the background color.
    selectedContrast = getContrastingColor(selected, desiredTextColor);
    alternativeContrast = getContrastingColor(alternative, desiredTextColor);
    excludedContrast = getContrastingColor(excluded, desiredTextColor);
    selectedExcludedContrast = getContrastingColor(selectedExcluded, desiredTextColor);
    possibleContrast = getContrastingColor(possible, desiredTextColor);
  }

  return {
    selected,
    alternative,
    excluded,
    selectedExcluded,
    possible,

    selectedContrast,
    alternativeContrast,
    excludedContrast,
    selectedExcludedContrast,
    possibleContrast,
  };
}

export default function getStyles({ themeApi, theme, components = [], checkboxes = false }) {
  const overrides = getOverridesAsObject(components) || {};
  const getListboxStyle = (path, prop) => themeApi.getStyle('object.listBox', path, prop);

  const selections = getSelectionColors(theme, getListboxStyle, overrides);

  return {
    backgroundColor: getListboxStyle('', 'backgroundColor') || theme.palette.background.default,
    header: {
      color: overrides.header?.fontColor?.color || getListboxStyle('title.main', 'color'),
      fontSize: overrides.header?.fontSize || getListboxStyle('title.main', 'fontSize'),
      fontFamily: getListboxStyle('title.main', 'fontFamily'),
      fontWeight: getListboxStyle('title.main', 'fontWeight') || 'bold',
    },
    content: {
      backgroundColor: checkboxes ? selections.possible : undefined,
      color: selections.possibleContrast || getListboxStyle('content', 'color'),
      fontSize: overrides.content?.fontSize || getListboxStyle('content', 'fontSize'),
      fontFamily: getListboxStyle('content', 'fontFamily'),
    },
    selections,
  };
}
