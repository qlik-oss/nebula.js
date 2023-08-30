function getValue(object, path, fallback) {
  if (object === undefined || path === undefined) {
    return fallback;
  }

  const steps = path.split('.');

  let scoped = object;

  for (let i = 0; i < steps.length; ++i) {
    const step = steps[i];

    if (scoped[step] === undefined) {
      return fallback;
    }

    scoped = scoped[step];
  }

  return scoped;
}

export default function createStyleService({ theme, layout }) {
  const getLayoutValue = (reference, fallback) => getValue(layout, reference, fallback);

  const overrides = (key) => getLayoutValue('components', []).find((c) => c.key === key) || undefined;

  return {
    header: {
      getStyle: () => ({
        fontSize: overrides('listBox')?.header?.fontSize ?? theme.title?.main?.fontSize,
        fontColor: overrides('listBox')?.header?.fontColor?.color ?? theme.title?.main?.color,
      }),
    },
    content: {
      getStyle: () => ({
        fontSize: overrides('listBox')?.content?.fontSize ?? theme.content?.fontSize,
        fontColor: overrides('listBox')?.content?.fontColor?.color ?? theme.content?.color,
      }),
    },
  };
}
