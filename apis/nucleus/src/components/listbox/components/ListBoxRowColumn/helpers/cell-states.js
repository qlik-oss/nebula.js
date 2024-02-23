import classes from './classes';

export const isExcluded = (c) => (c ? c.qState === 'X' || c.qState === 'XS' || c.qState === 'XL' : null);
export const isAlternative = (c) => (c ? c.qState === 'A' : null);
export const excludedOrAlternative = ({ cell, checkboxes }) => (isAlternative(cell) || isExcluded(cell)) && checkboxes;

function getSelectionStateClass({ cell, showGray }) {
  let selectionStateClass;
  switch (cell.qState) {
    case 'XS':
      selectionStateClass = showGray ? classes.XS : classes.S;
      break;
    case 'S':
    case 'L':
      selectionStateClass = classes.S;
      break;
    case 'A':
      selectionStateClass = showGray ? classes.A : false;
      break;
    case 'X':
    case 'XL':
      selectionStateClass = showGray ? classes.X : false;
      break;
    default:
      selectionStateClass = false;
  }

  return selectionStateClass;
}

export const getValueStateClasses = ({ column, histogram, cell, showGray }) => {
  if (!cell) {
    return [];
  }

  const clazzArr = [column ? classes.column : classes.row];
  if (!histogram) {
    clazzArr.push(classes.rowBorderBottom);
  }

  const selectionStateClass = getSelectionStateClass({ cell, showGray });
  if (selectionStateClass) {
    clazzArr.push(selectionStateClass);
  }

  return clazzArr;
};
