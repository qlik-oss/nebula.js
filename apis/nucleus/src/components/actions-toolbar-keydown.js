import KEYS from '../keys';

const getActionButtonIndex = (btn) => {
  const toolbar = btn.closest('#actions-toolbar');
  const nodeList = toolbar?.querySelectorAll('.njs-cell-action');
  return Array.from(nodeList).indexOf(btn);
};

const focusButton = (index) => {
  const toolbar = document.querySelector('#actions-toolbar');
  const nodeList = toolbar?.querySelectorAll('.njs-cell-action');
  if (!nodeList.length) {
    return;
  }
  const ix = Math.min(Math.max(0, index), nodeList.length - 1);
  const btn = nodeList[ix];
  btn.focus();
};

export default function getActionsKeyDownHandler({ keyboardNavigation, focusHandler, getEnabledButton }) {
  const handleActionsKeyDown = (evt) => {
    const { target, nativeEvent } = evt;
    const { keyCode } = nativeEvent;
    switch (keyCode) {
      case KEYS.ARROW_LEFT:
      case KEYS.ARROW_DOWN:
      case KEYS.ARROW_RIGHT:
      case KEYS.ARROW_UP: {
        const isActionButton = target.classList.contains('njs-cell-action');
        if (isActionButton) {
          const index = getActionButtonIndex(target);
          const pressedLeft = [KEYS.ARROW_LEFT, KEYS.ARROW_DOWN].includes(keyCode);
          focusButton(pressedLeft ? index - 1 : index + 1);
        }
        evt.stopPropagation();
        evt.preventDefault();
        break;
      }
      case KEYS.SPACE:
        evt.preventDefault(); // prevent scrolling in listbox
        break;
      case KEYS.TAB:
        if (keyboardNavigation && focusHandler?.refocusContent) {
          const isTabbingOut =
            (evt.shiftKey && getEnabledButton(false) === evt.target) ||
            (!evt.shiftKey && getEnabledButton(true) === evt.target);
          if (isTabbingOut) {
            evt.preventDefault();
            evt.stopPropagation();
            // if keyboardNavigation is true, create a callback to handle tabbing from the first/last button in the toolbar that resets focus on the content
            focusHandler.refocusContent();
          }
        }
        break;
      default:
        break;
    }
  };

  return handleActionsKeyDown;
}
