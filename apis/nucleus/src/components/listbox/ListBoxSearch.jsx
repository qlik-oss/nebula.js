import React, { useContext, useState } from 'react';
import { InputAdornment, OutlinedInput } from '@material-ui/core';
import Search from '@nebula.js/ui/icons/search';

import { makeStyles } from '@nebula.js/ui/theme';

import InstanceContext from '../../contexts/InstanceContext';

const useStyles = makeStyles((theme) => ({
  root: {
    border: 'none',
    borderRadius: 0,
    '& fieldset': {
      border: `1px solid ${theme.palette.divider}`,
      borderWidth: '1px 0 1px 0',
      borderRadius: 0,
    },
    '&:hover': {
      border: 'none',
    },
  },
  dense: {
    fontSize: 12,
    paddingLeft: theme.spacing(1),
    '& input': {
      paddingTop: '5px',
      paddingBottom: '5px',
    },
  },
}));
const TREE_PATH = '/qListObjectDef';

export default function ListBoxSearch({ model, keyboard, dense = false }) {
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
          <Search size={dense ? 'small' : 'normal'} />
        </InputAdornment>
      }
      className={['search', classes.root, dense && classes.dense].filter(Boolean).join(' ')}
      margin="dense"
      fullWidth
      placeholder={translator.get('Listbox.Search')}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      inputProps={{
        tabIndex: keyboard && (!keyboard.enabled || keyboard.active) ? 0 : -1,
      }}
    />
  );
}
