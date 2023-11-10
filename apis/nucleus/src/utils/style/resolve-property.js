export default function resolveProperty(path, attribute, theme, objectType) {
  if (theme && objectType) {
    return theme.getStyle(`object.${objectType}`, path, attribute);
  }
  if (theme) {
    return theme.getStyle('', path, attribute);
  }
  return undefined;
}
