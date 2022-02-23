import React from 'react';
import { styled } from '@material-ui/core';
import Switch from '@material-ui/core/Switch';

export default function QlikStyledSwitch({ checked, onChange, iconOn, iconOff }) {
  const StyledSwitch = styled(Switch)(({ theme }) => {
    const { prefix: p } = theme;
    return {
      width: '34px',
      height: '30px',
      padding: '7px 0',
      [`& .${p}-MuiSwitch-switchBase`]: {
        padding: '4px 0',
        marginLeft: '-4px',
      },
      [`& .${p}-MuiIconButton-label`]: {
        color: theme.palette.common.white,
      },
      [`& .${p}-MuiSwitch-colorSecondary`]: {
        backgroundColor: 'inherit',
        '&.Mui-checked:hover': {
          backgroundColor: 'inherit',
        },
      },
      [`& .Mui-checked + .${p}-MuiSwitch-track`]: {
        '&:before': {
          display: 'none',
        },
      },
      [`& :not(.Mui-checked) + .${p}-MuiSwitch-track`]: {
        '&:after': {
          display: 'none',
        },
      },
      [`& .${p}-MuiSwitch-track`]: {
        borderRadius: '8px',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        backgroundColor: 'rgba(0, 0, 0, 0.10)',
        opacity: '1 !important',
        ...(iconOn || iconOff
          ? {
              '&:before, &:after': {
                content: '""',
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 16,
                height: 16,
              },
            }
          : {}),
        ...(iconOn ? { '&:before': { ...iconOn } } : {}),
        ...(iconOff ? { '&:after': { ...iconOff } } : {}),
      },
      [`& .${p}-MuiSwitch-thumb`]: {
        boxShadow: 'none',
        width: 12,
        height: 12,
        margin: '5px 6px',
      },
    };
  });
  return <StyledSwitch color="secondary" size="small" checked={checked} sx={{ opacity: 1 }} onChange={onChange} />;
}
