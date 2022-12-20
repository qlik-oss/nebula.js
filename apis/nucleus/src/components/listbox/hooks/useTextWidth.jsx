import { useMemo } from 'react';

const getContext = () => {
  const fragment = document.createDocumentFragment();
  const canvas = document.createElement('canvas');
  fragment.appendChild(canvas);
  return canvas.getContext('2d');
};

const getTextWidth = (currentText, font) => {
  const context = getContext();
  context.font = font;

  if (Array.isArray(currentText)) {
    return Math.max(...currentText.map((t) => context.measureText(t).width));
  }
  const metrics = context.measureText(currentText);
  return metrics.width;
};

const useTextWidth = (options) => {
  const textOptions = useMemo(() => ('text' in options ? options : {}), [options]);

  return useMemo(
    () => getTextWidth(textOptions.text, textOptions.font || '14px Source Sans Pro'),
    [textOptions.text, textOptions.font]
  );
};

export default useTextWidth;
