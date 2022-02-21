import React, { useState } from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { Box, FormHelperText, styled } from '@material-ui/core';
// import IconAssociationsOn from './IconAssociations';

const AssociationsSwitch = styled(Switch)((/* { theme } */) => ({
  padding: 8,
  '&.MuiSwitch-sizeSmall': {
    width: '48px',
    height: '32px',
    '& .MuiSwitch-switchBase': {
      padding: '6px 4px',
    },
  },
  '& .MuiSwitch-colorSecondary.Mui-checked': {
    color: '#ffffff',
  },
  '.MuiSwitch-colorSecondary.Mui-checked + .MuiSwitch-track': {
    opacity: 1,
  },
  '&.MuiIconButton-label': {},
  '& .MuiSwitch-track': {
    borderRadius: '8px',
    '&:before, &:after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      width: 16,
      height: 16,
    },
    '&:before': {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 16 16"><path fill="${encodeURIComponent(
        '#FFFFFF'
        // theme.palette.getContrastText(theme.palette.primary.main)
      )}" d="M12.5,0 C14.4,0 16,1.6 16,3.5 C16,5.4 14.4,7 12.5,7 C11.8,7 11.2,6.8 10.6,6.4 L9.8,7.2 C9.9,7.5 10,7.7 10,8 C10,9.1 9.1,10 8,10 C7.7,10 7.5,9.9 7.2,9.8 L6.4,10.6 C6.8,11.2 7,11.8 7,12.5 C7,14.4 5.4,16 3.5,16 C1.6,16 0,14.4 0,12.5 C0,10.6 1.6,9 3.5,9 C4.2,9 4.8,9.2 5.4,9.6 L6.2,8.8 C6.1,8.5 6,8.3 6,8 C6,6.9 6.9,6 8,6 C8.3,6 8.5,6.1 8.8,6.2 L9.6,5.4 C9.2,4.8 9,4.2 9,3.5 C9,1.6 10.6,0 12.5,0 Z M4.9,13.9 C5.3,13.5 5.5,13 5.5,12.5 C5.5,12 5.3,11.5 4.9,11.1 C4.5,10.7 4,10.5 3.5,10.5 C3,10.5 2.5,10.7 2.1,11.1 C1.7,11.5 1.5,12 1.5,12.5 C1.5,13 1.7,13.5 2.1,13.9 C2.5,14.3 3,14.5 3.5,14.5 C4,14.5 4.5,14.3 4.9,13.9 Z M13.9,4.9 C14.3,4.5 14.5,4 14.5,3.5 C14.5,3 14.3,2.5 13.9,2.1 C13.5,1.7 13,1.5 12.5,1.5 C12,1.5 11.5,1.7 11.1,2.1 C10.7,2.5 10.5,3 10.5,3.5 C10.5,4 10.7,4.5 11.1,4.9 C11.5,5.3 12,5.5 12.5,5.5 C13,5.5 13.5,5.3 13.9,4.9 Z"/></svg>')`,
      left: 12,
    },
    '&:after': {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 16 16"><path fill="${encodeURIComponent(
        '#FFFFFF'
        // theme.palette.getContrastText(theme.palette.primary.main)
      )}" d="M12.5,0 C14.4,0 16,1.6 16,3.5 C16,5.4 14.4,7 12.5,7 C11.8,7 11.2,6.8 10.6,6.4 L9.8,7.2 C9.9,7.5 10,7.7 10,8 C10,9.1 9.1,10 8,10 C7.7,10 7.5,9.9 7.2,9.8 L6.4,10.6 C6.8,11.2 7,11.8 7,12.5 C7,14.4 5.4,16 3.5,16 C1.6,16 0,14.4 0,12.5 C0,10.6 1.6,9 3.5,9 C4.2,9 4.8,9.2 5.4,9.6 L6.2,8.8 C6.1,8.5 6,8.3 6,8 C6,6.9 6.9,6 8,6 C8.3,6 8.5,6.1 8.8,6.2 L9.6,5.4 C9.2,4.8 9,4.2 9,3.5 C9,1.6 10.6,0 12.5,0 Z M4.9,13.9 C5.3,13.5 5.5,13 5.5,12.5 C5.5,12 5.3,11.5 4.9,11.1 C4.5,10.7 4,10.5 3.5,10.5 C3,10.5 2.5,10.7 2.1,11.1 C1.7,11.5 1.5,12 1.5,12.5 C1.5,13 1.7,13.5 2.1,13.9 C2.5,14.3 3,14.5 3.5,14.5 C4,14.5 4.5,14.3 4.9,13.9 Z M13.9,4.9 C14.3,4.5 14.5,4 14.5,3.5 C14.5,3 14.3,2.5 13.9,2.1 C13.5,1.7 13,1.5 12.5,1.5 C12,1.5 11.5,1.7 11.1,2.1 C10.7,2.5 10.5,3 10.5,3.5 C10.5,4 10.7,4.5 11.1,4.9 C11.5,5.3 12,5.5 12.5,5.5 C13,5.5 13.5,5.3 13.9,4.9 Z" /></svg>')`,
      right: 12,
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: 'none',
    width: 12,
    height: 12,
    margin: '3px 5px',
  },
}));

export default function ListBoxToggleButton({ label, startOn, onChange }) {
  const [isOn, setOn] = useState(startOn || false);
  const onSwitchChange = (event) => {
    setOn(event.target.checked);
    onChange(event.target.checked);
  };
  return (
    <Box>
      <FormControlLabel
        control={
          <AssociationsSwitch
            color="secondary"
            size="small"
            checked={isOn}
            onChange={onSwitchChange}
            sx={{ opacity: 1 }}
          />
        }
        label={label}
      />
      <FormHelperText>Be careful</FormHelperText>
    </Box>
  );
}
