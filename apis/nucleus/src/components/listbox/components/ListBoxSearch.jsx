import React, { useContext, useState, useEffect } from 'react';
import { useTheme } from '@nebula.js/ui/theme';
import { InputAdornment, OutlinedInput } from '@mui/material';
import { styled } from '@mui/material/styles';
import Search from '@nebula.js/ui/icons/search';
import InstanceContext from '../../../contexts/InstanceContext';

const TREE_PATH = '/qListObjectDef';

const StyledInputAdornment = styled(InputAdornment)(({ theme }) => ({
  color: theme.listBox?.content?.color,
}));

const StyledOutlinedInput = styled(OutlinedInput)(({ theme }) => ({
  color: theme.listBox?.content?.color,
}));

export default function ListBoxSearch({ selections, model, keyboard, listCount, dense = false, visible = true }) {
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

  useEffect(() => {
    if (!visible) {
      abortSearch(); // abort when toggling off search
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
    if (!e.target.value.length) {
      return abortSearch();
    }
    return model.searchListObjectFor(TREE_PATH, e.target.value);
  };

  const handleFocus = () => {
    if (!selections.isModal()) {
      selections.begin(['/qListObjectDef']);
    }
  };

  const hasHits = () => listCount > 0;

  const performSearch = async () => {
    let response;
    const success = await model.searchListObjectFor(TREE_PATH, value);
    if (success && value.length && hasHits()) {
      response = model.acceptListObjectSearch(TREE_PATH, true);
      // eslint-disable-next-line no-param-reassign
      selections.selectionsMade = true;
      setValue('');
    }
    return response;
  };

  const onKeyDown = async (e) => {
    let response;
    switch (e.key) {
      case 'Enter':
        response = await performSearch();
        break;
      case 'Escape':
        response = cancel();
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
    <StyledOutlinedInput
      startAdornment={
        <StyledInputAdornment position="start">
          <Search size={dense ? 'small' : 'normal'} />
        </StyledInputAdornment>
      }
      className="search"
      sx={[
        {
          border: 'none',
          borderRadius: 0,
          backgroundColor: 'transparent',
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
