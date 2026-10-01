import { generateFiltersString } from './generateFiltersInfo';

const NO_BORDER_IN_CARDS = ['action-button', 'sn-nav-menu', 'filterpane', 'sn-shape'];
const NO_PADDING_IN_CARDS = [
  ...NO_BORDER_IN_CARDS,
  'pivot-table',
  'table',
  'sn-table',
  'sn-pivot-table',
  'kpi',
  'sn-calendar',
  'sn-filter-pane',
  'sn-layout-container',
  'sn-tabbed-container',
];

const getTitlePadding = () => '10px 10px 0';
const getSubtitlePadding = (showTitle) => {
  if (showTitle) {
    return '0 10px';
  }
  return getTitlePadding();
};

const getPadding = ({ layout, isError, isCardTheme, titleStyles, translator }) => {
  if (isCardTheme) {
    const showTitle = layout?.showTitles && !!layout?.title;
    const showSubtitle = layout?.showTitles && !!layout?.subtitle;
    const hasFilters = layout?.filters?.length > 0 && layout?.qHyperCube?.qMeasureInfo?.length > 0;
    const visualization = layout?.visualization;
    const filtersFootnoteString = generateFiltersString(layout?.filters ?? [], translator);
    const showFilters = !layout?.footnote && hasFilters && filtersFootnoteString;
    const showFootnote = layout?.showTitles && (!!layout?.footnote || showFilters);

    if (showTitle) {
      // eslint-disable-next-line no-param-reassign
      titleStyles.main.padding = getTitlePadding();
    }
    if (showSubtitle) {
      // eslint-disable-next-line no-param-reassign
      titleStyles.subTitle.padding = getSubtitlePadding(showTitle);
    }
    if (showFootnote) {
      if (NO_BORDER_IN_CARDS.indexOf(visualization) === -1) {
        // eslint-disable-next-line no-param-reassign
        titleStyles.footer.borderTop = '1px solid #d9d9d9';
      }
      // eslint-disable-next-line no-param-reassign
      titleStyles.footer.padding = '6px 10px';
    }

    let bodyPadding;
    if (isError || NO_PADDING_IN_CARDS.indexOf(visualization) === -1) {
      bodyPadding = `${showTitle || showSubtitle ? '0' : '10px'} 10px ${showFootnote ? '0' : '5px'}`;
    }

    return bodyPadding;
  }
  return undefined;
};

export default getPadding;
