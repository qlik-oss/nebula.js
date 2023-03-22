import { CHECKBOX_WIDTH, FREQUENCY_WIDTH, ITEM_MIN_WIDTH } from '../../../constants';
import getListSizes from '../get-list-sizes';

describe('get-list-sizes', () => {
  let args;

  beforeEach(() => {
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
      textWidth: 50,
      freqIsAllowed: false,
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should return expected sizes based on inputs', () => {
    const sizes = getListSizes(args);
    expect(sizes).toEqual({
      columnCount: 1,
      columnWidth: 99,
      count: 200,
      itemPadding: 4,
      itemHeight: 29,
      listCount: 100,
      listHeight: 300,
      frequencyWidth: 40,
      maxCount: {
        column: 338888,
        row: 577000,
      },
      overflowStyling: {
        overflowX: 'hidden',
      },
      rowCount: 200,
      scrollBarWidth: 10,
    });
  });

  it('dense should override itemHeight', () => {
    args.checkboxes = true;
    args.layout.layoutOptions.dense = true;
    const sizes = getListSizes(args);
    expect(sizes).toMatchObject({ itemHeight: 20 });
  });

  it('grid mode with layoutOrder column', () => {
    args.layout.layoutOptions.dataLayout = 'grid';
    args.layout.layoutOptions.layoutOrder = 'column';
    const sizes = getListSizes(args);
    expect(sizes).toEqual({
      columnCount: 34,
      columnWidth: 68,
      count: 200,
      itemPadding: 4,
      itemHeight: 36,
      listCount: 100,
      listHeight: 300,
      frequencyWidth: 40,
      maxCount: {
        column: 493382,
        row: 577000,
      },
      overflowStyling: {
        overflowY: 'hidden',
      },
      rowCount: 3,
      scrollBarWidth: 10,
    });
  });

  it('grid mode with layoutOrder column and frequency activated should be wider', () => {
    args.layout.layoutOptions.dataLayout = 'grid';
    args.layout.layoutOptions.layoutOrder = 'column';
    args.freqIsAllowed = true;
    const sizes = getListSizes(args);
    expect(sizes).toEqual({
      columnCount: 34,
      columnWidth: 128,
      count: 200,
      itemPadding: 4,
      itemHeight: 36,
      listCount: 100,
      listHeight: 300,
      frequencyWidth: 40,
      maxCount: {
        column: 262109,
        row: 577000,
      },
      overflowStyling: {
        overflowY: 'hidden',
      },
      rowCount: 3,
      scrollBarWidth: 10,
    });
  });

  it('A minimum item width should kick in if text is short', () => {
    args.layout.layoutOptions.dataLayout = 'grid';
    args.layout.layoutOptions.layoutOrder = 'column';
    args.textWidth = 10;
    args.textWidth = 10;
    const sizes = getListSizes(args);
    expect(sizes).toMatchObject({
      columnWidth: ITEM_MIN_WIDTH,
      maxCount: {
        column: 599107,
      },
    });
  });

  it('A minimum item width should kick in if text is short and reserve extra space for frequency', () => {
    args.layout.layoutOptions.dataLayout = 'grid';
    args.layout.layoutOptions.layoutOrder = 'column';
    args.textWidth = 10;
    args.textWidth = 10;
    args.freqIsAllowed = true;
    const sizes = getListSizes(args);
    expect(sizes).toMatchObject({
      columnWidth: ITEM_MIN_WIDTH + FREQUENCY_WIDTH + CHECKBOX_WIDTH,
      maxCount: {
        column: 289224,
      },
    });
  });

  it('The minimum item width should increase with checkbox mode and frequencyMode', () => {
    args.layout.layoutOptions.dataLayout = 'grid';
    args.layout.layoutOptions.layoutOrder = 'column';
    args.checkboxes = true;
    args.textWidth = 10;
    args.textWidth = 10;
    args.freqIsAllowed = true;
    const sizes = getListSizes(args);
    expect(sizes).toMatchObject({
      columnWidth: ITEM_MIN_WIDTH + FREQUENCY_WIDTH + CHECKBOX_WIDTH,
      maxCount: {
        column: 289224,
      },
    });
  });

  it('layoutOrder column with auto visible columns mode should return a different rowCount and columnCount', () => {
    args.layout.layoutOptions.dataLayout = 'grid';
    args.layout.layoutOptions.maxVisibleRows.auto = true;
    args.layout.layoutOptions.maxVisibleColumns.auto = true;
    args.layout.layoutOptions.layoutOrder = 'column';
    args.maxRows = 2;
    const sizes = getListSizes(args);
    expect(sizes).toMatchObject({ rowCount: 8, columnCount: 13 });
  });

  it('grid mode with layoutOrder == column should add exta 12px padding to the itemHeight', () => {
    args.layout.layoutOptions.dataLayout = 'grid';
    args.layout.layoutOptions.layoutOrder = 'column';
    const sizes = getListSizes(args);
    expect(sizes.itemHeight).toEqual(36); // itemHeight + padding = 32 + 4 = 36
  });

  it('maxRowCount should limit listCount and rowCount, in column layout', () => {
    args.layoutOrder = 'column';
    const maxRowCount = 22;
    const columnCount = 4;
    args.listCount = maxRowCount * columnCount + 1;
    const sizes = getListSizes(args);
    expect(sizes).toEqual({
      columnCount: 1,
      columnWidth: 99,
      count: 200,
      itemPadding: 4,
      itemHeight: 29,
      listCount: args.listCount,
      listHeight: 300,
      frequencyWidth: 40,
      maxCount: {
        column: 338888,
        row: 577000,
      },
      overflowStyling: {
        overflowX: 'hidden',
      },
      rowCount: 200,
      scrollBarWidth: 10,
    });
  });

  it('maxColumnCount should limit listCount and columnCount, in grid layout', () => {
    const rowCount = 3;
    const itemHeight = 36;
    args.layout.layoutOptions.dataLayout = 'grid';
    args.height = itemHeight * 3; // ensure height can fit 3 rows, or we will fall back to auto calculation
    args.layout.layoutOptions.layoutOrder = 'column';
    const columnCount = 493382;
    args.listCount = rowCount * columnCount + 1;
    const sizes = getListSizes(args);
    expect(sizes).toEqual({
      columnCount,
      columnWidth: 68,
      count: 200,
      itemPadding: 4,
      itemHeight,
      listCount: columnCount * rowCount,
      listHeight: 3 * itemHeight,
      frequencyWidth: 40,
      maxCount: {
        column: columnCount,
        row: 577000,
      },
      overflowStyling: {
        overflowY: 'hidden',
      },
      rowCount,
      scrollBarWidth: 10,
    });
  });

  it('Algorithm should reduce rowCount when container height cannot fit all items.', () => {
    const rowCount = 3;
    const itemHeight = 36;
    args.layout.layoutOptions.dataLayout = 'grid';
    args.height = itemHeight * 3 - 1; // minus one so that we cannot fit all 3 rows!
    args.layout.layoutOptions.layoutOrder = 'column';
    const columnCount = 493382;
    args.listCount = rowCount * columnCount + 1;
    const sizes = getListSizes(args);
    expect(sizes).toMatchObject({
      columnCount,
      columnWidth: 68,
      count: 200,
      itemPadding: 4,
      itemHeight,
      listCount: columnCount * 2,
      listHeight: 3 * itemHeight - 1,
      frequencyWidth: 40,
      maxCount: {
        column: columnCount,
        row: 577000,
      },
      rowCount: 2,
    });
  });
});
