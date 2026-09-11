import calculateColumnMode from '../column-mode';
import { SCROLL_BAR_WIDTH } from '../../../constants';

describe('column-mode', () => {
  const maxVisibleRows = { auto: true };
  const itemHeight = 40;
  const listHeight = 200; // exact multiple of itemHeight, i.e. no natural slack for a scrollbar
  const containerWidth = 300;
  const columnAutoWidth = 100;
  const itemMinWidth = 80;

  it('should reserve a row of height for the horizontal scrollbar when columns overflow the container width', () => {
    // With no reservation this would naively pick rowCount = 5 (200 / 40), leaving zero
    // room for a horizontal scrollbar to fit without covering the last row.
    const listCount = 50;
    const { rowCount, columnCount, columnWidth } = calculateColumnMode({
      maxVisibleRows,
      itemHeight,
      listCount,
      listHeight,
      columnAutoWidth,
      containerWidth,
      itemMinWidth,
    });

    const expectedRowCount = Math.floor((listHeight - SCROLL_BAR_WIDTH) / itemHeight); // one row reserved for the scrollbar

    expect(columnWidth * columnCount).toBeGreaterThan(containerWidth); // confirms columns do overflow horizontally
    expect(rowCount).toEqual(expectedRowCount);
    expect(columnCount).toEqual(Math.ceil(listCount / expectedRowCount));
    expect(columnWidth).toEqual(100);
  });

  it('should not change rowCount when the grid does not overflow the container width', () => {
    const listCount = 5;
    const { rowCount, columnCount, columnWidth } = calculateColumnMode({
      maxVisibleRows,
      itemHeight,
      listCount,
      listHeight,
      columnAutoWidth,
      containerWidth,
      itemMinWidth,
    });

    expect(columnWidth * columnCount).toEqual(containerWidth); // confirms columns fit exactly, no overflow
    expect(rowCount).toEqual(5); // unchanged from the naive Math.floor(listHeight / itemHeight)
    expect(columnCount).toEqual(1);
    expect(columnWidth).toEqual(300);
  });
});
