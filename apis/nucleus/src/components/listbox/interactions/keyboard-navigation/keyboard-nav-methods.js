export const getElementIndex = (currentTarget) => +currentTarget.getAttribute('data-n');

export const focusSearch = (container) => {
  const searchField = container?.querySelector('.search input');
  searchField?.focus();
  return searchField;
};

export const focusRow = (container) => {
  const row = container?.querySelector('.value.last-focused, .value.selector, .value');
  row?.setAttribute('tabIndex', 0);
  row?.focus();
  return row;
};
