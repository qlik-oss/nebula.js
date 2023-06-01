import { CHECKBOX_WIDTH, ITEM_MIN_WIDTH } from '../../../constants';
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
      freqMinWidth: 48,
      freqMaxWidth: 80,
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
      freqMinWidth: 48,
      freqMaxWidth: 80,
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
    });
  });

  it('grid mode with layoutOrder column and frequency activated should be wider', () => {
    args.layout.layoutOptions.dataLayout = 'grid';
    args.layout.layoutOptions.layoutOrder = 'column';
    args.freqIsAllowed = true;
    const sizes = useListSizes(args);
    expect(sizes).toEqual({
      textWidth: 40,
      freqMinWidth: 48,
      freqMaxWidth: 80,
      columnCount: 34,
      columnWidth: 126,
      count: 200,
      itemPadding: 4,
      itemHeight: 36,
      listCount: 100,
      listHeight: 300,
      listWidth: 200,
      maxCount: {
        column: 266269,
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
      columnWidth: ITEM_MIN_WIDTH + 50 + CHECKBOX_WIDTH,
      maxCount: {
        column: 266269,
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
      columnWidth: ITEM_MIN_WIDTH + 50 + CHECKBOX_WIDTH,
      maxCount: {
        column: 266269,
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
      freqMinWidth: 48,
      freqMaxWidth: 80,
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
    });
  });

  it('maxColumnCount should limit listCount and columnCount, in grid layout', () => {
    const rowCount = 3;
    const itemHeight = 36;
    args.layout.layoutOptions.dataLayout = 'grid';
    args.height = itemHeight * 3; // ensure height can fit 3 rows, or we will fall back to auto calculation
    args.layout.layoutOptions.layoutOrder = 'column';
    const columnCount = 578448;
    args.listCount = rowCount * columnCount + 1;
    const sizes = useListSizes(args);
    expect(sizes).toEqual({
      textWidth: 40,
      freqMinWidth: 48,
      freqMaxWidth: 80,
      columnCount,
      columnWidth: 58,
      count: 200,
      itemPadding: 4,
      itemHeight,
      listCount: columnCount * rowCount,
      listHeight: 3 * itemHeight,
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
    });
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
