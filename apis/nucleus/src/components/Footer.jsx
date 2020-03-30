import React from 'react';

import { makeStyles, Typography, Grid } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  itemStyle: {
    minWidth: 0,
    paddingTop: theme.spacing(1),
  },
}));

const Footer = ({ layout }) => {
  const { itemStyle } = useStyles();
  return layout && layout.showTitles && layout.footnote ? (
    <Grid container>
      <Grid item className={itemStyle}>
        <Typography noWrap variant="body2">
          {layout.footnote}
        </Typography>
      </Grid>
    </Grid>
  ) : null;
};

export default Footer;
