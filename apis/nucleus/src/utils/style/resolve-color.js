import resolveProperty from './resolve-property';

const supportNone = true;

export default function resolveColor(colorObj, path, attribute, theme, objectType) {
  if (colorObj && theme) {
    return colorObj.color !== 'none' ? theme.getColorPickerColor(colorObj, supportNone) : undefined;
  }
  return resolveProperty(path, attribute, theme, objectType);
}
