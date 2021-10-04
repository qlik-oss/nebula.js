import React, { useContext, useState } from 'react';
import { InputAdornment, OutlinedInput } from '@material-ui/core';
import Search from '@nebula.js/ui/icons/search';

import { makeStyles } from '@nebula.js/ui/theme';

import InstanceContext from '../../contexts/InstanceContext';

const useStyles = makeStyles((theme) => ({
  root: {
    '& fieldset': {
      borderRadius: 0,
      borderColor: `${theme.palette.divider} transparent`,
    },
  },
}));
const TREE_PATH = '/qListObjectDef';

export default function ListBoxSearch({ model, autoFocus = true }) {
  const { translator } = useContext(InstanceContext);
  const [value, setValue] = useState('');
  const onChange = (e) => {
    setValue(e.target.value);
    model.searchListObjectFor(TREE_PATH, e.target.value);
  };
  const onKeyDown = (e) => {
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

  const classes = useStyles();

  return (
    <OutlinedInput
      startAdornment={
        <InputAdornment position="start">
          <Search />
        </InputAdornment>
      }
      className={[classes.root].join(' ')}
      autoFocus={autoFocus}
      margin="dense"
      fullWidth
      placeholder={translator.get('Listbox.Search')}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  );
}
