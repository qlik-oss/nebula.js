import { removeLastFocused } from '../../components/useTempKeyboard';

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
