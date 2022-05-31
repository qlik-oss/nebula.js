/* eslint react/jsx-props-no-spreading: 0 */

import React from 'react';

import { styled } from '@mui/material/styles';

import { CircularProgress } from '@mui/material';

const PREFIX = 'Progress';

const classes = {
  root: `${PREFIX}-root`,
  front: `${PREFIX}-front`,
  back: `${PREFIX}-back`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {
    position: 'relative',
    display: 'inline-block',
  },

  [`& .${classes.front}`]: {
    color: theme.palette.secondary.main,
    animationDuration: '1500ms',
    position: 'absolute',
    left: 0,
  },

  [`& .${classes.back}`]: {
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
  const s = SIZES[size];

  return (
    <Root className={classes.root}>
      <CircularProgress variant="determinate" value={100} className={classes.back} size={s} thickness={3} {...props} />
      <CircularProgress
        variant="indeterminate"
        disableShrink
        className={classes.front}
        size={s}
        thickness={3}
        {...props}
      />
    </Root>
  );
}
