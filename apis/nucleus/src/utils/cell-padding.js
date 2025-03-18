const NP_PADDINH_IN_CARDS_WITHOUT_TITLE = ['action-button', 'sn-nav-menu'];
const NO_PADDING_IN_CARDS = [
  'pivot-table',
  'table',
  'sn-table',
  'sn-pivot-table',
  'kpi',
  'map',
  'filterpane',
  'sn-calendar',
  'sn-filter-pane',
  'sn-layout-container',
  'sn-listbox',
  'sn-shape',
  'sn-tabbed-container',
];

const shouldUseCardPadding = ({ isCardTheme, layout, isError }) => {
  const visualization = layout?.visualization;

  if (!isCardTheme) {
    return false;
  }
  if (isError) {
    return true;
  }

  if (NO_PADDING_IN_CARDS.indexOf(visualization) !== -1) {
    return false;
  }
  const showTitle = layout?.showTitles;
  if (!showTitle && NP_PADDINH_IN_CARDS_WITHOUT_TITLE.indexOf(visualization) !== -1) {
    return false;
  }
  return true;
};

const getPadding = ({ layout, isError, senseTheme, titleStyles }) => {
  const isCardTheme = senseTheme?.getStyle('', '', '_cards');
  const cardPadding = shouldUseCardPadding({ isCardTheme, layout, isError });
  if (isCardTheme) {
    const showTitle = layout?.showTitles && !!layout?.title;
    const showSubtitle = layout?.showTitles && !!layout?.subtitle;
    const showFootnote = layout?.showTitles && !!layout?.footnote;

    if (showTitle && cardPadding) {
      // eslint-disable-next-line no-param-reassign
      titleStyles.main.padding = '10px 10px 0';
    }
    if (showSubtitle && cardPadding) {
      // eslint-disable-next-line no-param-reassign
      titleStyles.subTitle.padding = showTitle ? '0 10px' : '10px 10px 0';
    }
    if (showFootnote) {
      // eslint-disable-next-line no-param-reassign
      titleStyles.footer.borderTop = '1px solid #d9d9d9';
      // eslint-disable-next-line no-param-reassign
      titleStyles.footer.padding = '6px 10px';
    }

    let bodyPadding;
    if (cardPadding) {
      bodyPadding = `${showTitle || showSubtitle ? '0' : '10px'} 10px ${showFootnote ? '0' : '5px'}`;
    }

    return bodyPadding;
  }
  return undefined;
};

export default getPadding;
