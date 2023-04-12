/* eslint-disable no-param-reassign */
import KEYS from '../../../../keys';
import { getVizCell, removeLastFocused } from '../../components/useTempKeyboard';
import { focusRow, focusSearch } from './keyboard-nav-methods';

export default function getListboxContainerKeyboardNavigation({
  keyboard,
  hovering,
  updateKeyScroll,
  containerRef,
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
      // Move the focus from listbox container to the viz container.
      keyboard.blur(true);
    } else {
      // More than one listbox: Move focus from row to listbox container.

      // 1. Remove last-focused class from row siblings.
      removeLastFocused(containerRef.current);

      // 2. Add last-focused class so we can re-focus it later.
      currentTarget.classList.add('last-focused');

      // 3. Blur row and focus the listbox container.
      keyboard.blur();
      const c = currentTarget.closest('.listbox-container');
      c.setAttribute('tabIndex', 0);
      c?.focus();
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

    const container = event.currentTarget.closest('.listbox-container');
    const inSelection = isModal();

    switch (keyCode) {
      case KEYS.TAB:
        if (inSelection) {
          if (shiftKey) {
            focusRow(container) || focusSearch(container);
          } else {
            focusSearch(container) || focusRow(container);
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
