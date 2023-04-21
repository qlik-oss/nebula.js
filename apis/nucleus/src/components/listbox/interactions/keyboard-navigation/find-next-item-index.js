import KEYS from '../../../../keys';

// Find next item index to focus in the dom element list on key up and key down
const findNextItemIndex = ({ rowIndex, columnIndex, rowCount, columnCount, layoutOrder, keyCode, numCells }) => {
  const getNumCellsInColumn = (colIdx) => {
    let remain;
    if (layoutOrder === 'row') {
      remain = numCells % columnCount;
      return colIdx < remain ? rowCount : rowCount - 1;
    }
    remain = numCells % rowCount;
    return colIdx < columnCount - 1 ? rowCount : remain;
  };

  let nextRowIndex = rowIndex;
  let nextColumnIndex = columnIndex;
  if (keyCode === KEYS.ARROW_DOWN) {
    if (rowIndex >= getNumCellsInColumn(columnIndex) - 1) {
      if (columnIndex === columnCount - 1) return -1;
      nextRowIndex = 0;
      nextColumnIndex = columnIndex + 1;
    } else {
      nextRowIndex = rowIndex + 1;
    }
  } else if (rowIndex === 0) {
    if (columnIndex === 0) return -1;
    nextRowIndex = getNumCellsInColumn(columnIndex - 1) - 1;
    nextColumnIndex = columnIndex - 1;
  } else {
    nextRowIndex = rowIndex - 1;
  }

  // Convert from row, column indices to the element index in the dom element list
  if (layoutOrder === 'row') {
    return nextRowIndex * columnCount + nextColumnIndex;
  }

  // The dom element list is always row order. If the layout is column order then the conversion is not straight forward
  const remain = numCells % rowCount;
  if (remain === 0 || nextRowIndex < remain) return nextRowIndex * columnCount + nextColumnIndex;
  return (nextRowIndex - remain) * (columnCount - 1) + nextColumnIndex + remain * columnCount;
};

export default findNextItemIndex;
