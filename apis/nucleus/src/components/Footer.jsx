import React from 'react';

import { makeStyles, Typography, Grid } from '@material-ui/core';

/**
 * @interface
 * @extends HTMLElement
 * @since 2.0.0
 */
const CellFooter = {
  /** @type {'njs-cell-footer'} */
  className: 'njs-cell-footer',
};

const useStyles = makeStyles((theme) => ({
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
        <Typography noWrap variant="body2" className={CellFooter.className}>
          {layout.footnote}
        </Typography>
      </Grid>
    </Grid>
  ) : null;
};

export default Footer;
