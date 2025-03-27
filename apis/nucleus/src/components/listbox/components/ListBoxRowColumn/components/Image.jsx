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
        horizontal: 'center',
        vertical: 'flex-start',
      };
    case 'bottomLeft':
      return {
        horizontal: 'flex-end',
        vertical: 'flex-start',
      };
    case 'topCenter':
      return {
        horizontal: 'flex-start',
        vertical: 'center',
      };
    case 'centerCenter':
      return {
        horizontal: 'center',
        vertical: 'center',
      };
    case 'bottomCenter':
      return {
        horizontal: 'flex-end',
        vertical: 'center',
      };
    case 'topRight':
      return {
        horizontal: 'flex-start',
        vertical: 'flex-end',
      };
    case 'centerRight':
      return {
        horizontal: 'center',
        vertical: 'flex-end',
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
      return 'contain';
    case 'fill':
      return 'fill';
    case 'fitHeight':
    case 'fitWidth':
      return 'cover';
    case 'originalSize':
      return 'none';
    default:
      return undefined;
  }
};

function Image(representation) {
  const { imageSize, imagePosition } = representation.representation;
  const isFitHeight = imageSize === 'fitHeight';
  const resolvedImagePosition = resolveImagePosition(imagePosition);
  const maxImageHeight = '200px';

  const imgNode = (
    <img
      src={representation.label}
      alt={representation.label}
      style={{
        width: getImageWidth(imageSize),
        height: '100%',
        maxHeight: maxImageHeight,
        objectFit: getObjectFit(imageSize),
        objectPosition: getObjectPosition(resolvedImagePosition),
        overflow: 'hidden',
      }}
    />
  );

  return (
    <div
      data-key="image-horizontal-container"
      style={{
        width: '100%',
        height: isFitHeight ? maxImageHeight : '100%',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: isFitHeight ? representation?.resolvedImagePosition?.horizontal : undefined,
      }}
    >
      {imgNode}
    </div>
  );
}

export default Image;
