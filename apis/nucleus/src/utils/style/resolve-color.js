import resolveProperty from './resolve-property';

export default function resolveColor(colorObj, path, attribute, theme, objectType) {
  if (colorObj && theme) {
    return colorObj.color !== 'none' ? theme.getColorPickerColor(colorObj, true) : undefined;
  }
  return resolveProperty(path, attribute, theme, objectType);
}
