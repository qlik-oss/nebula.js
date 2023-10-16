// import Color from './Color/Color';
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

export default function createStyleService({ theme, components = [] }) {
  const overrides = getOverridesAsObject(components);
  const { listBox: listBoxTheme = {} } = theme || {};

  const desiredTextColor =
    overrides.content?.fontColor?.color || listBoxTheme.content?.color || theme.palette.text.primary;

  const useContrastTextColor = overrides.content?.useContrastColor ?? true;

  // Background colors
  const selected = overrides.palette?.selected?.color || theme.palette.selected.main || '#009845';
  const alternative = overrides.palette?.alternative?.color || theme.palette.selected.alternative || '#E4E4E4';
  const excluded = overrides.palette?.excluded?.color || theme.palette.selected.excluded || '#BEBEBE';
  const selectedExcluded =
    overrides.palette?.selectedExcluded?.color || theme.palette.selected.selectedExcluded || '#A9A9A9';
  const possible = overrides.palette?.possible?.color || theme.palette.selected.possible || '#FFFFFF';

  // Font colors
  let selectedContrast = desiredTextColor || theme.palette.selected.main;
  let alternativeContrast = desiredTextColor || theme.palette.selected.alternativeContrastText;
  let excludedContrast = desiredTextColor || theme.palette.selected.excludedContrastText;
  let selectedExcludedContrast = desiredTextColor || theme.palette.selected.selectedExcludedContrastText;
  let possibleContrast = desiredTextColor || theme.palette.selected.possibleContrastText;

  if (useContrastTextColor) {
    // Override preferred text color if it does not contrast enough with the background color.
    selectedContrast = getContrastingColor(selected, desiredTextColor);
    alternativeContrast = getContrastingColor(alternative, desiredTextColor);
    excludedContrast = getContrastingColor(excluded, desiredTextColor);
    selectedExcludedContrast = getContrastingColor(selectedExcluded, desiredTextColor);
    possibleContrast = getContrastingColor(possible, desiredTextColor);
  }

  return {
    header: {
      getStyle: () => ({
        fontSize: overrides.header?.fontSize ?? listBoxTheme.title?.main?.fontSize,
        fontColor: overrides.header?.fontColor?.color ?? listBoxTheme.title?.main?.color,
      }),
    },
    content: {
      getStyle: () => ({
        fontSize: overrides.content?.fontSize ?? listBoxTheme.content?.fontSize,
        fontColor: possibleContrast,
      }),
    },
    palette: {
      getStyle: () => ({
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
      }),
    },
  };
}
