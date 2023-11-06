import Color from '../../../utils/color';

const LIGHT = '#FFF';
const DARK = '#000';

export const CONTRAST_THRESHOLD = 1.2;

export const getContrast = (desired, background) => {
  let contrast = false;

  const des = new Color(desired);
  const bg = new Color(background);

  if (bg.isInvalid() || des.isInvalid() || bg.getAlpha() < 1 || des.getAlpha() < 1) {
    return undefined;
  }

  try {
    contrast = Color.getContrast(des, bg);
  } catch (err) {
    contrast = undefined;
  }
  return contrast;
};

function getContrastingColor(backgroundColor, desiredTextColor = undefined, dark = DARK, light = LIGHT) {
  const lightColor = new Color(light);
  const bg = new Color(backgroundColor);
  const des = new Color(desiredTextColor);
  if (bg.isInvalid() || des.isInvalid() || bg.getAlpha() < 1 || des.getAlpha() < 1) {
    return desiredTextColor;
  }

  // Always prioritise light color if it gives better contrast than desired color's.
  const lightColorContrast = getContrast(lightColor, bg);
  const desiredColorContrast = getContrast(des, bg);
  const lightColorWorks = lightColorContrast > CONTRAST_THRESHOLD;

  let contrastingColor;
  if (desiredTextColor && desiredColorContrast > CONTRAST_THRESHOLD && desiredColorContrast > lightColorContrast) {
    contrastingColor = desiredTextColor;
  } else {
    contrastingColor = lightColorWorks ? light : dark;
  }
  return contrastingColor;
}

const SUPPORTED_COMPONENTS = ['theme', 'selections'];

export function getOverridesAsObject(components = []) {
  // Currently supporting components "theme" and "selections".
  const overrides = {};
  components.forEach((c) => {
    const k = c?.key;
    if (SUPPORTED_COMPONENTS.includes(k)) {
      overrides[k] = c;
    }
  });

  return overrides;
}

function getSelectionColors(theme, getListboxStyle, overrides) {
  const componentContentTextColor = overrides.theme?.content?.fontColor?.color;
  const desiredTextColor =
    componentContentTextColor || getListboxStyle('content', 'color') || theme.palette?.text.primary;

  const useContrastTextColor = overrides.theme?.content?.useContrastColor ?? true;

  // Background colors
  const selectionColors = overrides.selections?.colors || {};

  const selected = selectionColors.selected?.color || theme.palette?.selected.main || '#009845';
  const alternative = selectionColors.alternative?.color || theme.palette?.selected.alternative || '#E4E4E4';
  const excluded = selectionColors.excluded?.color || theme.palette?.selected.excluded || '#A9A9A9';
  const selectedExcluded =
    selectionColors.selectedExcluded?.color || theme.palette?.selected.selectedExcluded || '#A9A9A9';
  const possible =
    selectionColors.possible?.color ||
    getListboxStyle('', 'backgroundColor') ||
    theme.palette?.selected.possible ||
    '#FFFFFF';

  // Font colors
  let selectedContrast = desiredTextColor || theme.palette?.selected.selectedContrastText;
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
  const overrides = getOverridesAsObject(components);
  const getListboxStyle = (path, prop) => themeApi.getStyle('object.listBox', path, prop);

  const selections = getSelectionColors(theme, getListboxStyle, overrides);
  const themeOverrides = overrides.theme || {};

  return {
    backgroundColor: getListboxStyle('', 'backgroundColor') || theme.palette.background.default,
    header: {
      color: themeOverrides.header?.fontColor?.color || getListboxStyle('title.main', 'color'),
      fontSize: themeOverrides.header?.fontSize || getListboxStyle('title.main', 'fontSize'),
      fontFamily: getListboxStyle('title.main', 'fontFamily'),
      fontWeight: getListboxStyle('title.main', 'fontWeight') || 'bold',
    },
    content: {
      backgroundColor: checkboxes ? undefined : selections.possible,
      color: selections.possibleContrast || getListboxStyle('content', 'color'),
      fontSize: themeOverrides.content?.fontSize || getListboxStyle('content', 'fontSize'),
      fontFamily: getListboxStyle('content', 'fontFamily'),
    },
    selections,
  };
}
