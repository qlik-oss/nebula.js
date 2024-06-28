import { getVizCell, removeLastFocused } from '../../components/useTempKeyboard';

export const getElementIndex = (currentTarget) => +currentTarget.getAttribute('data-n');

export const focusSearch = (container) => {
  const searchField = container?.querySelector('.search input');
  searchField?.focus();
  return searchField;
};

export const focusRow = (container) => {
  const lastFocusedRow = container?.querySelector('.value.last-focused');
  const selectorRow = container?.querySelector('.value.selector');
  const row = container?.querySelector('.value');
  const rowToFocus = lastFocusedRow || selectorRow || row;
  rowToFocus?.setAttribute('tabIndex', 0);
  rowToFocus?.focus();
  removeLastFocused(container);
  return rowToFocus;
};

export const focusCyclicButton = (container) => {
  const button = container?.querySelector('.listbox-cyclic-button:not(:disabled)');
  button?.setAttribute('tabIndex', 0);
  button?.focus();
  return button;
};

export const blur = (event, keyboard) => {
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
    removeLastFocused(container);

    // 2. Add last-focused class so we can re-focus it later.
    currentTarget.classList.add('last-focused');

    // 3. Blur row and focus the listbox container.
    keyboard.blur();
    const c = currentTarget.closest('.listbox-container');
    c.setAttribute('tabIndex', -1);
    c?.focus();
  }
};
