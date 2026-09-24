import { useContext, useMemo } from 'react';
import {
  resolveBgColor,
  resolveBgImage,
  resolveTextStyle,
  resolveBorder,
  resolveBorderRadius,
  resolveBoxShadow,
} from '../utils/style/styling-props';
import InstanceContext from '../contexts/InstanceContext';

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
  'sn-table': 'straightTableV2',
  waterfallchart: 'waterfallChart',
  'sn-tabbed-container': 'tabContainer',
  'sn-slider': 'slider',
};

const getThemeObjectType = (visualization) => {
  if (THEME_OBJECT_TYPE_MAP[visualization.toLowerCase()]) {
    return THEME_OBJECT_TYPE_MAP[visualization.toLowerCase()];
  }
  return visualization;
};

const useStyling = ({ layout, theme, app, themeName, disableThemeBorder, disableFrameStyles, queryParams }) => {
  const { hostConfig } = useContext(InstanceContext);
  const styling = useMemo(() => {
    if (layout && theme) {
      const generalComp = layout.components ? layout.components.find((comp) => comp.key === 'general') : null;
      const objectType = getThemeObjectType(layout.visualization);
      const titleStyles = {
        main: resolveTextStyle(generalComp, 'main', theme, objectType),
        footer: resolveTextStyle(generalComp, 'footer', theme, objectType),
        subTitle: resolveTextStyle(generalComp, 'subTitle', theme, objectType),
      };
      const bgColor = resolveBgColor(generalComp, theme, objectType);
      const bgImage = resolveBgImage(generalComp, app, queryParams, hostConfig?.host);
      const border = disableFrameStyles ? undefined : resolveBorder(generalComp, theme, objectType, disableThemeBorder);
      const borderRadius = disableFrameStyles ? '0px' : resolveBorderRadius(generalComp, theme, objectType);
      const boxShadow = disableFrameStyles ? 'none' : resolveBoxShadow(generalComp, theme, objectType);
      return { titleStyles, bgColor, bgImage, border, borderRadius, boxShadow };
    }
    return {};
  }, [layout, theme, app, themeName, disableThemeBorder, disableFrameStyles]);
  return styling;
};

export default useStyling;
