import KEYS from '../../../keys';

export function getFieldKeyboardNavigation({ select, confirm, cancel, setScrollPosition, focusListItems }) {
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
    const { keyCode, shiftKey = false, ctrlKey = false } = event.nativeEvent;
    switch (keyCode) {
      case KEYS.SHIFT:
        // This is to ensure we include the first value when starting a range selection.
        setStartedRange(true);
        break;
      case KEYS.SPACE:
        select([+event.currentTarget.getAttribute('data-n')]);
        break;
      case KEYS.ARROW_DOWN:
      case KEYS.ARROW_RIGHT:
        elementToFocus = getElement(event.currentTarget, true);
        if (shiftKey && elementToFocus) {
          if (startedRange) {
            select([+event.currentTarget.getAttribute('data-n')], true);
            setStartedRange(false);
          }
          select([+elementToFocus.getAttribute('data-n')], true);
        }
        break;
      case KEYS.ARROW_UP:
      case KEYS.ARROW_LEFT:
        elementToFocus = getElement(event.currentTarget, false);
        if (shiftKey && elementToFocus) {
          if (startedRange) {
            select([+event.currentTarget.getAttribute('data-n')], true);
            setStartedRange(false);
          }
          select([+elementToFocus.getAttribute('data-n')], true);
        }
        break;
      case KEYS.ENTER:
        confirm();
        break;
      case KEYS.ESCAPE:
        cancel();
        return; // let it propagate to top-level
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

export function getListboxInlineKeyboardNavigation({ setKeyboardActive }) {
  const focusInsideListbox = (element) => {
    const fieldElement = element.querySelector('.search input, .value.selector, .value, .ActionsToolbar-* button');
    setKeyboardActive(true);
    if (fieldElement) {
      fieldElement.focus();
    }
  };

  const focusContainer = (element) => {
    setKeyboardActive(false);
    element.focus();
  };

  const handleKeyDown = (event) => {
    const { keyCode } = event.nativeEvent;

    switch (keyCode) {
      // case KEYS.TAB: TODO: Focus confirm button using keyboard.focusSelection when we can access the useKeyboard hook.
      case KEYS.ENTER:
      case KEYS.SPACE:
        if (!event.target.classList.contains('listbox-container')) {
          return; // don't mess with keydown handlers within the listbox
        }
        focusInsideListbox(event.currentTarget);
        break;
      case KEYS.ESCAPE:
        focusContainer(event.currentTarget);
        break;
      default:
        return;
    }

    // Note: We should not stop propagation here as it will block the containing app
    // from handling keydown events.
    event.preventDefault();
  };

  return handleKeyDown;
}
