/* eslint react/jsx-props-no-spreading: 0 */

import React from 'react';

import { CircularProgress } from '@mui/material';

import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    display: 'inline-block',
  },
  front: {
    color: theme.palette.secondary.main,
    animationDuration: '1500ms',
    position: 'absolute',
    left: 0,
  },
  back: {
    color: theme.palette.divider,
  },
}));

const SIZES = {
  small: 16,
  medium: 32,
  large: 64,
  xlarge: 128,
};

export default function Progress({ size = 'medium', ...props }) {
  const classes = useStyles();
  const s = SIZES[size];

  return (
    <div className={classes.root}>
      <CircularProgress variant="determinate" value={100} className={classes.back} size={s} thickness={3} {...props} />
      <CircularProgress
        variant="indeterminate"
        disableShrink
        className={classes.front}
        size={s}
        thickness={3}
        {...props}
      />
    </div>
  );
}
