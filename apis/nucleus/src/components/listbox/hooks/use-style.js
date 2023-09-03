import utils from '@nebula.js/conversion/src/utils';

export default function createStyleService({ theme, layout }) {
  const getLayoutValue = (reference, fallback) => utils.getValue(layout, reference, fallback);

  const overrides = (key) => getLayoutValue('components', []).find((c) => c.key === key) || undefined;

  return {
    header: {
      getStyle: () => ({
        fontSize: overrides('listBox')?.header?.fontSize ?? theme?.listBox?.title?.main?.fontSize,
        fontColor: overrides('listBox')?.header?.fontColor?.color ?? theme?.listBox?.title?.main?.color,
      }),
    },
    content: {
      getStyle: () => ({
        fontSize: overrides('listBox')?.content?.fontSize ?? theme?.listBox?.content?.fontSize,
        fontColor: overrides('listBox')?.content?.fontColor?.color ?? theme?.listBox?.content?.color,
      }),
    },
  };
}
