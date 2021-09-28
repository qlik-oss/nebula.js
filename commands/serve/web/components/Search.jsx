import React, { useState } from 'react';
import { Grid, TextField } from '@mui/material';
import SearchIcon from '@nebula.js/ui/icons/search';

import { useTheme } from '@nebula.js/ui/theme';

export default function Search({ onChange = () => {}, onEnter = () => {}, onEscape = () => {} }) {
  const [value, setValue] = useState('');
  const handleChange = (e) => {
    setValue(e.target.value);
    onChange(e.target.value);
  };
  const onKeyDown = (e) => {
    switch (e.key) {
      case 'Enter':
        onEnter();
        setValue('');
        break;
      case 'Escape':
        onEscape();
        break;
      default:
        break;
    }
  };

  const theme = useTheme();
  const placeholder = 'Search';

  return (
    <Grid sx={{ padding: theme.spacing(0, 1, 0, 1) }} item container direction="row" alignItems="center">
      <Grid item>
        <SearchIcon />
      </Grid>
      <Grid sx={{ padding: theme.spacing(0, 1, 0, 1) }} item xs>
        <TextField
          variant="standard"
          fullWidth
          autoFocus
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onKeyDown={onKeyDown}
        />
      </Grid>
    </Grid>
  );
}
