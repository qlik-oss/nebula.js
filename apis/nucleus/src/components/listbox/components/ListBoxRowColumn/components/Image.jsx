import React from 'react';

// Position is stored as `{vertical}-{horizontal}` by the position-grid component (e.g. 'top-center',
// 'center-center', 'bottom-right'); older objects used camelCase ('topCenter'). Accept both and map
// each axis onto flexbox alignment.
const VERTICAL_TO_FLEX = { top: 'flex-start', center: 'center', middle: 'center', bottom: 'flex-end' };
const HORIZONTAL_TO_FLEX = { left: 'flex-start', center: 'center', right: 'flex-end' };

const parsePosition = (position) => {
  const raw = position || 'top-center';
  if (raw.includes('-')) {
    const [vertical, horizontal] = raw.split('-');
    return { vertical, horizontal };
  }
  const match = raw.match(/^(top|middle|center|bottom)(left|center|right)$/i);
  return match
    ? { vertical: match[1].toLowerCase(), horizontal: match[2].toLowerCase() }
    : { vertical: 'top', horizontal: 'center' };
};

const resolveImagePosition = (imagePosition) => {
  const { vertical, horizontal } = parsePosition(imagePosition);
  return {
    vertical: VERTICAL_TO_FLEX[vertical] ?? 'flex-start',
    horizontal: HORIZONTAL_TO_FLEX[horizontal] ?? 'center',
  };
};

const getImageWidth = (imageSize) => {
  switch (imageSize) {
    case 'fitHeight':
      return 'auto';
    case 'originalSize':
      return 'fit-content';
    case 'fill':
    case 'alwaysFit':
    case 'fitWidth':
    default:
      return '100%';
  }
};

const getObjectPosition = (resolvedImagePosition) => {
  let verticalPos = 'center';
  let horizontalPos = 'center';

  if (resolvedImagePosition?.vertical === 'flex-start') {
    verticalPos = 'top';
  } else if (resolvedImagePosition?.vertical === 'flex-end') {
    verticalPos = 'bottom';
  }

  if (resolvedImagePosition?.horizontal === 'flex-start') {
    horizontalPos = 'left';
  } else if (resolvedImagePosition?.horizontal === 'flex-end') {
    horizontalPos = 'right';
  }

  return `${horizontalPos} ${verticalPos}`;
};

const getObjectFit = (imageSize) => {
  switch (imageSize) {
    case 'alwaysFit':
    case 'fitHeight':
      return 'contain';
    // 'fitWidth' fills the width and lets the height scale proportionally (via width:100% +
    // height:auto, the object-fit equivalent of background-size: 100% auto), so no object-fit here.
    case 'stretch':
      return 'fill';
    case 'alwaysFill':
      return 'cover';
    default:
      return undefined;
  }
};

// Validate the image src before putting it in the DOM. Only http(s) URLs (including relative ones,
// which resolve against the page origin) and inline image data URIs are allowed; anything else
// (e.g. javascript: or data:text/html) is rejected.
const isSafeImageSrc = (src) => {
  if (typeof src !== 'string' || !src.trim()) {
    return false;
  }
  try {
    const url = new URL(src, window.location.origin);
    if (url.protocol === 'https:' || url.protocol === 'http:') {
      return true;
    }
    return url.protocol === 'data:' && /^data:image\//i.test(src.trim());
  } catch {
    return false;
  }
};

// Corner radius options (matching the property-panel dropdown) mapped to CSS border-radius values.
const cornerRadiusMap = {
  none: '0px',
  small: '4px',
  medium: '8px',
  large: '16px',
  full: '50%',
};

function Image({
  representation,
  src,
  label,
  title,
  subtitle,
  cellBgColor,
  placeholderBackground,
  selected = false,
  selectionColor = '#009845',
  opacity = 1,
}) {
  const {
    imageSize = 'alwaysFit',
    imagePosition,
    titlePosition = 'top-center',
    textOverlay = true,
    titleBackground = true,
    cornerRadius = 'small',
    borderWidth = 0,
    borderColor = '#d9d9d9',
  } = representation;
  const isFitHeight = imageSize === 'fitHeight';
  const isFitWidth = imageSize === 'fitWidth';
  const resolvedImagePosition = resolveImagePosition(imagePosition);
  const maxImageHeight = '200px';
  const safeSrc = isSafeImageSrc(src) ? src : null;
  const resolvedCornerRadius = cornerRadiusMap[cornerRadius] ?? '4px';
  // Selected cells get a colored border; otherwise use the configured border
  let border;
  if (selected) {
    border = `2px solid ${selectionColor}`;
  } else if (borderWidth > 0) {
    border = `${borderWidth}px solid ${borderColor}`;
  } else {
    border = '2px solid transparent';
  }

  const imgNode = safeSrc ? (
    <img
      src={safeSrc}
      alt={label}
      style={{
        width: getImageWidth(imageSize),
        // fitWidth: fill width, height scales proportionally; the container's overflow:hidden clips
        // any vertical overflow. Other modes fill the cell height (capped at maxImageHeight).
        height: isFitWidth ? 'auto' : '100%',
        maxHeight: isFitWidth ? undefined : maxImageHeight,
        objectFit: getObjectFit(imageSize),
        objectPosition: getObjectPosition(resolvedImagePosition),
        overflow: 'hidden',
      }}
    />
  ) : null;

  // The title is the dimension (cell) value, and the subtitle is a per-value expression. Both are
  // overlaid on top of the image and aligned per the title alignment settings.
  const resolvedTitleAlignment = resolveImagePosition(titlePosition);
  const hasOverlayText = textOverlay !== false && (title || subtitle);
  const overlayNode = hasOverlayText ? (
    <div
      data-key="image-title-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: resolvedTitleAlignment.horizontal,
        alignItems: resolvedTitleAlignment.vertical,
        padding: '4px',
        pointerEvents: 'none',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: '100%',
          padding: titleBackground ? '2px 6px' : 0,
          borderRadius: titleBackground ? '2px' : 0,
          backgroundColor: titleBackground ? 'rgba(255, 255, 255, 0.7)' : 'transparent',
          color: '#404040',
          overflow: 'hidden',
          textAlign: resolvedTitleAlignment.horizontal === 'center' ? 'center' : undefined,
        }}
      >
        {title && (
          <div
            data-key="image-title"
            style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {title}
          </div>
        )}
        {subtitle && (
          <div
            data-key="image-subtitle"
            style={{
              fontSize: '0.85em',
              opacity: 0.8,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div
      data-key="image-horizontal-container"
      style={{
        position: 'relative',
        width: '100%',
        height: isFitHeight ? maxImageHeight : '100%',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: isFitHeight ? resolvedImagePosition?.horizontal : undefined,
        backgroundColor: cellBgColor || placeholderBackground || undefined,
        borderRadius: resolvedCornerRadius,
        border,
        opacity,
        boxSizing: 'border-box',
      }}
    >
      {imgNode}
      {overlayNode}
    </div>
  );
}

export default Image;
