import Color from '../../../utils/color';
import { resolveBgColor, resolveBgImage } from '../../../utils/style/styling-props';

const LIGHT = '#FFF';
const DARK = '#000';

export const CONTRAST_THRESHOLD = 1.5;
const LIGHT_PREFERRED_THRESHOLD = 3;

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

export function getContrastingColor(backgroundColor, desiredTextColor = undefined, dark = DARK, light = LIGHT) {
  const lightColor = new Color(light);
  const bg = new Color(backgroundColor);
  const des = new Color(desiredTextColor);
  if (bg.isInvalid() || des.isInvalid() || bg.getAlpha() < 1 || des.getAlpha() < 1) {
    return desiredTextColor;
  }

  // Always prioritise light color if it gives better contrast than desired color's.
  const lightColorContrast = getContrast(lightColor, bg);
  const desiredColorContrast = getContrast(des, bg);
  const useLightColor = lightColorContrast > desiredColorContrast || lightColorContrast > LIGHT_PREFERRED_THRESHOLD;

  let contrastingColor;
  if (desiredTextColor && desiredColorContrast > CONTRAST_THRESHOLD && !useLightColor) {
    contrastingColor = desiredTextColor;
  } else {
    contrastingColor = useLightColor ? light : dark;
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

function getSelectionColors({ getColorPickerColor, theme, getListboxStyle, overrides, checkboxes }) {
  const componentContentTextColor = overrides.theme?.content?.fontColor;
  const desiredTextColor =
    getColorPickerColor(componentContentTextColor) ||
    getListboxStyle('content', 'color') ||
    theme.palette?.text.primary;

  const useContrastTextColor = !checkboxes && (overrides.theme?.content?.useContrastColor ?? true);

  // Background colors
  const selectionColors = overrides.selections?.colors || {};

  const selected = getColorPickerColor(selectionColors.selected) || theme.palette?.selected.main || '#009845';
  const alternative =
    getColorPickerColor(selectionColors.alternative) || theme.palette?.selected.alternative || '#E4E4E4';
  const excluded = getColorPickerColor(selectionColors.excluded) || theme.palette?.selected.excluded || '#A9A9A9';
  const selectedExcluded =
    getColorPickerColor(selectionColors.selectedExcluded) || theme.palette?.selected.selectedExcluded || '#A9A9A9';
  const possible =
    getColorPickerColor(selectionColors.possible) ||
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

function getBackgroundColor({ themeApi, themeOverrides }) {
  let color;
  const bgColor = themeOverrides?.background;
  if (!bgColor) {
    return color;
  }
  if (bgColor?.useExpression) {
    color = resolveBgColor({ bgColor }, themeApi, 'listBox');
  } else {
    color = themeApi.getColorPickerColor(bgColor?.color, false);
  }
  return color;
}

function getSearchColor(getListboxStyle) {
  const desiredTextColor = getListboxStyle('content', 'color');
  const color = getContrastingColor('#fff', desiredTextColor);
  return color;
}

export default function getStyles({ app, themeApi, theme, components = [], checkboxes = false }) {
  const overrides = getOverridesAsObject(components);
  const getListboxStyle = (path, prop) => themeApi.getStyle('object.listBox', path, prop);
  const getColorPickerColor = (c) => (c?.index > 0 || c?.color ? themeApi.getColorPickerColor(c, false) : undefined);

  const selections = getSelectionColors({ getColorPickerColor, theme, getListboxStyle, overrides, checkboxes });
  const themeOverrides = overrides.theme || {};

  const headerColor = getColorPickerColor(themeOverrides.header?.fontColor) || getListboxStyle('title.main', 'color');

  const bgComponentColor = getBackgroundColor({ themeApi, themeOverrides });

  const bgImage = themeOverrides.background?.image
    ? resolveBgImage({ bgImage: themeOverrides.background.image }, app)
    : undefined;

  const searchBgColor = 'rgba(255, 255, 255, 0.7)';
  const searchColor = getSearchColor(getListboxStyle);

  const headerFontStyle = themeOverrides.header?.fontStyle || {};
  const contentFontStyle = themeOverrides.content?.fontStyle || {};

  // Ensure we only return falseValue when the component is used, and thus has a false value.
  const getWithFallback = (value, trueValue, falseValue) =>
    (value === true && trueValue) || (value === false && falseValue) || undefined;

  return {
    background: {
      backgroundColor: bgComponentColor || getListboxStyle('', 'backgroundColor') || theme.palette.background.default,
      backgroundImage: bgImage?.url && !bgImage?.url.startsWith('url(') ? `url('${bgImage.url}')` : undefined,
      backgroundRepeat: 'no-repeat',
      backgroundSize: bgImage?.size,
      backgroundPosition: bgImage?.pos,
    },
    header: {
      color: headerColor,
      fontSize: themeOverrides.header?.fontSize || getListboxStyle('title.main', 'fontSize'),
      fontFamily: themeOverrides.header?.fontFamily || getListboxStyle('title.main', 'fontFamily'),
      fontWeight:
        getWithFallback(headerFontStyle.bold, 'bold', 'normal') ||
        getListboxStyle('title.main', 'fontWeight') ||
        'bold',
      textDecoration: headerFontStyle.underline ? 'underline' : 'initial',
      fontStyle:
        getWithFallback(headerFontStyle.italic, 'italic', 'normal') ||
        getListboxStyle('title.main', 'fontStyle') ||
        'initial',
    },
    content: {
      backgroundColor: checkboxes ? undefined : selections.possible,
      color: selections.possibleContrast || getListboxStyle('content', 'color'),
      fontSize: themeOverrides.content?.fontSize || getListboxStyle('content', 'fontSize'),
      fontFamily: themeOverrides.content?.fontFamily || getListboxStyle('content', 'fontFamily'),
      fontWeight:
        getWithFallback(contentFontStyle.bold, 'bold', 'normal') ||
        getListboxStyle('content', 'fontWeight') ||
        'normal',
      textDecoration: contentFontStyle.underline ? 'underline' : 'initial',
      fontStyle:
        getWithFallback(contentFontStyle.italic, 'italic', 'normal') ||
        getListboxStyle('content', 'fontStyle') ||
        'initial',
    },
    search: {
      color: searchColor,
      borderColor: theme.palette.divider,
      highlightBorderColor: theme.palette.primary.main,
      backgroundColor: searchBgColor,
      backdropFilter: 'blur(8px)',
    },
    selections,
  };
}
