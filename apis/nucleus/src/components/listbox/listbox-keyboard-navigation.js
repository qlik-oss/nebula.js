import KEYS from '../../keys';

export default function getKeyboardNavigation({ select, confirm, cancel }) {
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
        elementToFocus = event.currentTarget && event.currentTarget.nextElementSibling;
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
        elementToFocus = event.currentTarget && event.currentTarget.previousElementSibling;
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
        if (document.activeElement) {
          document.activeElement.blur();
        }
        break;
      default:
    }
    if (elementToFocus) {
      elementToFocus.focus();
    }
    event.preventDefault();
  };
  return handleKeyDown;
}
