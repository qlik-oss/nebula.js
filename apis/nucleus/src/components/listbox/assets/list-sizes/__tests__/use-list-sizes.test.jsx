import { CHECKBOX_WIDTH, ITEM_MIN_WIDTH, SCROLL_BAR_WIDTH } from '../../../constants';
import useListSizes from '../use-list-sizes';
import * as useTextWidthModule from '../../../hooks/useTextWidth';
import * as getMeasureTextModule from '../../measure-text';

describe('use-list-sizes', () => {
  let args;

  beforeEach(() => {
    jest.spyOn(useTextWidthModule, 'default').mockImplementation(({ text }) => text.length * 8);
    jest
      .spyOn(getMeasureTextModule, 'default')
      .mockImplementation((nbr) => Array(typeof nbr === 'number' ? nbr : 5).fill('M'));
    args = {
      layout: {
        layoutOptions: {
          dataLayout: 'singleColumn',
          layoutOrder: 'row',
          maxVisibleRows: {
            maxRows: 3,
            auto: false,
          },
          maxVisibleColumns: {
            maxColumns: 4,
            auto: false,
          },
          dense: false,
        },
      },
      width: 200,
      height: 300,
      checkboxes: false,
      listCount: 100,
      count: 200,
      freqIsAllowed: false,
      theme: {
        listBox: {
          content: {},
        },
      },
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should return expected sizes based on inputs', () => {
    const sizes = useListSizes(args);
    expect(sizes).toEqual({
      columnCount: 1,
      columnWidth: 66,
      freqMinWidth: 40,
      freqMaxWidth: 64,
      textWidth: 40,
      count: 200,
      itemPadding: 4,
      itemHeight: 29,
      listCount: 100,
      listHeight: 300,
      listWidth: 200,
      maxCount: {
        column: 508333,
        row: 577000,
      },
      overflowStyling: {
        overflowX: 'hidden',
      },
      rowCount: 200,
      scrollBarWidth: 10,
      gridGap: 0,
    });
  });

  it('dense should override itemHeight', () => {
    args.checkboxes = true;
    args.layout.layoutOptions.dense = true;
    const sizes = useListSizes(args);
    expect(sizes).toMatchObject({ itemHeight: 20 });
  });

  it('grid mode with layoutOrder column', () => {
    args.layout.layoutOptions.dataLayout = 'grid';
    args.layout.layoutOptions.layoutOrder = 'column';
    const sizes = useListSizes(args);
    expect(sizes).toEqual({
      columnCount: 34,
      columnWidth: 58,
      freqMinWidth: 40,
      freqMaxWidth: 64,
      textWidth: 40,
      count: 200,
      itemPadding: 4,
      itemHeight: 36,
      listCount: 100,
      listHeight: 300,
      listWidth: 200,
      maxCount: {
        column: 578448,
        row: 577000,
      },
      overflowStyling: {
        overflowY: 'hidden',
      },
      rowCount: 3,
      scrollBarWidth: 10,
      gridGap: 0,
    });
  });

  it('grid mode with layoutOrder column and frequency activated should be wider', () => {
    args.layout.layoutOptions.dataLayout = 'grid';
    args.layout.layoutOptions.layoutOrder = 'column';
    args.freqIsAllowed = true;
    const sizes = useListSizes(args);
    expect(sizes).toEqual({
      textWidth: 40,
      freqMinWidth: 40,
      freqMaxWidth: 64,
      columnCount: 34,
      columnWidth: 118,
      count: 200,
      itemPadding: 4,
      itemHeight: 36,
      listCount: 100,
      listHeight: 300,
      listWidth: 200,
      maxCount: {
        column: 284322,
        row: 577000,
      },
      overflowStyling: {
        overflowY: 'hidden',
      },
      rowCount: 3,
      scrollBarWidth: 10,
      gridGap: 0,
    });
  });

  it('A minimum item width should kick in if text is short', () => {
    args.layout.layoutOptions.dataLayout = 'grid';
    args.layout.layoutOptions.layoutOrder = 'column';
    const sizes = useListSizes(args);
    expect(sizes).toMatchObject({
      columnWidth: 58,
      maxCount: {
        column: 578448,
      },
    });
  });

  it('A minimum item width should kick in if text is short and reserve extra space for frequency', () => {
    args.layout.layoutOptions.dataLayout = 'grid';
    args.layout.layoutOptions.layoutOrder = 'column';
    args.freqIsAllowed = true;
    const sizes = useListSizes(args);
    expect(sizes).toMatchObject({
      columnWidth: ITEM_MIN_WIDTH + 42 + CHECKBOX_WIDTH,
      maxCount: {
        column: 284322,
      },
    });
  });

  it('The minimum item width should increase with checkbox mode and frequencyMode', () => {
    args.layout.layoutOptions.dataLayout = 'grid';
    args.layout.layoutOptions.layoutOrder = 'column';
    args.checkboxes = true;
    args.freqIsAllowed = true;
    const sizes = useListSizes(args);
    expect(sizes).toMatchObject({
      columnWidth: ITEM_MIN_WIDTH + 42 + CHECKBOX_WIDTH,
      maxCount: {
        column: 284322,
      },
    });
  });

  it('layoutOrder column with auto visible columns mode should return a different rowCount and columnCount', () => {
    args.layout.layoutOptions.dataLayout = 'grid';
    args.layout.layoutOptions.maxVisibleRows.auto = true;
    args.layout.layoutOptions.maxVisibleColumns.auto = true;
    args.layout.layoutOptions.layoutOrder = 'column';
    args.maxRows = 2;
    const sizes = useListSizes(args);
    expect(sizes).toMatchObject({ rowCount: 8, columnCount: 13 });
  });

  it('grid mode with layoutOrder == column should add exta 12px padding to the itemHeight', () => {
    args.layout.layoutOptions.dataLayout = 'grid';
    args.layout.layoutOptions.layoutOrder = 'column';
    const sizes = useListSizes(args);
    expect(sizes.itemHeight).toEqual(36); // itemHeight + padding = 32 + 4 = 36
  });

  it('maxRowCount should limit listCount and rowCount, in column layout', () => {
    args.layoutOrder = 'column';
    const maxRowCount = 22;
    const columnCount = 4;
    args.listCount = maxRowCount * columnCount + 1;
    const sizes = useListSizes(args);
    expect(sizes).toEqual({
      textWidth: 40,
      freqMinWidth: 40,
      freqMaxWidth: 64,
      columnCount: 1,
      columnWidth: 66,
      count: 200,
      itemPadding: 4,
      itemHeight: 29,
      listCount: args.listCount,
      listHeight: 300,
      listWidth: 200,
      maxCount: {
        column: 508333,
        row: 577000,
      },
      overflowStyling: {
        overflowX: 'hidden',
      },
      rowCount: 200,
      scrollBarWidth: 10,
      gridGap: 0,
    });
  });

  it('maxColumnCount should limit listCount and columnCount, in grid layout', () => {
    const rowCount = 3;
    const itemHeight = 36;
    args.layout.layoutOptions.dataLayout = 'grid';
    // ensure height can fit 3 rows plus scrollbar reservation, or we will fall back to auto calculation
    args.height = itemHeight * 3 + SCROLL_BAR_WIDTH;
    args.layout.layoutOptions.layoutOrder = 'column';
    const columnCount = 578448;
    args.listCount = rowCount * columnCount + 1;
    const sizes = useListSizes(args);
    expect(sizes).toEqual({
      textWidth: 40,
      freqMinWidth: 40,
      freqMaxWidth: 64,
      columnCount,
      columnWidth: 58,
      count: 200,
      itemPadding: 4,
      itemHeight,
      listCount: columnCount * rowCount,
      listHeight: 3 * itemHeight + SCROLL_BAR_WIDTH,
      listWidth: 200,
      maxCount: {
        column: columnCount,
        row: 577000,
      },
      overflowStyling: {
        overflowY: 'hidden',
      },
      rowCount,
      scrollBarWidth: 10,
      gridGap: 0,
    });
  });

  it('image representation fixes columns to maxColumns and scales cell height to fill by maxVisibleRows', () => {
    args.layout.layoutOptions.dataLayout = 'grid';
    args.layout.layoutOptions.layoutOrder = 'row';
    args.layout.representation = { type: 'image' };
    // maxColumns = 4, maxVisibleRows = 3, width 200, height 300, listCount 100
    const sizes = useListSizes(args);
    expect(sizes).toMatchObject({
      columnCount: 4,
      columnWidth: (200 - 10) / 4, // (width - scrollbar) / columns
      itemHeight: 100, // listHeight / maxVisibleRows = 300 / 3, cells fill the pane
      rowCount: 25, // ceil(listCount / columnCount) => scrolls beyond the visible rows
      listCount: 100,
    });
    expect(sizes.gridGap).toBeCloseTo(0.475, 5); // default 1% of column width 47.5 = 0.475 px
  });

  it('image representation uses default 5 columns / 4 rows when max visible columns/rows are set to auto', () => {
    args.layout.layoutOptions.dataLayout = 'grid';
    args.layout.layoutOptions.layoutOrder = 'row';
    args.layout.layoutOptions.maxVisibleColumns.auto = true;
    args.layout.layoutOptions.maxVisibleRows.auto = true;
    args.layout.representation = { type: 'image' };
    // auto ignores the custom maxColumns/maxRows and applies the defaults: 5 columns, 4 rows
    const sizes = useListSizes(args);
    expect(sizes).toMatchObject({
      columnCount: 5, // default columns
      columnWidth: (200 - 10) / 5,
      itemHeight: 75, // listHeight / default rows = 300 / 4
      rowCount: 20, // ceil(listCount / columnCount) = ceil(100 / 5)
    });
  });

  it('image representation keeps columnCount fixed at maxColumns even with fewer items than that', () => {
    args.layout.layoutOptions.dataLayout = 'grid';
    args.layout.layoutOptions.layoutOrder = 'row';
    args.layout.representation = { type: 'image' };
    args.listCount = 2; // fewer items than maxColumns (4)
    const sizes = useListSizes(args);
    expect(sizes).toMatchObject({
      columnCount: 4, // stays at maxColumns, cells don't stretch to fill fewer/wider columns
      columnWidth: (200 - 10) / 4,
      rowCount: 1, // ceil(2 / 4)
      listCount: 2,
    });
  });

  it('image representation treats a custom maxColumns/maxRows of 0 the same as a negative value (clamped to 1)', () => {
    args.layout.layoutOptions.dataLayout = 'grid';
    args.layout.layoutOptions.layoutOrder = 'row';
    args.layout.layoutOptions.maxVisibleColumns.maxColumns = 0;
    args.layout.layoutOptions.maxVisibleRows.maxRows = -3;
    args.layout.representation = { type: 'image' };
    const sizes = useListSizes(args);
    expect(sizes).toMatchObject({
      columnCount: 1,
      itemHeight: 300, // listHeight / 1
    });
  });

  it('image representation falls back to the default gridGap for a non-numeric value instead of NaN', () => {
    args.layout.layoutOptions.dataLayout = 'grid';
    args.layout.layoutOptions.layoutOrder = 'row';
    args.layout.representation = { type: 'image', gridGap: 'not-a-number' };
    const sizes = useListSizes(args);
    expect(sizes.gridGap).not.toBeNaN();
    // same as the default (1% of column width 47.5 = 0.475 px), since the invalid value falls back to it
    expect(sizes.gridGap).toBeCloseTo(0.475);
  });

  it('image representation converts the gridGap percentage of width into a pixel gap', () => {
    args.layout.layoutOptions.dataLayout = 'grid';
    args.layout.layoutOptions.layoutOrder = 'row';
    args.layout.representation = { type: 'image', gridGap: 5 };
    const sizes = useListSizes(args);
    expect(sizes.gridGap).toBe(2.375); // 5% of column width 47.5 = 2.375 px
  });

  it('Algorithm should reduce rowCount when container height cannot fit all items.', () => {
    const rowCount = 3;
    const itemHeight = 36;
    args.layout.layoutOptions.dataLayout = 'grid';
    args.height = itemHeight * 3 - 1; // minus one so that we cannot fit all 3 rows!
    args.layout.layoutOptions.layoutOrder = 'column';
    const columnCount = 578448;
    args.listCount = rowCount * columnCount + 1;
    const sizes = useListSizes(args);
    expect(sizes).toMatchObject({
      columnCount,
      columnWidth: 58,
      count: 200,
      itemPadding: 4,
      itemHeight,
      listCount: columnCount * 2,
      listHeight: 3 * itemHeight - 1,
      listWidth: 200,
      maxCount: {
        column: columnCount,
        row: 577000,
      },
      rowCount: 2,
    });
  });
});
