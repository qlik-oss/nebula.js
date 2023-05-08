import KEYS from '../../../../keys';
import { focusSearch, getElementIndex } from './keyboard-nav-methods';
import findNextItemIndex from './find-next-item-index';

export default function getRowsKeyboardNavigation({
  select,
  selectAll,
  onCtrlF,
  onTyping,
  confirm,
  cancel,
  setScrollPosition,
  focusListItems,
  keyboard,
  isModal,
  rowCount,
  columnCount,
  rowIndex,
  columnIndex,
  layoutOrder,
}) {
  const getElement = (keyCode, elm, next = false) => {
    if (
      keyCode === KEYS.ARROW_LEFT ||
      keyCode === KEYS.ARROW_RIGHT ||
      !(typeof rowIndex === 'number' && typeof columnIndex === 'number')
    ) {
      const parentElm = elm?.parentElement[next ? 'nextElementSibling' : 'previousElementSibling'];
      return parentElm?.querySelector('[role]');
    }
    const gridElm = elm?.parentElement.parentElement;
    const numCells = gridElm?.childElementCount;
    if (numCells) {
      const nextIndex = findNextItemIndex({
        rowIndex,
        columnIndex,
        rowCount,
        columnCount,
        layoutOrder,
        keyCode,
        numCells,
      });
      const nextElm = elm?.parentElement.parentElement.children[nextIndex];
      return nextElm?.querySelector('[role]');
    }
    return undefined;
  };

  let startedRange = false;
  const setStartedRange = (val) => {
    startedRange = val;
  };

  const handleKeyDown = (event) => {
    let elementToFocus;
    const { currentTarget, nativeEvent } = event;
    const { keyCode, shiftKey = false, ctrlKey = false, metaKey = false } = nativeEvent;
    switch (keyCode) {
      case KEYS.TAB: {
        // Try to focus search field, otherwise confirm button.
        const container = currentTarget.closest('.listbox-container');
        const inSelection = isModal();

        // TODO: use a store to keep track of this row.
        currentTarget.classList.add('last-focused'); // so that we can go back here when we tab back

        if (shiftKey) {
          if (!focusSearch(container)) {
            if (inSelection) {
              keyboard.focusSelection();
            } else {
              keyboard.blur(true);
            }
          }
          break;
        }

        // Without shift key
        if (inSelection) {
          keyboard.focusSelection();
        } else {
          currentTarget.blur();
          keyboard.blur();
        }
        break;
      }
      case KEYS.SHIFT:
        // This is to ensure we include the first value when starting a range selection.
        setStartedRange(true);
        break;
      case KEYS.SPACE:
        select([getElementIndex(currentTarget)], false, event);
        break;
      case KEYS.ARROW_DOWN:
      case KEYS.ARROW_RIGHT:
        elementToFocus = getElement(keyCode, currentTarget, true);
        if (shiftKey && elementToFocus) {
          if (startedRange) {
            select([getElementIndex(currentTarget)], true);
            setStartedRange(false);
          }
          select([getElementIndex(elementToFocus)], true);
        }
        break;
      case KEYS.ARROW_UP:
      case KEYS.ARROW_LEFT:
        elementToFocus = getElement(keyCode, currentTarget, false);
        if (shiftKey && elementToFocus) {
          if (startedRange) {
            select([getElementIndex(currentTarget)], true);
            setStartedRange(false);
          }
          select([getElementIndex(elementToFocus)], true);
        }
        break;
      case KEYS.ENTER:
        confirm();
        break;
      case KEYS.ESCAPE:
        if (isModal()) {
          cancel();
        } else {
          return; // propagate to other Esc handler
        }
        break;
      case KEYS.HOME:
        focusListItems.setFirst(true);
        if (ctrlKey) {
          setScrollPosition?.('overflowStart');
          break;
        }
        setScrollPosition?.('start');
        break;
      case KEYS.END:
        focusListItems.setLast(true);
        if (ctrlKey) {
          setScrollPosition?.('overflowEnd');
          break;
        }
        setScrollPosition?.('end');
        break;
      case KEYS.A:
        if (ctrlKey || metaKey) {
          selectAll();
          break;
        }
        return;
      case KEYS.F:
        if (ctrlKey || metaKey) {
          onCtrlF();
          break;
        }
        return;
      default:
        // TODO: do something to handle search starting with keys A/F
        {
          let key = String.fromCharCode(keyCode);
          if (!shiftKey && keyCode >= 65 && keyCode <= 90) {
            key = key.toLowerCase();
          }
          onTyping(key);
        }
        return; // don't stop propagation since we want to outsource keydown to other handlers.
    }
    if (elementToFocus) {
      elementToFocus.focus();
    }
    event.preventDefault();
    event.stopPropagation();
  };
  return handleKeyDown;
}
