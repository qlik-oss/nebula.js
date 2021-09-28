import React from 'react';

import { Typography, Grid } from '@mui/material';

import { useTheme } from '@nebula.js/ui/theme';

/**
 * @interface
 * @extends HTMLElement
 * @since 2.0.0
 */
const CellFooter = {
  /** @type {'njs-cell-footer'} */
  className: 'njs-cell-footer',
};

const Footer = ({ layout }) => {
  const theme = useTheme();
  return layout && layout.showTitles && layout.footnote ? (
    <Grid container>
      <Grid item sx={{ minWidth: 0, paddingTop: theme.spacing(1) }}>
        <Typography noWrap variant="body2" className={CellFooter.className}>
          {layout.footnote}
        </Typography>
      </Grid>
    </Grid>
  ) : null;
};

export default Footer;
