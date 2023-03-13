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
      columnWidth: 50,
      count: 200,
      itemPadding: 4,
      itemSize: 29,
      listCount: 100,
      listHeight: 300,
      maxCount: {
        column: 671000,
        row: 577000,
      },
      overflowStyling: {
        overflowX: 'hidden',
      },
      rowCount: 200,
      scrollBarWidth: 10,
    });
  });

  it('dense should override itemSize', () => {
    args.checkboxes = true;
    args.layout.layoutOptions.dense = true;
    const sizes = getListSizes(args);
    expect(sizes).toMatchObject({ itemSize: 20 });
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
      itemSize: 36,
      listCount: 100,
      listHeight: 300,
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

  it('layoutOrder column with auto visible columns mode should return a different rowCount and columnCount', () => {
    args.layout.layoutOptions.dataLayout = 'grid';
    args.layout.layoutOptions.maxVisibleRows.auto = true;
    args.layout.layoutOptions.maxVisibleColumns.auto = true;
    args.layout.layoutOptions.layoutOrder = 'column';
    args.maxRows = 2;
    const sizes = getListSizes(args);
    expect(sizes).toMatchObject({ rowCount: 8, columnCount: 13 });
  });

  it('grid mode with layoutOrder == column should add exta 12px padding to the itemSize', () => {
    args.layout.layoutOptions.dataLayout = 'grid';
    args.layout.layoutOptions.layoutOrder = 'column';
    const sizes = getListSizes(args);
    expect(sizes.itemSize).toEqual(36); // itemSize + padding = 32 + 4 = 36
  });

  it('maxRowCount should limit listCount and rowCount, in column layout', () => {
    args.layoutOrder = 'column';
    const maxRowCount = 22;
    const columnCount = 4;
    args.listCount = maxRowCount * columnCount + 1;
    const sizes = getListSizes(args);
    expect(sizes).toEqual({
      columnCount: 1,
      columnWidth: 50,
      count: 200,
      itemPadding: 4,
      itemSize: 29,
      listCount: args.listCount,
      listHeight: 300,
      maxCount: {
        column: 671000,
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
    args.layout.layoutOptions.dataLayout = 'grid';
    args.height = 100;
    args.layout.layoutOptions.layoutOrder = 'column';
    const rowCount = 3;
    const columnCount = 493382;
    args.listCount = rowCount * columnCount + 1;
    const sizes = getListSizes(args);
    expect(sizes).toEqual({
      columnCount,
      columnWidth: 68,
      count: 200,
      itemPadding: 4,
      itemSize: 36,
      listCount: columnCount * rowCount,
      listHeight: 100,
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
});
