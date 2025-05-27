import { useEffect, useState } from 'react';
import {
  resolveBgColor,
  resolveBgImage,
  resolveTextStyle,
  resolveBorder,
  resolveBorderRadius,
  resolveBoxShadow,
} from '../utils/style/styling-props';

const THEME_OBJECT_TYPE_MAP = {
  linechart: 'lineChart',
  barchart: 'barChart',
  combochart: 'comboChart',
  scatterplot: 'scatterPlot',
  piechart: 'pieChart',
  straightable: 'straightTable',
  pivottable: 'pivotTable',
  table: 'straightTable',
  'pivot-table': 'pivotTable',
  listbox: 'listBox',
  referenceline: 'referenceLine',
  datacolors: 'dataColors',
  'text-image': 'textImage',
  boxplot: 'boxPlot',
  map: 'mapChart',
  mapchart: 'mapChart',
  bulletchart: 'bulletChart',
};

const getThemeObjectType = (visualization) => {
  if (THEME_OBJECT_TYPE_MAP[visualization.toLowerCase()]) {
    return THEME_OBJECT_TYPE_MAP[visualization.toLowerCase()];
  }
  return visualization;
};

async function fetchStyling(layout, theme, app, disableThemeBorder, hostConfig) {
  if (layout && theme) {
    const generalComp = layout.components ? layout.components.find((comp) => comp.key === 'general') : null;
    const objectType = getThemeObjectType(layout.visualization);
    const titleStyles = {
      main: resolveTextStyle(generalComp, 'main', theme, objectType),
      footer: resolveTextStyle(generalComp, 'footer', theme, objectType),
      subTitle: resolveTextStyle(generalComp, 'subTitle', theme, objectType),
    };
    const bgColor = resolveBgColor(generalComp, theme, objectType);
    const bgImage = await resolveBgImage(generalComp, app, hostConfig);
    const border = resolveBorder(generalComp, theme, objectType, disableThemeBorder);
    const borderRadius = resolveBorderRadius(generalComp, theme, objectType);
    const boxShadow = resolveBoxShadow(generalComp, theme, objectType);
    return { titleStyles, bgColor, bgImage, border, borderRadius, boxShadow };
  }
  return {};
}

const useStyling = ({ layout, theme, app, themeName, disableThemeBorder, hostConfig }) => {
  const [styling, setStyling] = useState({});
  useEffect(() => {
    const styl = async () => {
      const result = await fetchStyling(layout, theme, app, disableThemeBorder, hostConfig);
      setStyling(result);
    };
    styl();
  }, [layout, theme, app, themeName, disableThemeBorder, hostConfig]);

  return styling;
};

export default useStyling;
