function getOverridesAsObject(components = []) {
  const overrides = {};

  components.forEach((c) => {
    overrides[c.key] = c;
  });

  return overrides;
}

export default function createStyleService({ theme, components = [] }) {
  const overrides = getOverridesAsObject(components);
  const { listBox: listBoxTheme = {} } = theme || {};

  return {
    header: {
      getStyle: () => ({
        fontSize: overrides.header?.fontSize ?? listBoxTheme.title?.main?.fontSize,
        fontColor: overrides.header?.fontColor?.color ?? listBoxTheme.title?.main?.color,
      }),
    },
    content: {
      getStyle: () => ({
        fontSize: overrides.content?.fontSize ?? listBoxTheme.content?.fontSize,
        fontColor: overrides.content?.fontColor?.color ?? listBoxTheme.content?.color,
      }),
    },
    palette: {
      getStyle: () => ({
        selected: overrides.palette?.selected?.color ?? theme?.palette?.selected?.main, // TODO: check the theme paths if they are correct
        alternative: overrides.palette?.alternative?.color ?? theme?.palette?.selected?.alternative,
        excluded: overrides.palette?.excluded?.color ?? theme?.palette?.selected?.excluded,
      }),
    },
  };
}
