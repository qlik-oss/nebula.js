import React, { useContext, useState } from 'react';
import { Grid, TextField } from '@material-ui/core';
import Search from '@nebula.js/ui/icons/search';

import { makeStyles } from '@nebula.js/ui/theme';

import LocaleContext from '../../contexts/LocaleContext';

const useStyles = makeStyles(theme => ({
  gridContainer: {
    padding: theme.spacing(0, 1, 0, 1),
  },
  gridItem: {
    padding: theme.spacing(0, 1, 0, 1),
  },
}));

const TREE_PATH = '/qListObjectDef';

export default function ListBoxSearch({ model }) {
  const translator = useContext(LocaleContext);
  const [value, setValue] = useState('');
  const onChange = e => {
    setValue(e.target.value);
    model.searchListObjectFor(TREE_PATH, e.target.value);
  };
  const onKeyDown = e => {
    switch (e.key) {
      case 'Enter':
        model.acceptListObjectSearch(TREE_PATH, true);
        setValue('');
        break;
      case 'Escape':
        model.abortListObjectSearch(TREE_PATH);
        break;
      default:
        break;
    }
  };

  const { gridContainer, gridItem } = useStyles();

  return (
    <Grid className={gridContainer} item container direction="row" alignItems="center">
      <Grid item>
        <Search />
      </Grid>
      <Grid className={gridItem} item xs>
        <TextField
          fullWidth
          autoFocus
          placeholder={translator.get('Listbox.Search')}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
      </Grid>
    </Grid>
  );
}
