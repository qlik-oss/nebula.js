import { useMemo } from 'react';
import {
  resolveBgColor,
  resolveBgImage,
  resolveTextStyle,
  resolveBorder,
  resolveBorderRadius,
  resolveBoxShadow,
} from '../utils/style/styling-props';

const useStyling = (layout, theme, app, themeName) => {
  const styling = useMemo(() => {
    if (layout && theme) {
      const generalComp = layout.components ? layout.components.find((comp) => comp.key === 'general') : null;
      const titleStyles = {
        main: resolveTextStyle(generalComp, 'main', theme, layout.visualization),
        footer: resolveTextStyle(generalComp, 'footer', theme, layout.visualization),
        subTitle: resolveTextStyle(generalComp, 'subTitle', theme, layout.visualization),
      };
      const bgColor = resolveBgColor(generalComp, theme, layout.visualization);
      const bgImage = resolveBgImage(generalComp, app);
      const border = resolveBorder(generalComp, theme, layout.visualization);
      const borderRadius = resolveBorderRadius(generalComp, theme, layout.visualization);
      const boxShadow = resolveBoxShadow(generalComp, theme, layout.visualization);
      return { titleStyles, bgColor, bgImage, border, borderRadius, boxShadow };
    }
    return {};
  }, [layout, theme, app, themeName]);
  return styling;
};

export default useStyling;
