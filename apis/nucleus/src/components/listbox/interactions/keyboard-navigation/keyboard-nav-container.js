/* eslint-disable no-param-reassign */
import KEYS from '../../../../keys';
import { blur, focusCyclicButton, focusRow, focusSearch } from './keyboard-nav-methods';

export default function getListboxContainerKeyboardNavigation({
  keyboard,
  hovering,
  updateKeyScroll,
  currentScrollIndex,
  isModal,
  constraints,
  selections,
}) {
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
    switch (keyCode) {
      case KEYS.TAB:
        //  Only react to tab after enter/space have been pressed or the target element is inside listbox (mouse case)
        if (document.activeElement === container || !container.contains(document.activeElement)) return;
        if (shiftKey) {
          const focused = focusRow(container) || focusSearch(container);
          if (!focused) {
            blur(event, keyboard);
          }
        } else {
          const focused = focusCyclicButton(container) || focusSearch(container) || focusRow(container);
          if (!focused) {
            break;
          }
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
        blur(event, keyboard);
        if (selections.isActive()) {
          selections.cancel();
        }
        break;
      default:
        break;
    }
  };

  const focusOnHoverDisabled = () => {
    const selectNotAllowed = constraints?.select || constraints?.active;
    const appInModal = isModal();
    return selectNotAllowed || appInModal;
  };

  const globalKeyDown = (event) => {
    if (!hovering.current || focusOnHoverDisabled()) {
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

  const handleOnMouseEnter = () => {
    hovering.current = true;
  };

  const handleOnMouseLeave = () => {
    if (hovering.current) {
      hovering.current = false;
    }
  };

  return { handleKeyDown, handleOnMouseEnter, handleOnMouseLeave, globalKeyDown };
}
