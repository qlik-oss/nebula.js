import resolveProperty from './resolve-property';

// Since we handle 'none' explicitly, we can set supportNone to false,
// otherwise the palette will be skewed by one step.
const supportNone = false;

export default function resolveColor(colorObj, path, attribute, theme, objectType) {
  if (colorObj && theme) {
    return colorObj.color !== 'none' ? theme.getColorPickerColor(colorObj, supportNone) : undefined;
  }
  return resolveProperty(path, attribute, theme, objectType);
}
