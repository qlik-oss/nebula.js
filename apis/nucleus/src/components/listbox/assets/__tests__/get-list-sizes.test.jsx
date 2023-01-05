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
      itemSize: 33,
      listCount: 100,
      listHeight: 300,
      overflowStyling: {
        overflowX: 'hidden',
      },
      rowCount: 25,
      scrollBarWidth: 10,
    });
  });

  it('should return expected itemSize with checkboxes true', () => {
    args.checkboxes = true;
    const sizes = getListSizes(args);
    expect(sizes).toMatchObject({ itemSize: 40 });
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
      columnCount: 17,
      columnWidth: 68,
      count: 200,
      itemSize: 45,
      listCount: 100,
      listHeight: 300,
      overflowStyling: {
        overflowY: 'hidden',
      },
      rowCount: 6,
      scrollBarWidth: 10,
    });
  });

  it('layoutOrder column with auto visible columns mode should return a different rowCount and columnCount', () => {
    args.layout.layoutOptions.dataLayout = 'grid';
    args.layout.layoutOptions.maxVisibleColumns.auto = true;
    args.layout.layoutOptions.layoutOrder = 'column';
    args.maxRows = 2;
    const sizes = getListSizes(args);
    expect(sizes).toMatchObject({ rowCount: 6, columnCount: 17 });
  });

  it('grid mode with layoutOrder == column should add exta 12px padding to the itemSize', () => {
    args.layout.layoutOptions.dataLayout = 'grid';
    args.layout.layoutOptions.layoutOrder = 'column';
    const sizes = getListSizes(args);
    expect(sizes.itemSize).toEqual(45); // itemSize + padding = 33 + 12 = 45
  });
});
