import React, { useContext, useState, useEffect, useRef } from 'react';
import { InputAdornment, OutlinedInput, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import Search from '@nebula.js/ui/icons/search';
import Close from '@nebula.js/ui/icons/close';
import InstanceContext from '../../../contexts/InstanceContext';
import useDataStore from '../hooks/useDataStore';
import { CELL_PADDING_LEFT } from '../constants';
import { focusCyclicButton } from '../interactions/keyboard-navigation/keyboard-nav-methods';

const MAX_SEARCH_LENGTH = 64000;
const TREE_PATH = '/qListObjectDef';
const WILDCARD = '**';

const limitSearchLength = (val) => val?.substring(0, MAX_SEARCH_LENGTH);

const StyledOutlinedInput = styled(OutlinedInput, {
  shouldForwardProp: (p) => !['styles', 'dense', 'isRtl'].includes(p),
})(({ styles, dense, isRtl }) => {
  let denseProps = {};
  if (dense) {
    denseProps = {
      fontSize: 12,
      '& input': {
        paddingTop: '5px',
        paddingBottom: '5px',
        color: styles.search.color,
        textAlign: isRtl ? 'right' : 'left',
      },
    };
  }
  return {
    display: 'flex',
    border: 'none',
    fontSize: 14,
    borderRadius: 0,
    backgroundColor: styles.search.backgroundColor,
    backdropFilter: styles.background.backgroundImage ? styles.search.backdropFilter : undefined,
    paddingLeft: 0,
    paddingRight: 0,
    flexDirection: isRtl ? 'row-reverse' : 'row',

    '& fieldset': {
      borderColor: `${styles.search.borderColor}`,
      borderWidth: '1px 0 1px 0',
      borderRadius: 0,
    },
    '&.Mui-focused fieldset': {
      borderColor: `${styles.search.highlightBorderColor} !important`,
    },
    '& .MuiInputBase-root': {
      ...styles.search,
    },
    '& *': {
      color: styles.search.color,
    },
    '& input': {
      color: styles.search.color,
      textAlign: isRtl ? 'right' : 'left',
    },
    ...denseProps,
  };
});

const StyledIconButton = styled(IconButton)(() => ({
  border: 0,
  padding: '8px',
  cursor: 'pointer',
  lineHeight: '12px',
  '&:hover': {
    backgroundColor: 'transparent',
  },
  ':focus-visible': {
    borderRadius: '4px',
    boxShadow: 'inset 0 0 0 2px rgb(2, 117, 217)',
  },
}));

export default function ListBoxSearch({
  popoverOpen,
  selections,
  selectionState,
  model,
  keyboard,
  dense = false,
  visible = true,
  autoFocus = true,
  wildCardSearch = false,
  searchEnabled,
  direction,
  hide,
  styles,
}) {
  const { translator } = useContext(InstanceContext);
  const [value, setValue] = useState('');
  const [wildcardOn, setWildcardOn] = useState(false);
  const inputRef = useRef();
  const clearSearchRef = useRef();
  const clearSearchText = translator.get('Listbox.Clear.Search');

  const { getStoreValue, setStoreValue } = useDataStore(model);
  const isRtl = direction === 'rtl';

  const cancel = () => selections.cancel();

  const abortSearch = async () => {
    try {
      await model.abortListObjectSearch(TREE_PATH);
    } finally {
      setValue('');
    }
  };

  useEffect(() => {
    if (visible) {
      return () => abortSearch(); // abort when toggling off search
    }
    return () => {};
  }, [visible]);

  useEffect(() => {
    selections.on('deactivated', abortSearch);
    return () => {
      selections.removeListener && selections.removeListener('deactivated', abortSearch);
    };
  }, []);

  useEffect(() => {
    if (wildcardOn && inputRef.current) {
      const cursorPos = value.length - 1;
      inputRef.current.setSelectionRange(cursorPos, cursorPos); // place the cursor in the wildcard
      setWildcardOn(false);
    }
  }, [wildcardOn, inputRef.current]);

  useEffect(() => {
    setStoreValue('inputText', value);
  }, [value]);

  const onChange = async (e) => {
    const searchValue = limitSearchLength(e.target.value);
    setValue(searchValue);
    if (!searchValue.length) {
      return abortSearch();
    }
    return model.searchListObjectFor(TREE_PATH, searchValue);
  };

  const handleFocus = () => {
    if (wildCardSearch) {
      setValue(WILDCARD);
      setWildcardOn(true);
    }
  };

  const hasHits = () => {
    const listCount = getStoreValue(`listCount`);
    return listCount > 0;
  };

  const performSearch = async () => {
    let response;
    const searchValue = limitSearchLength(value);
    const success = await model.searchListObjectFor(TREE_PATH, searchValue);
    if (selectionState.selectDisabled()) {
      return success;
    }
    if (success && searchValue.length && hasHits()) {
      response = model.acceptListObjectSearch(TREE_PATH, true);
      // eslint-disable-next-line no-param-reassign
      selections.selectionsMade = true;
      selectionState.clearItemStates(false);
      setValue('');
    }
    return response;
  };

  function focusRow(container) {
    const row = container?.querySelector('.last-focused') || container?.querySelector('[role="row"]:first-child');
    row?.setAttribute('tabIndex', 0);
    row?.focus();
  }

  const onKeyDown = async (e) => {
    const { currentTarget } = e;
    const container = currentTarget.closest('.listbox-container');
    switch (e.key) {
      case 'Enter':
        performSearch();
        break;
      case 'Escape': {
        focusRow(container);
        cancel();
        if (popoverOpen) {
          return undefined;
        }
        break;
      }
      case 'Tab': {
        if (e.shiftKey) {
          if (!focusCyclicButton(container)) {
            keyboard.focusSelection();
          }
        } else if (clearSearchRef.current) {
          clearSearchRef.current.focus();
        } else {
          // Focus the row we last visited or the first one.
          focusRow(container);

          // Clean up.
          container?.querySelectorAll('.last-focused').forEach((elm) => {
            elm.classList.remove('last-focused');
          });
        }
        break;
      }
      case 'f':
      case 'F':
        if (e.ctrlKey || e.metaKey) {
          if (hide) {
            hide();
            // Focus the row we last visited or the first one.
            focusRow(container);
          }
        } else {
          return undefined;
        }
        break;
      default:
        return undefined;
    }
    e.preventDefault();
    e.stopPropagation();
    return undefined;
  };

  const focusOnInput = () => {
    inputRef.current?.focus();
  };

  const onClearSearch = () => {
    abortSearch();
    focusOnInput();
  };

  const onKeyDownClearSearch = async (e) => {
    const container = e.currentTarget.closest('.listbox-container');
    switch (e.key) {
      case 'Enter':
        onClearSearch();
        break;
      case 'Tab': {
        if (e.shiftKey) {
          focusOnInput();
        } else {
          // Focus the row we last visited or the first one.
          focusRow(container);

          // Clean up.
          container?.querySelectorAll('.last-focused').forEach((elm) => {
            elm.classList.remove('last-focused');
          });
        }
        break;
      }
      default:
        return undefined;
    }
    e.preventDefault();
    e.stopPropagation();
    return undefined;
  };

  if (!visible || searchEnabled === false) {
    return null;
  }

  return (
    <StyledOutlinedInput
      styles={styles}
      dense={dense}
      isRtl={isRtl}
      startAdornment={
        <InputAdornment position="start" sx={{ marginLeft: dense ? '8px' : `${CELL_PADDING_LEFT}px` }}>
          <Search size={dense ? 'small' : 'normal'} />
        </InputAdornment>
      }
      endAdornment={
        <InputAdornment position="end" sx={{ marginLeft: 0 }}>
          {value !== '' && (
            <StyledIconButton
              tabIndex={0}
              ref={clearSearchRef}
              title={clearSearchText}
              aria-label={clearSearchText}
              onClick={onClearSearch}
              onKeyDown={onKeyDownClearSearch}
            >
              <Close size={dense ? 'small' : 'normal'} />
            </StyledIconButton>
          )}
        </InputAdornment>
      }
      className="search"
      inputRef={inputRef}
      size="small"
      fullWidth
      placeholder={translator.get('Listbox.Search')}
      value={value}
      onFocus={handleFocus}
      onChange={onChange}
      onKeyDown={onKeyDown}
      autoFocus={autoFocus}
      inputProps={{
        tabIndex: keyboard.innerTabStops ? 0 : -1,
        'data-testid': 'search-input-field',
        'aria-label': translator.get('Listbox.Search.ScreenReaderInstructions'),
      }}
    />
  );
}
