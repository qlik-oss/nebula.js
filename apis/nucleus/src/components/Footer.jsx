import React from 'react';

import { styled } from '@mui/material/styles';

import { Typography, Grid, Tooltip } from '@mui/material';
import { generateFiltersString } from '../utils/generateSetExpression';
import FiltersFooter from './FiltersFooter';

const PREFIX = 'Footer';

const classes = {
  itemStyle: `${PREFIX}-itemStyle`,
};

const StyledGrid = styled(Grid)(({ theme }) => ({
  [`& .${classes.itemStyle}`]: {
    minWidth: 0,
    paddingTop: theme.spacing(1),
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

function Footer({ layout, titleStyles = {}, translator }) {
  const footerStyle = titleStyles.footer;
  const hasFilters = layout?.filters?.length > 0 && layout?.qHyperCube?.qMeasureInfo?.length > 0;
  const filtersFootnoteString = generateFiltersString(layout?.filters ?? [], translator);
  const showFilters = !layout?.footnote && hasFilters && filtersFootnoteString;

  return layout && layout.showTitles && (layout.footnote || showFilters) ? (
    <StyledGrid container>
      <Grid item className={classes.itemStyle} data-testid={CellFooter.className}>
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
