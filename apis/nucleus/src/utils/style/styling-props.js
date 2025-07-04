import { getFullBoxShadow } from './shadow-utils';
import resolveProperty from './resolve-property';
import resolveColor from './resolve-color';

const imageSizingToCssProperty = {
  originalSize: 'auto auto',
  alwaysFit: 'contain',
  fitWidth: '100% auto',
  fitHeight: 'auto 100%',
  stretchFit: '100% 100%',
  alwaysFill: 'cover',
};

const positionToCss = {
  'top-left': 'top left',
  'top-center': 'top center',
  'top-right': 'top right',
  'center-left': 'center left',
  'center-center': 'center center',
  'center-right': 'center right',
  'bottom-left': 'bottom left',
  'bottom-center': 'bottom center',
  'bottom-right': 'bottom right',
};

// TODO: this needs some proper verification
function getSenseServerUrl(app) {
  let config;
  let wsUrl;
  let protocol;
  let isSecure;

  if (app?.session?.config) {
    config = app.session.config;
    wsUrl = new URL(config.url);

    isSecure = wsUrl.protocol === 'wss:';
    protocol = isSecure ? 'https://' : 'http://';
    return protocol + wsUrl.host;
  }
  return '';
}

function getBackgroundPosition(bgComp) {
  let bkgImagePosition = 'center center';
  if (bgComp?.bgImage?.position) {
    bkgImagePosition = positionToCss[bgComp.bgImage.position];
  }
  return bkgImagePosition;
}

function getBackgroundSize(bgComp) {
  let bkgImageSize = imageSizingToCssProperty.originalSize;
  const size = bgComp?.bgImage?.sizing;
  if (size) {
    bkgImageSize = imageSizingToCssProperty[size];
  }
  return bkgImageSize;
}

function resolveImageUrl(app, relativeUrl) {
  return relativeUrl ? getSenseServerUrl(app) + relativeUrl : undefined;
}

export function resolveBgImage(bgComp, app, queryParams) {
  const bgImageDef = bgComp?.bgImage;

  if (bgImageDef) {
    let url = '';
    if (bgImageDef.mode === 'media' || bgComp.useImage === 'media') {
      let authParamsAsString;
      const urlObj = bgImageDef?.mediaUrl;
      const { qUrl } = urlObj?.qStaticContentUrl || {};
      url = qUrl ? decodeURIComponent(qUrl) : undefined;
      url = resolveImageUrl(app, url);

      if (queryParams) {
        authParamsAsString = Object.entries(queryParams)
          .map(([key, value]) => `&${key}=${encodeURIComponent(value)}`)
          .join('&');
        url = `${url}?${authParamsAsString}`;
      }
    }
    if (bgImageDef.mode === 'expression') {
      url = bgImageDef.expressionUrl ? decodeURIComponent(bgImageDef.expressionUrl) : undefined;
    }
    const pos = getBackgroundPosition(bgComp);
    const size = getBackgroundSize(bgComp);

    return url ? { url, pos, size } : undefined;
  }
  return undefined;
}

export function resolveBgColor(comp, theme, objectType) {
  const bgColor = comp?.bgColor;
  if (bgColor && theme) {
    if (bgColor.useExpression || bgColor.useColorExpression) {
      return theme.validateColor(bgColor.colorExpression);
    }
  }
  return resolveColor(bgColor?.color, '', 'backgroundColor', theme, objectType);
}

export function resolveBorder(comp, theme, objectType, disableThemeBorder) {
  const borderColor = resolveColor(comp?.borderColor, '', 'borderColor', theme, objectType);
  let borderWidth = comp?.borderWidth;
  const shouldGetborderFromTheme = !borderWidth && !disableThemeBorder;
  if (shouldGetborderFromTheme) {
    borderWidth = resolveProperty('', 'borderWidth', theme, objectType);
  }
  return borderWidth && borderColor ? `${borderWidth} solid ${borderColor}` : undefined;
}

export function resolveBorderRadius(comp, theme, objectType) {
  return comp?.borderRadius || resolveProperty('', 'borderRadius', theme, objectType);
}

export function resolveBoxShadow(comp, theme, objectType) {
  const themeBoxShadow = resolveProperty('shadow', 'boxShadow', theme, objectType);
  const boxShadow = comp?.shadow?.boxShadow || themeBoxShadow;
  const boxShadowColor = resolveColor(comp?.shadow?.boxShadowColor, 'shadow', 'boxShadowColor', theme, objectType);
  return getFullBoxShadow(boxShadow, themeBoxShadow, boxShadowColor);
}

function unfurlFontStyle(fontStyle, target) {
  if (fontStyle && Array.isArray(fontStyle)) {
    return fontStyle;
  }
  return target === 'main' ? ['bold'] : [];
}

export function resolveTextStyle(textComp, target, theme, objectType) {
  const textProps = textComp?.title?.[target] || {};
  const fontStyle = unfurlFontStyle(textProps.fontStyle, target);

  return {
    fontFamily: textProps.fontFamily || theme.getStyle(`object.${objectType}`, `title.${target}`, 'fontFamily'),
    fontSize: textProps.fontSize || theme.getStyle(`object.${objectType}`, `title.${target}`, 'fontSize'),
    color:
      textProps.color && textProps.color.color !== 'none'
        ? theme.getColorPickerColor(textProps.color)
        : theme.getStyle(`object.${objectType}`, `title.${target}`, 'color'),
    backgroundColor:
      textProps.backgroundColor || theme.getStyle(`object.${objectType}`, `title.${target}`, 'backgroundColor'),
    fontWeight: fontStyle.includes('bold') ? 'bold' : 'normal',
    fontStyle: fontStyle.includes('italic') ? 'italic' : 'normal',
    textDecoration: fontStyle.includes('underline') ? 'underline' : 'initial',
  };
}
