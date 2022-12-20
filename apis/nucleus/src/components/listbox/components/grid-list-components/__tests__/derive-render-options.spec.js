import deriveRenderOptions from '../derive-render-options';

describe('derive-render-options', () => {
  const renderProps = {
    overscanRowStartIndex: 1,
    overscanRowStopIndex: 82,
    overscanColumnStartIndex: 7,
    overscanColumnStopIndex: 12,
    visibleStopIndex: 15,
  };

  const options = {
    renderProps,
    scrollState: {
      setScrollPos: jest.fn(),
    },
    layoutOrder: 'column',
    rowCount: 100,
    columnCount: 3,
  };

  it('should return expected start and stop index for layout order = "column"', () => {
    options.layoutOrder = 'column';
    const resp = deriveRenderOptions(options);
    expect(resp.visibleStartIndex).toEqual(701);
    expect(resp.visibleStopIndex).toEqual(1282);
  });

  it('should return expected start and stop index for layout order = "row"', () => {
    options.layoutOrder = 'row';
    const resp = deriveRenderOptions(options);
    expect(resp.visibleStartIndex).toEqual(10);
    expect(resp.visibleStopIndex).toEqual(258);
  });
});
