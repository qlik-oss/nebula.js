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

function Image({ representation, src, label }) {
  const { imageSize, imagePosition } = representation;
  const isFitHeight = imageSize === 'fitHeight';
  const resolvedImagePosition = resolveImagePosition(imagePosition);
  const maxImageHeight = '200px';

  const imgNode = src ? (
    <img
      src={src}
      alt={label}
      style={{
        width: getImageWidth(imageSize),
        height: '100%',
        maxHeight: maxImageHeight,
        objectFit: getObjectFit(imageSize),
        objectPosition: getObjectPosition(resolvedImagePosition),
        overflow: 'hidden',
      }}
    />
  ) : null;

  return (
    <div
      data-key="image-horizontal-container"
      style={{
        width: '100%',
        height: isFitHeight ? maxImageHeight : '100%',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: isFitHeight ? resolvedImagePosition?.horizontal : undefined,
      }}
    >
      {imgNode}
    </div>
  );
}

export default Image;
