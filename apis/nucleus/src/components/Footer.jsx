import React from 'react';

import { styled } from '@mui/material/styles';

import { Typography, Grid, Tooltip } from '@mui/material';
import { generateFiltersString } from '../utils/generateFiltersInfo';
import FiltersFooter from './FiltersFooter';

const PREFIX = 'Footer';

const classes = {
  itemStyle: `${PREFIX}-itemStyle`,
};

const StyledGrid = styled(Grid)(() => ({
  [`& .${classes.itemStyle}`]: {
    minWidth: 0,
    width: '100%',
  },
}));

/**
 * @interface
 * @extends HTMLElement
 * @since 2.0.0
 */
const CellFooter = {
  /** @type {'njs-cell-footer'} */
  className: 'njs-cell-footer',
};

function Footer({ layout, titleStyles = {}, translator, flags, isCardTheme }) {
  const footerStyle = titleStyles.footer;
  const hasFilters = layout?.filters?.length > 0 && layout?.qHyperCube?.qMeasureInfo?.length > 0;
  const filtersFootnoteString = generateFiltersString(layout?.filters ?? [], translator);
  const showFilters = !layout?.footnote && hasFilters && filtersFootnoteString;
  const themePaddingEnabled = flags?.isEnabled('VNA-13_CELLPADDING_FROM_THEME');
  const paddingTop = isCardTheme ? '1px' : '6px';

  return layout && layout.showTitles && (layout.footnote || showFilters) ? (
    <StyledGrid container>
      <Grid
        item
        className={classes.itemStyle}
        data-testid={CellFooter.className}
        sx={{ paddingTop: (theme) => (themePaddingEnabled ? paddingTop : theme.spacing(1)) }}
      >
        {layout.footnote && (
          <Tooltip title={layout.footnote}>
            <Typography noWrap variant="body2" className={CellFooter.className} style={footerStyle}>
              {layout.footnote}
            </Typography>
          </Tooltip>
        )}
        {showFilters && (
          <FiltersFooter
            layout={layout}
            translator={translator}
            filtersFootnoteString={filtersFootnoteString}
            footerStyle={footerStyle}
          />
        )}
      </Grid>
    </StyledGrid>
  ) : null;
}

export default Footer;
