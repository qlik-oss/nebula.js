import Color from '../../../utils/color';
import { resolveBgColor, resolveBgImage } from '../../../utils/style/styling-props';

const LIGHT = '#FFF';
const DARK = '#000';

export const CONTRAST_THRESHOLD = 1.5;
const LIGHT_PREFERRED_THRESHOLD = 3;

const DEFAULT_SELECTION_COLORS = {
  selected: '#009845',
  alternative: '#E4E4E4',
  excluded: '#A9A9A9',
  selectedExcluded: '#A9A9A9',
  possible: '#FFFFFF',
};

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

  // color priority: layout.component > theme > sprout
  const desiredTextColor =
    getColorPickerColor(componentContentTextColor) ||
    getListboxStyle('content', 'color') ||
    theme.palette?.text.primary;

  const useContrastTextColor = !checkboxes && (overrides.theme?.content?.useContrastColor ?? true);

  const componentSelectionColors = overrides.selections?.colors || {};

  const getSelectionStateColors = (state) => {
    const paletteState = state === 'selected' ? 'main' : state;
    const contrastState = `${state}Contrast`;
    // color priority: layout.component > sprout > hardcoded default
    const color =
      getColorPickerColor(componentSelectionColors[state]) ||
      (state === 'possible' && getListboxStyle('', 'backgroundColor')) ||
      theme.palette?.selected[paletteState] ||
      DEFAULT_SELECTION_COLORS[state];

    const contrastColor = useContrastTextColor
      ? getContrastingColor(color, desiredTextColor)
      : desiredTextColor || theme.palette?.selected[`${contrastState}Text}`];

    return { [state]: color, [contrastState]: contrastColor };
  };

  return {
    ...getSelectionStateColors('selected'),
    ...getSelectionStateColors('alternative'),
    ...getSelectionStateColors('excluded'),
    ...getSelectionStateColors('selectedExcluded'),
    ...getSelectionStateColors('possible'),
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

function getSearchBGColor(bgCol, getListboxStyle) {
  const searchBgColorObj = new Color(getListboxStyle('', 'backgroundColor'));
  searchBgColorObj.setAlpha(0.7);
  return searchBgColorObj.isInvalid() ? bgCol : searchBgColorObj.toRGBA();
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

  const bgColor = bgComponentColor || getListboxStyle('', 'backgroundColor') || theme.palette.background.default;

  const searchBgColor = getSearchBGColor(bgColor, getListboxStyle);
  const searchColor = getSearchColor(getListboxStyle);

  const headerFontStyle = themeOverrides.header?.fontStyle || {};
  const contentFontStyle = themeOverrides.content?.fontStyle || {};

  // Ensure we only return falseValue when the component is used, and thus has a false value.
  const getWithFallback = (value, trueValue, falseValue) =>
    (value === true && trueValue) || (value === false && falseValue) || undefined;

  return {
    background: {
      backgroundColor: bgColor,
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
      highlightBorderColor: theme.palette.custom.focusBorder,
      backgroundColor: searchBgColor,
      backdropFilter: 'blur(8px)',
    },
    selections,
  };
}
