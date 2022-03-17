import KEYS from '../../keys';

export function getFieldKeyboardNavigation({ select, confirm, cancel }) {
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
    const { keyCode, shiftKey = false } = event.nativeEvent;

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
    const fieldElement = element.querySelector('.search input, .value.selector, .value');
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
        focusInsideListbox(event.currentTarget);
        break;
      case KEYS.ESCAPE:
        focusContainer(event.currentTarget);
        break;
      case KEYS.TAB:
        event.stopPropagation();
        return;
      default:
        return;
    }

    // Note: We should not stop propagation here as it will block the containing app
    // from handling keydown events.
    event.preventDefault();
  };

  return handleKeyDown;
}
