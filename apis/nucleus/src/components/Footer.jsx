import React from 'react';

import { styled } from '@mui/material/styles';

import { Typography, Grid } from '@mui/material';

const PREFIX = 'Footer';

const classes = {
  itemStyle: `${PREFIX}-itemStyle`,
};

const StyledGrid = styled(Grid)(({ theme }) => ({
  [`& .${classes.itemStyle}`]: {
    minWidth: 0,
    paddingTop: theme.spacing(1),
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

function Footer({ layout, titleStyles = {} }) {
  return layout && layout.showTitles && layout.footnote ? (
    <StyledGrid container>
      <Grid item className={classes.itemStyle}>
        <Typography noWrap variant="body2" className={CellFooter.className} style={titleStyles.footer}>
          {layout.footnote}
        </Typography>
      </Grid>
    </StyledGrid>
  ) : null;
}

export default Footer;
