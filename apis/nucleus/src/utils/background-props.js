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
  return undefined;
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
  if (bgComp?.bgImage?.sizing) {
    bkgImageSize = imageSizingToCssProperty[bgComp.bgImage.sizing];
  }
  return bkgImageSize;
}

function resolveImageUrl(app, relativeUrl) {
  return relativeUrl ? getSenseServerUrl(app) + relativeUrl : undefined;
}

export const resolveBgImage = (bgComp, app) => {
  const bgImageDef = bgComp?.bgImage;

  if (bgImageDef) {
    let url = '';
    if (bgImageDef.mode === 'media' || bgComp.useImage === 'media') {
      url = bgImageDef?.mediaUrl?.qStaticContentUrl?.qUrl
        ? decodeURIComponent(bgImageDef.mediaUrl.qStaticContentUrl.qUrl)
        : undefined;
      url = resolveImageUrl(app, url);
    }
    if (bgImageDef.mode === 'expression') {
      url = bgImageDef.expressionUrl ? decodeURIComponent(bgImageDef.expressionUrl) : undefined;
    }
    const pos = getBackgroundPosition(bgComp);
    const size = getBackgroundSize(bgComp);

    return url ? { url, pos, size } : undefined;
  }
  return undefined;
};

export const resolveBgColor = (bgComp, theme) => {
  const bgColor = bgComp?.bgColor;
  if (bgColor && theme) {
    if (bgColor.useColorExpression) {
      return theme.validateColor(bgColor.colorExpression);
    }
    return bgColor.color && bgColor.color.color !== 'none' ? theme.getColorPickerColor(bgColor.color) : undefined;
  }
  return undefined;
};
