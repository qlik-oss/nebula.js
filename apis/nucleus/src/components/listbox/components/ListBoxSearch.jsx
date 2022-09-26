import React, { useContext, useState, useEffect } from 'react';
import { useTheme } from '@nebula.js/ui/theme';
import { InputAdornment, OutlinedInput } from '@mui/material';
import Search from '@nebula.js/ui/icons/search';

import InstanceContext from '../../../contexts/InstanceContext';

const TREE_PATH = '/qListObjectDef';

export default function ListBoxSearch({ selections, model, keyboard, dense = false, visible = true }) {
  const { translator } = useContext(InstanceContext);
  const [value, setValue] = useState('');
  const theme = useTheme();

  const cancel = () => selections.isActive() && selections.cancel();

  const abortSearch = async () => {
    if (!selections.isModal()) {
      return;
    }
    try {
      await model.abortListObjectSearch(TREE_PATH);
    } finally {
      setValue('');
    }
  };

  const handleDeactivate = () => {
    cancel();
  };

  useEffect(() => {
    if (!visible) {
      handleDeactivate(); // always abort when toggling off search
    }
  }, [visible]);

  useEffect(() => {
    selections.on('deactivated', abortSearch);
    return () => {
      selections.removeListener && selections.removeListener('deactivated', abortSearch);
    };
  }, []);

  const onChange = async (e) => {
    setValue(e.target.value);
    if (e.target.value.length) {
      return model.searchListObjectFor(TREE_PATH, e.target.value);
    }
    return undefined;
  };

  const handleFocus = () => {
    if (!selections.isModal(model)) {
      selections.begin(['/qListObjectDef']);
    }
  };

  const onKeyDown = (e) => {
    let response;
    switch (e.key) {
      case 'Enter':
        // Maybe we only want to accept if isSearching is true
        response = model.acceptListObjectSearch(TREE_PATH, true);
        setValue('');
        break;
      case 'Escape':
        cancel();
        e.preventDefault();
        e.stopPropagation();
        break;
      default:
        break;
    }
    return response;
  };

  if (!visible) {
    return null;
  }

  return (
    <OutlinedInput
      startAdornment={
        <InputAdornment position="start">
          <Search size={dense ? 'small' : 'normal'} />
        </InputAdornment>
      }
      className="search"
      sx={[
        {
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
        dense && {
          fontSize: 12,
          paddingLeft: theme.spacing(1),
          '& input': {
            paddingTop: '5px',
            paddingBottom: '5px',
          },
        },
      ]}
      size="small"
      fullWidth
      placeholder={translator.get('Listbox.Search')}
      value={value}
      onFocus={handleFocus}
      onChange={onChange}
      onKeyDown={onKeyDown}
      inputProps={{
        tabIndex: keyboard && (!keyboard.enabled || keyboard.active) ? 0 : -1,
      }}
    />
  );
}
