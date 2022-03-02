import React from 'react';
import Switch from '@material-ui/core/Switch';
import { styled } from '@material-ui/core';

const StyledSwitch = styled(Switch)(({ theme, iconOn, iconOff }) => ({
  '&.qlik-switch-root': {
    opacity: 1,
    width: '34px !important',
    height: '30px !important',
    padding: '7px 0 !important',
  },
  '& .qlik-switch-colorSecondary': {
    color: '#FFFFFF',
    backgroundColor: 'inherit',
    '&.qlik-switch-checked:hover': {
      backgroundColor: 'inherit',
    },
  },
  '& .qlik-switch-checked': {
    '& + .qlik-switch-track': {
      '&:before': {
        visibility: 'hidden',
      },
      '&:after': {
        visibility: 'visible',
      },
    },
  },
  '& .qlik-switch-switchBase': {
    padding: '4px 0',
    marginLeft: '-4px',
    '&:hover': {
      backgroundColor: 'inherit',
    },
  },
  '& .qlik-switch-thumb': {
    color: theme.palette.common.white,
    boxShadow: 'none',
    margin: '5px 6px',
    width: '12px',
    height: '12px',
  },
  '& .qlik-switch-track': {
    borderRadius: '8px',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    backgroundColor: 'rgba(0, 0, 0, 0.10)',
    opacity: '1 !important',

    '&::before, &::after': {
      top: 8,
      width: 16,
      height: 16,
      content: '""',
      position: 'absolute',
      transform: 'translateY(-50%)',
    },
    '&::before': { visibility: 'visible', right: 3, ...(iconOff || {}) },
    '&::after': { visibility: 'hidden', left: 3, ...(iconOn || {}) },
  },
}));

export default function QlikSwitch({ checked, onChange, iconOn, iconOff }) {
  return (
    <StyledSwitch
      color="secondary"
      size="small"
      iconOn={iconOn}
      iconOff={iconOff}
      checked={checked}
      classes={{
        root: `qlik-switch-root`,
        track: 'qlik-switch-track',
        thumb: 'qlik-switch-thumb',
        checked: 'qlik-switch-checked',
        switchBase: 'qlik-switch-switchBase',
        colorSecondary: 'qlik-switch-colorSecondary',
      }}
      onChange={onChange}
    />
  );
}
