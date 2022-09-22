import React, { useContext, useState, useEffect, useRef } from 'react';
import { useTheme } from '@nebula.js/ui/theme';
import { InputAdornment, OutlinedInput } from '@mui/material';
import Search from '@nebula.js/ui/icons/search';

import InstanceContext from '../../../contexts/InstanceContext';

const TREE_PATH = '/qListObjectDef';

export default function ListBoxSearch({ selections, model, keyboard, dense = false, visible = true }) {
  const { translator } = useContext(InstanceContext);
  const [value, setValue] = useState('');
  const [searchApplied, setSearchApplied] = useState(false);
  const theme = useTheme();
  const searchFieldRef = useRef();

  const abortSearch = async () => {
    await model.abortListObjectSearch(TREE_PATH);
  };

  const handleDeactivated = () => {
    if (!searchApplied) {
      return;
    }
    abortSearch().finally(() => {
      setValue('');
      setSearchApplied(false);
    });
  };

  useEffect(() => {
    selections.on('deactivated', handleDeactivated);
    return () => {
      selections.removeListener && selections.removeListener('deactivated', handleDeactivated);
    };
  }, []);

  const onChange = (e) => {
    setValue(e.target.value);
    if (e.target.value.length) {
      setSearchApplied(true);
      model.searchListObjectFor(TREE_PATH, e.target.value);
    }
  };

  const handleFocus = () => {
    if (!selections.isModal(model)) {
      selections.begin(['/qListObjectDef']).then(() => {
        selections.goModal && selections.goModal('/qListObjectDef');
      });
    }
  };

  const onKeyDown = (e) => {
    switch (e.key) {
      case 'Enter':
        // Maybe we only want to accept if isSearching is true
        model.acceptListObjectSearch(TREE_PATH, true);
        setValue('');
        break;
      case 'Escape':
        searchFieldRef && searchFieldRef.current && searchFieldRef.current.blur();
        break;
      default:
        break;
    }
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
      ref={searchFieldRef}
      onChange={onChange}
      onKeyDown={onKeyDown}
      inputProps={{
        tabIndex: keyboard && (!keyboard.enabled || keyboard.active) ? 0 : -1,
      }}
    />
  );
}
