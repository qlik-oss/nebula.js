import getListSizes from '../get-list-sizes';

describe('get-list-sizes', () => {
  let args;

  beforeEach(() => {
    args = {
      layout: {
        layoutOptions: {
          layoutOrder: 'row',
          maxVisibleRows: {
            maxRows: 3,
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
      columnCount: 4,
      columnWidth: 47.5,
      count: 200,
      itemSize: 29,
      listCount: 100,
      listHeight: 300,
      maxCount: {
        column: 706315,
        row: 577000,
      },
      overflowStyling: {
        overflowX: 'hidden',
      },
      rowCount: 25,
      scrollBarWidth: 10,
    });
  });

  it('dense should override itemSize', () => {
    args.checkboxes = true;
    args.layout.layoutOptions.dense = true;
    const sizes = getListSizes(args);
    expect(sizes).toMatchObject({ itemSize: 20 });
  });

  it('layoutOrder column', () => {
    args.layoutOrder = 'column';
    const sizes = getListSizes(args);
    expect(sizes).toEqual({
      columnCount: 4,
      columnWidth: 47.5,
      count: 200,
      itemSize: 29,
      listCount: 100,
      listHeight: 300,
      maxCount: {
        column: 706315,
        row: 577000,
      },
      overflowStyling: {
        overflowX: 'hidden',
      },
      rowCount: 25,
      scrollBarWidth: 10,
    });
  });

  it('layoutOrder column with auto visible columns mode should return a different rowCount and columnCount', () => {
    args.layout.layoutOptions.maxVisibleColumns.auto = true;
    args.layoutOrder = 'column';
    args.maxRows = 2;
    const sizes = getListSizes(args);
    expect(sizes).toMatchObject({ rowCount: 34, columnCount: 3 });
  });
});
