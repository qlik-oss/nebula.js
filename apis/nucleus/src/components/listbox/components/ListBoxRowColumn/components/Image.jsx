import React from 'react';

const resolveImagePosition = (imagePosition) => {
  switch (imagePosition) {
    case 'topLeft':
      return {
        horizontal: 'flex-start',
        vertical: 'flex-start',
      };
    case 'centerLeft':
      return {
        horizontal: 'flex-start',
        vertical: 'center',
      };
    case 'bottomLeft':
      return {
        horizontal: 'flex-start',
        vertical: 'flex-end',
      };
    case 'topCenter':
      return {
        horizontal: 'center',
        vertical: 'flex-start',
      };
    case 'centerCenter':
      return {
        horizontal: 'center',
        vertical: 'center',
      };
    case 'bottomCenter':
      return {
        horizontal: 'center',
        vertical: 'flex-end',
      };
    case 'topRight':
      return {
        horizontal: 'flex-end',
        vertical: 'flex-start',
      };
    case 'centerRight':
      return {
        horizontal: 'flex-end',
        vertical: 'center',
      };
    case 'bottomRight':
      return {
        horizontal: 'flex-end',
        vertical: 'flex-end',
      };
    default:
      return {
        horizontal: 'flex-start',
        vertical: 'flex-start',
      };
  }
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
    case 'fitWidth':
      return 'contain';
    case 'fill':
      return 'fill';
    case 'cover':
      return 'cover';
    case 'originalSize':
      return 'none';
    default:
      return undefined;
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

// Map the title alignment settings (from the property panel) onto flexbox alignment. The title is
// overlaid on the image, so horizontal alignment drives justify-content and vertical drives align-items.
const resolveTitleAlignment = (horizontalAlign, verticalAlign) => {
  const horizontal = { left: 'flex-start', center: 'center', right: 'flex-end' }[horizontalAlign] || 'center';
  const vertical = { top: 'flex-start', middle: 'center', bottom: 'flex-end' }[verticalAlign] || 'flex-start';
  return { horizontal, vertical };
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
    imageSize,
    imagePosition,
    titleHorizontalAlign = 'center',
    titleVerticalAlign = 'top',
    titleBackground = true,
    cornerRadius = 'small',
    borderWidth = 0,
    borderColor = '#d9d9d9',
  } = representation;
  const isFitHeight = imageSize === 'fitHeight';
  const resolvedImagePosition = resolveImagePosition(imagePosition);
  const maxImageHeight = '200px';
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

  const imgNode = src ? (
    <img
      src={src}
      alt={label}
      style={{
        width: getImageWidth(imageSize),
        height: '100%',
        objectFit: getObjectFit(imageSize),
        objectPosition: getObjectPosition(resolvedImagePosition),
        overflow: 'hidden',
      }}
    />
  ) : null;

  // The title is the dimension (cell) value, and the subtitle is a per-value expression. Both are
  // overlaid on top of the image and aligned per the title alignment settings.
  const resolvedTitleAlignment = resolveTitleAlignment(titleHorizontalAlign, titleVerticalAlign);
  const hasOverlayText = title || subtitle;
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
