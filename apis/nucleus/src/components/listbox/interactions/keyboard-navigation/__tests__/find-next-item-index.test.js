import KEYS from '../../../../../keys';
import findNextItemIndex from '../find-next-item-index';

describe('find next item index to focus on key up and key down', () => {
  const numCells = 12;
  let rowCount;
  let columnCount;
  let layoutOrder;
  let keyCode;

  describe('key down', () => {
    beforeEach(() => {
      keyCode = KEYS.ARROW_DOWN;
    });
    describe('row layout', () => {
      beforeEach(() => {
        layoutOrder = 'row';
        columnCount = 5;
        rowCount = 3;
      });
      test('should return correct index for rowIndex 0', () => {
        const rowIndex = 0;
        expect(
          findNextItemIndex({ rowIndex, columnIndex: 0, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(5);
        expect(
          findNextItemIndex({ rowIndex, columnIndex: 1, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(6);
        expect(
          findNextItemIndex({ rowIndex, columnIndex: 2, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(7);
        expect(
          findNextItemIndex({ rowIndex, columnIndex: 3, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(8);
        expect(
          findNextItemIndex({ rowIndex, columnIndex: 4, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(9);
      });

      test('should return correct index for rowIndex 1', () => {
        const rowIndex = 1;
        expect(
          findNextItemIndex({ rowIndex, columnIndex: 0, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(10);
        expect(
          findNextItemIndex({ rowIndex, columnIndex: 1, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(11);
        expect(
          findNextItemIndex({ rowIndex, columnIndex: 2, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(3);
        expect(
          findNextItemIndex({ rowIndex, columnIndex: 3, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(4);
        expect(
          findNextItemIndex({ rowIndex, columnIndex: 4, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(-1);
      });

      test('should return correct index for rowIndex 2', () => {
        const rowIndex = 2;
        expect(
          findNextItemIndex({ rowIndex, columnIndex: 0, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(1);
        expect(
          findNextItemIndex({ rowIndex, columnIndex: 1, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(2);
      });
    });

    describe('column layout', () => {
      beforeEach(() => {
        layoutOrder = 'column';
        columnCount = 3;
        rowCount = 5;
      });
      test('should return correct index for columnIndex 0', () => {
        const columnIndex = 0;
        expect(
          findNextItemIndex({ rowIndex: 0, columnIndex, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(3);
        expect(
          findNextItemIndex({ rowIndex: 1, columnIndex, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(6);
        expect(
          findNextItemIndex({ rowIndex: 2, columnIndex, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(8);
        expect(
          findNextItemIndex({ rowIndex: 3, columnIndex, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(10);
        expect(
          findNextItemIndex({ rowIndex: 4, columnIndex, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(1);
      });

      test('should return correct index for columnIndex 1', () => {
        const columnIndex = 1;
        expect(
          findNextItemIndex({ rowIndex: 0, columnIndex, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(4);
        expect(
          findNextItemIndex({ rowIndex: 1, columnIndex, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(7);
        expect(
          findNextItemIndex({ rowIndex: 2, columnIndex, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(9);
        expect(
          findNextItemIndex({ rowIndex: 3, columnIndex, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(11);
        expect(
          findNextItemIndex({ rowIndex: 4, columnIndex, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(2);
      });

      test('should return correct index for columnIndex 2', () => {
        const columnIndex = 2;
        expect(
          findNextItemIndex({ rowIndex: 0, columnIndex, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(5);
        expect(
          findNextItemIndex({ rowIndex: 1, columnIndex, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(-1);
      });
    });
  });

  describe('key up', () => {
    beforeEach(() => {
      keyCode = KEYS.ARROW_UP;
    });
    describe('row layout', () => {
      beforeEach(() => {
        layoutOrder = 'row';
        columnCount = 5;
        rowCount = 3;
      });
      test('should return correct index for rowIndex 0', () => {
        const rowIndex = 0;
        expect(
          findNextItemIndex({ rowIndex, columnIndex: 0, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(-1);
        expect(
          findNextItemIndex({ rowIndex, columnIndex: 1, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(10);
        expect(
          findNextItemIndex({ rowIndex, columnIndex: 2, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(11);
        expect(
          findNextItemIndex({ rowIndex, columnIndex: 3, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(7);
        expect(
          findNextItemIndex({ rowIndex, columnIndex: 4, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(8);
      });

      test('should return correct index for rowIndex 1', () => {
        const rowIndex = 1;
        expect(
          findNextItemIndex({ rowIndex, columnIndex: 0, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(0);
        expect(
          findNextItemIndex({ rowIndex, columnIndex: 1, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(1);
        expect(
          findNextItemIndex({ rowIndex, columnIndex: 2, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(2);
        expect(
          findNextItemIndex({ rowIndex, columnIndex: 3, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(3);
        expect(
          findNextItemIndex({ rowIndex, columnIndex: 4, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(4);
      });

      test('should return correct index for rowIndex 2', () => {
        const rowIndex = 2;
        expect(
          findNextItemIndex({ rowIndex, columnIndex: 0, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(5);
        expect(
          findNextItemIndex({ rowIndex, columnIndex: 1, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(6);
      });
    });

    describe('column layout', () => {
      beforeEach(() => {
        layoutOrder = 'column';
        columnCount = 3;
        rowCount = 5;
      });
      test('should return correct index for columnIndex 0', () => {
        const columnIndex = 0;
        expect(
          findNextItemIndex({ rowIndex: 0, columnIndex, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(-1);
        expect(
          findNextItemIndex({ rowIndex: 1, columnIndex, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(0);
        expect(
          findNextItemIndex({ rowIndex: 2, columnIndex, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(3);
        expect(
          findNextItemIndex({ rowIndex: 3, columnIndex, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(6);
        expect(
          findNextItemIndex({ rowIndex: 4, columnIndex, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(8);
      });

      test('should return correct index for columnIndex 1', () => {
        const columnIndex = 1;
        expect(
          findNextItemIndex({ rowIndex: 0, columnIndex, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(10);
        expect(
          findNextItemIndex({ rowIndex: 1, columnIndex, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(1);
        expect(
          findNextItemIndex({ rowIndex: 2, columnIndex, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(4);
        expect(
          findNextItemIndex({ rowIndex: 3, columnIndex, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(7);
        expect(
          findNextItemIndex({ rowIndex: 4, columnIndex, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(9);
      });

      test('should return correct index for columnIndex 2', () => {
        const columnIndex = 2;
        expect(
          findNextItemIndex({ rowIndex: 0, columnIndex, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(11);
        expect(
          findNextItemIndex({ rowIndex: 1, columnIndex, rowCount, columnCount, layoutOrder, keyCode, numCells })
        ).toEqual(2);
      });
    });
  });
});
