import React from 'react';

import { Typography, Grid } from '@material-ui/core';

const Footer = ({ layout }) =>
  layout && layout.showTitles && layout.footnote ? (
    <Grid container>
      <Grid item style={{ minWidth: 0 }}>
        <Typography noWrap variant="body2">
          {layout.footnote}
        </Typography>
      </Grid>
    </Grid>
  ) : null;

export default Footer;
