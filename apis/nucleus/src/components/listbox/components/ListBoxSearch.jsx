import React, { useContext, useState, useEffect, useRef } from 'react';
import { InputAdornment, OutlinedInput } from '@mui/material';
import { styled } from '@mui/material/styles';
import Search from '@nebula.js/ui/icons/search';
import InstanceContext from '../../../contexts/InstanceContext';
import useDataStore from '../hooks/useDataStore';
import { CELL_PADDING_LEFT } from '../constants';

const TREE_PATH = '/qListObjectDef';
const WILDCARD = '**';

const StyledOutlinedInput = styled(OutlinedInput, {
  shouldForwardProp: (p) => !['styles', 'dense', 'isRtl'].includes(p),
})(({ theme, styles, dense, isRtl }) => {
  let denseProps = {};
  if (dense) {
    denseProps = {
      fontSize: 12,
      paddingLeft: theme.spacing(1),
      '& input': {
        paddingTop: '5px',
        paddingBottom: '5px',
      },
    };
  }
  return {
    display: 'flex',
    border: 'none',
    fontSize: 14,
    borderRadius: 0,
    backgroundColor: styles.search.backgroundColor,
    backdropFilter: styles.search.backdropFilter,
    paddingLeft: `${CELL_PADDING_LEFT}px`,
    flexDirection: isRtl ? 'row-reverse' : 'row',

    '& fieldset': {
      borderColor: `${styles.search.borderColor}`,
      borderWidth: '1px 0 1px 0',
      borderRadius: 0,
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
    '&.Mui-focused fieldset.OutlinedInput-notchedOutline': {
      borderColor: `${styles.search.highlightBorderColor} !important`,
    },
    ...denseProps,
  };
});

export default function ListBoxSearch({
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

  const { getStoreValue, setStoreValue } = useDataStore(model);
  const isRtl = direction === 'rtl';

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
    setValue(e.target.value);
    if (!e.target.value.length) {
      return abortSearch();
    }
    return model.searchListObjectFor(TREE_PATH, e.target.value);
  };

  const handleFocus = () => {
    if (wildCardSearch) {
      setValue(WILDCARD);
      setWildcardOn(true);
    }
    if (!selections.isModal()) {
      selections.begin(['/qListObjectDef']);
    }
  };

  const hasHits = () => {
    const listCount = getStoreValue(`listCount`);
    return listCount > 0;
  };

  const performSearch = async () => {
    let response;
    const success = await model.searchListObjectFor(TREE_PATH, value);
    if (success && value.length && hasHits()) {
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
    row.setAttribute('tabIndex', 0);
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
        break;
      }
      case 'Tab': {
        if (e.shiftKey) {
          keyboard.focusSelection();
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

  if (!visible || searchEnabled === false) {
    return null;
  }

  return (
    <StyledOutlinedInput
      styles={styles}
      dense={dense}
      isRtl={isRtl}
      startAdornment={
        <InputAdornment position="start">
          <Search size={dense ? 'small' : 'normal'} />
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
