export const isExcluded = (c) => (c ? c.qState === 'X' || c.qState === 'XS' || c.qState === 'XL' : null);
export const isAlternative = (c) => (c ? c.qState === 'A' : null);
export const excludedOrAlternative = ({ cell, checkboxes }) => (isAlternative(cell) || isExcluded(cell)) && checkboxes;
