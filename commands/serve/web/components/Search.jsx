import React, { useState } from 'react';
import { Grid, TextField } from '@mui/material';
import SearchIcon from '@nebula.js/ui/icons/search';

import { makeStyles } from '@nebula.js/ui/theme';

const useStyles = makeStyles((theme) => ({
  gridContainer: {
    padding: theme.spacing(0, 1, 0, 1),
  },
  gridItem: {
    padding: theme.spacing(0, 1, 0, 1),
  },
}));

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

  const { gridContainer, gridItem } = useStyles();
  const placeholder = 'Search';

  return (
    <Grid className={gridContainer} item container direction="row" alignItems="center">
      <Grid item>
        <SearchIcon />
      </Grid>
      <Grid className={gridItem} item xs>
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
