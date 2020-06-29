/* eslint-disable react/no-array-index-key */
import React from 'react';
import { Grid, Typography, IconButton } from '@material-ui/core';
import WarningTriangle from '@nebula.js/ui/icons/warning-triangle-2';
import Tick from '@nebula.js/ui/icons/tick';
import { useTheme } from '@nebula.js/ui/theme';

const DescriptionRow = ({ d }) => {
  const theme = useTheme();
  let color = 'inherit';
  let styleColor = theme.palette.success.main;
  if (d.missing) {
    styleColor = theme.palette.warning.main;
  } else if (d.error) {
    color = 'error';
    styleColor = theme.palette.error.main;
  }
  const style = { color: styleColor };
  const Icon = (
    <IconButton disabled>
      {d.missing || d.error ? <WarningTriangle style={style} /> : <Tick style={style} />}
    </IconButton>
  );
  return (
    <Grid item container alignItems="center" wrap="nowrap">
      <Grid item>{Icon}</Grid>
      <Grid container item zeroMinWidth wrap="nowrap">
        <Typography noWrap component="p">
          <Typography component="span" variant="subtitle2" color={color}>
            {d.description}
          </Typography>
          <Typography component="span"> </Typography>
          <Typography
            component="span"
            variant="subtitle2"
            color={d.error ? 'error' : 'inherit'}
            style={{ fontWeight: 400 }}
          >
            {d.label}
          </Typography>
        </Typography>
      </Grid>
    </Grid>
  );
};

const Descriptions = ({ data }) => {
  const theme = useTheme();
  return (
    <Grid item style={{ maxWidth: '80%', overflow: 'hidden' }}>
      {data.map((e, ix) => {
        const Rows = e.descriptions.map((d, dix) => <DescriptionRow d={d} key={dix} />);
        return (
          <Grid
            container
            item
            key={ix}
            direction="column"
            style={{
              paddingBottom: `${theme.spacing(2)}px`,
            }}
          >
            <Typography noWrap key={ix} variant="subtitle1" align="left" color="textSecondary">
              {e.title}
            </Typography>
            {Rows}
          </Grid>
        );
      })}
    </Grid>
  );
};

export default function Error({ title = 'Error', message = '', data = [] }) {
  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justify="center"
      style={{ position: 'relative', height: '100%', width: '100%' }}
      spacing={1}
    >
      <Grid item>
        <WarningTriangle style={{ fontSize: '38px' }} />
      </Grid>
      <Grid item>
        <Typography variant="h6" align="center" data-tid="error-title">
          {title}
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="subtitle1" align="center" data-tid="error-message">
          {message}
        </Typography>
      </Grid>
      <Descriptions data={data} />
    </Grid>
  );
}

export { Descriptions, DescriptionRow };
