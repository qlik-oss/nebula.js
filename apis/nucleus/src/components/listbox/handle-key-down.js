import KEYS from '../../keys';

export default function getHandleKeyDown({ select, confirm, cancel }) {
  const handleKeyDown = (event) => {
    let elementToFocus;
    switch (event.nativeEvent.keyCode) {
      case KEYS.SPACE:
        select([+event.currentTarget.getAttribute('data-n')]);
        break;
      case KEYS.ARROW_DOWN:
      case KEYS.ARROW_RIGHT:
        elementToFocus = event.currentTarget && event.currentTarget.nextElementSibling;
        if (event.nativeEvent.shiftKey && elementToFocus) {
          const ADDITIVE = true;
          select([+event.currentTarget.getAttribute('data-n'), +elementToFocus.getAttribute('data-n')], ADDITIVE);
        }
        break;
      case KEYS.ARROW_UP:
      case KEYS.ARROW_LEFT:
        elementToFocus = event.currentTarget && event.currentTarget.previousElementSibling;
        if (event.nativeEvent.shiftKey && elementToFocus) {
          const ADDITIVE = true;
          select([+event.currentTarget.getAttribute('data-n'), +elementToFocus.getAttribute('data-n')], ADDITIVE);
        }
        break;
      case KEYS.ENTER:
        confirm();
        break;
      case KEYS.ESCAPE:
        cancel();
        if (document.focusElement) {
          document.focusElement.blur();
        }
        break;
      default:
    }
    if (elementToFocus) {
      elementToFocus.focus();
    }
    // event.preventDefault();
    // event.stopPropagation();
  };
  return handleKeyDown;
}
