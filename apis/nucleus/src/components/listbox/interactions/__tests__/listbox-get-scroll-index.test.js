import getScrollIndex from '../listbox-get-scroll-index';

describe('getScrollIndex', () => {
  it('returns scrollIndex and offset for position "start"', () => {
    const layout = {
      qListObject: {
        qDimensionInfo: {
          qCardinal: 100,
        },
      },
    };
    const sizes = {
      rowCount: 200,
      columnCount: 150,
      listCount: 150,
    };
    const result = getScrollIndex({
      position: 'start',
      isRow: true,
      sizes,
      layout,
    });
    expect(result).toEqual({
      scrollIndex: 0,
      offset: 0,
      triggerRerender: false,
    });
  });

  it('returns scrollIndex and offset for position "end"', () => {
    const layout = {
      qListObject: {
        qDimensionInfo: {
          qCardinal: 100,
        },
      },
    };
    const sizes = {
      rowCount: 200,
      columnCount: 150,
      listCount: 150,
    };
    const result = getScrollIndex({
      position: 'end',
      isRow: true,
      sizes,
      layout,
    });
    expect(result).toEqual({
      scrollIndex: 200,
      offset: 0,
      triggerRerender: false,
    });
  });

  it('returns scrollIndex and offset for position "overflowStart"', () => {
    const layout = {
      qListObject: {
        qDimensionInfo: {
          qCardinal: 100,
        },
      },
    };
    const sizes = {
      rowCount: 200,
      columnCount: 150,
      listCount: 150,
    };
    const result = getScrollIndex({
      position: 'overflowStart',
      isRow: true,
      sizes,
      layout,
    });
    expect(result).toEqual({
      scrollIndex: 0,
      offset: 0,
      triggerRerender: true,
    });
  });

  it('returns scrollIndex and offset for position "overflowEnd"', () => {
    const layout = {
      qListObject: {
        qDimensionInfo: {
          qCardinal: 100,
        },
      },
    };
    const sizes = {
      rowCount: 200,
      columnCount: 150,
      listCount: 50,
    };
    const result = getScrollIndex({
      position: 'overflowEnd',
      isRow: true,
      sizes,
      layout,
    });
    expect(result).toEqual({
      scrollIndex: 100,
      offset: 50,
      triggerRerender: true,
    });
  });
});
