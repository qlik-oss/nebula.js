/* eslint-disable no-param-reassign */
import KEYS from '../../../keys';
import { getVizCell } from './listbox-keyboard-navigation-utils';

const getElementIndex = (currentTarget) => +currentTarget.getAttribute('data-n');

export function getFieldKeyboardNavigation({
  select,
  selectAll,
  onCtrlF,
  confirm,
  cancel,
  setScrollPosition,
  focusListItems,
  keyboard,
  isModal,
}) {
  const getElement = (elm, next = false) => {
    const parentElm = elm && elm.parentElement[next ? 'nextElementSibling' : 'previousElementSibling'];
    return parentElm && parentElm.querySelector('[role]');
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
        const inSelection = isModal();

        if (shiftKey) {
          if (!keyboard.focusSearch()) {
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
        elementToFocus = getElement(currentTarget, true);
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
        elementToFocus = getElement(currentTarget, false);
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

export function getListboxInlineKeyboardNavigation({
  keyboard,
  hovering,
  updateKeyScroll,
  currentScrollIndex,
  isModal,
  constraints,
}) {
  const blur = (event) => {
    const { currentTarget, target } = event;
    const isFocusedOnListbox = target.classList.contains('listbox-container');
    const container = currentTarget.closest('.listbox-container');
    const vizCell = getVizCell(container);
    const isSingleListbox = vizCell?.querySelectorAll('.listbox-container').length === 1;
    if (isFocusedOnListbox || isSingleListbox) {
      // Move the focus from listbox container to the VIZ container.
      keyboard.blur(true);
    } else {
      // We have more than one listbox: Move focus from row to LISTBOX container.
      keyboard.blur('.listbox-container');
    }
  };

  const handleKeyDown = (event) => {
    const { keyCode, shiftKey = false } = event.nativeEvent;

    const prevent = () => {
      event.stopPropagation();
      event.preventDefault();
    };

    if (!keyboard.enabled) {
      // Other keys should not be handled unless keyboard is enabled.
      return;
    }

    const inSelection = isModal();

    switch (keyCode) {
      case KEYS.TAB:
        if (inSelection) {
          if (shiftKey) {
            keyboard.focusRow() || keyboard.focusSearch();
          } else {
            keyboard.focusSearch() || keyboard.focusRow();
          }
        } else if (shiftKey) {
          keyboard.blur(true);
        } else {
          break;
        }
        prevent();
        break;
      case KEYS.ENTER:
      case KEYS.SPACE:
        if (!event.target.classList.contains('listbox-container')) {
          break; // don't mess with keydown handlers within the listbox (e.g. row seletion)
        }
        keyboard.focus();
        prevent();
        break;
      case KEYS.ESCAPE:
        blur(event);
        break;
      default:
        break;
    }
  };

  const globalKeyDown = (event) => {
    if (!hovering.current) {
      return;
    }
    const { keyCode, ctrlKey = false, shiftKey = false } = event;

    switch (keyCode) {
      case KEYS.ARROW_UP:
        updateKeyScroll({ up: 1 });
        break;
      case KEYS.ARROW_DOWN:
        updateKeyScroll({ down: 1 });
        break;
      case KEYS.PAGE_UP:
        updateKeyScroll({ up: currentScrollIndex.stop - currentScrollIndex.start });
        break;
      case KEYS.PAGE_DOWN:
        updateKeyScroll({ down: currentScrollIndex.stop - currentScrollIndex.start });
        break;
      case KEYS.HOME:
        updateKeyScroll({ scrollPosition: ctrlKey && shiftKey ? 'overflowStart' : 'start' });
        break;
      case KEYS.END:
        updateKeyScroll({ scrollPosition: ctrlKey && shiftKey ? 'overflowEnd' : 'end' });
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  const focusOnHoverDisabled = () => {
    const selectNotAllowed = constraints?.select || constraints?.active;
    const appInModal = isModal();
    return selectNotAllowed || appInModal;
  };

  const handleOnMouseEnter = () => {
    if (!focusOnHoverDisabled()) {
      hovering.current = true;
    }
  };

  const handleOnMouseLeave = () => {
    if (hovering.current) {
      hovering.current = false;
    }
  };

  return { handleKeyDown, handleOnMouseEnter, handleOnMouseLeave, globalKeyDown };
}
