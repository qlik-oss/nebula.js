import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Grid, TextField } from '@mui/material';
import SearchIcon from '@nebula.js/ui/icons/search';

const PREFIX = 'Search';

const classes = {
  gridContainer: `${PREFIX}-gridContainer`,
  gridItem: `${PREFIX}-gridItem`,
};

const StyledGrid = styled(Grid)(({ theme }) => ({
  [`& .${classes.gridContainer}`]: {
    padding: theme.spacing(0, 1, 0, 1),
  },

  [`& .${classes.gridItem}`]: {
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

  const placeholder = 'Search';

  return (
    <StyledGrid className={classes.gridContainer} item container direction="row" alignItems="center">
      <Grid item>
        <SearchIcon />
      </Grid>
      <Grid className={classes.gridItem} item xs>
        <TextField
          fullWidth
          autoFocus
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onKeyDown={onKeyDown}
        />
      </Grid>
    </StyledGrid>
  );
}
