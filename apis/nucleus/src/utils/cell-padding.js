import { generateFiltersString } from './generateFiltersInfo';

const NO_PADDING_IN_CARDS_WITHOUT_TITLE = ['action-button', 'sn-nav-menu'];
const NO_PADDING_IN_CARDS = [
  'pivot-table',
  'table',
  'sn-table',
  'sn-pivot-table',
  'kpi',
  'filterpane',
  'sn-calendar',
  'sn-filter-pane',
  'sn-layout-container',
  'sn-shape',
  'sn-tabbed-container',
];
const NO_TITLE_PADDING_IN_CARDS = ['filterpane', 'sn-shape'];
const NO_FOOTER_BORDER_IN_CARDS = ['action-button', 'sn-shape', 'filterpane'];

const getPaddTitle = (visualization) => NO_TITLE_PADDING_IN_CARDS.indexOf(visualization) === -1;

const getTitlePadding = (visualization) => {
  const paddTitle = getPaddTitle(visualization);
  if (paddTitle) {
    return '10px 10px 0';
  }
  return '10px 0 0';
};
const getSubtitlePadding = (visualization, showTitle) => {
  const paddTitle = getPaddTitle(visualization);
  if (showTitle) {
    if (paddTitle) {
      return '0 10px';
    }
    return '0';
  }
  return getTitlePadding(visualization);
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
      titleStyles.main.padding = getTitlePadding(visualization);
    }
    if (showSubtitle) {
      // eslint-disable-next-line no-param-reassign
      titleStyles.subTitle.padding = getSubtitlePadding(visualization, showTitle);
    }
    if (showFootnote) {
      if (NO_FOOTER_BORDER_IN_CARDS.indexOf(visualization) === -1) {
        // eslint-disable-next-line no-param-reassign
        titleStyles.footer.borderTop = '1px solid #d9d9d9';
      }
      // eslint-disable-next-line no-param-reassign
      titleStyles.footer.padding = '6px 10px';
    }

    let bodyPadding;
    if (!isError && NO_PADDING_IN_CARDS.indexOf(visualization) !== -1) {
      bodyPadding = undefined;
    } else if (!isError && NO_PADDING_IN_CARDS_WITHOUT_TITLE.indexOf(visualization) !== -1) {
      if (!layout.showTitles) {
        bodyPadding = undefined;
      } else {
        bodyPadding = `0 10px ${showFootnote ? '0' : '5px'}`;
      }
    } else {
      bodyPadding = `${showTitle || showSubtitle ? '0' : '10px'} 10px ${showFootnote ? '0' : '5px'}`;
    }

    return bodyPadding;
  }
  return undefined;
};

export default getPadding;
