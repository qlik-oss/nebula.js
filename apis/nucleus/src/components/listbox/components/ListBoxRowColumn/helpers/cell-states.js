import classes from './classes';

export const isExcluded = (c) => (c ? c.qState === 'X' || c.qState === 'XS' || c.qState === 'XL' : null);
export const isAlternative = (c) => (c ? c.qState === 'A' : null);
export const excludedOrAlternative = ({ cell, checkboxes }) => (isAlternative(cell) || isExcluded(cell)) && checkboxes;

export const getValueStateClasses = ({ column, histogram, checkboxes, cell, showGray }) => {
  const clazzArr = [column ? classes.column : classes.row];
  if (!histogram) {
    clazzArr.push(classes.rowBorderBottom);
  }
  if (!cell) {
    return [];
  }
  if (!checkboxes) {
    if (cell.qState === 'XS') {
      clazzArr.push(showGray ? classes.XS : classes.S);
    } else if (cell.qState === 'S' || cell.qState === 'L') {
      clazzArr.push(classes.S);
    } else if (showGray && isAlternative(cell)) {
      clazzArr.push(classes.A);
    } else if (showGray && isExcluded(cell)) {
      clazzArr.push(classes.X);
    }
  }
  return clazzArr;
};
