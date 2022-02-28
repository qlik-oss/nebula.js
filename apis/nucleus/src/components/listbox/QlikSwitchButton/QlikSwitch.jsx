import React from 'react';
import { makeStyles } from '@material-ui/core';
import Switch from '@material-ui/core/Switch';

export default function QlikSwitch({ checked, onChange, iconOn, iconOff }) {
  const styles = makeStyles((theme) => ({
    root: {
      opacity: 1,
      width: '34px',
      height: '30px',
      padding: '7px 0',
    },
    thumb: {
      color: theme.palette.common.white,
      boxShadow: 'none',
      margin: '5px 6px',
      width: '12px !important',
      height: '12px !important',
    },
    checked: {
      '& + $track': {
        '&:before': {
          visibility: 'hidden',
        },
        '&:after': {
          visibility: 'visible',
        },
      },
    },
    switchBase: {
      padding: '4px 0 !important',
      marginLeft: '-4px !important',
      '&:hover': {
        backgroundColor: 'inherit',
      },
    },
    colorSecondary: {
      color: '#FFFFFF',
      backgroundColor: 'inherit',
      '&$checked:hover': {
        backgroundColor: 'inherit',
      },
    },
    track: {
      borderRadius: '8px',
      border: '1px solid rgba(0, 0, 0, 0.12)',
      backgroundColor: 'rgba(0, 0, 0, 0.10)',
      opacity: '1 !important',

      '&:before, &:after': {
        top: 8,
        width: 16,
        height: 16,
        content: '""',
        position: 'absolute',
        transform: 'translateY(-50%)',
      },
      '&:before': { visibility: 'visible', ...(iconOff || {}) },
      '&:after': { visibility: 'hidden', ...(iconOn || {}) },
    },
  }));

  const classes = styles();
  return (
    <Switch
      color="secondary"
      size="small"
      checked={checked}
      classes={{
        root: classes.root,
        track: classes.track,
        thumb: classes.thumb,
        checked: classes.checked,
        switchBase: classes.switchBase,
        colorSecondary: classes.colorSecondary,
      }}
      onChange={onChange}
    />
  );
}
