import handleSetOverflowDisclaimer from '../set-overflow-disclaimer';

describe('handle set overflow disclaimer', () => {
  const renderProps = {
    visibleRowStartIndex: 0,
    visibleRowStopIndex: 3,
    visibleColumnStartIndex: 0,
    visibleColumnStopIndex: 2,
    visibleStartIndex: 0,
    visibleStopIndex: 5,
  };
  const layoutOptions = {
    layoutOrder: 'column',
    dataLayout: 'singleColumn',
  };
  const maxCount = {
    column: 5,
    row: 10,
  };
  const columnCount = 1;
  const rowCount = 6;
  const overflowDisclaimer = {
    state: {
      show: false,
    },
    set: jest.fn(),
  };
  const qCardinal = 30;
  const dataOffset = 5;

  it('sets overflowDisclaimer.show to true when scrolled to top and dataOffset > 0 (showing overflowing data)', () => {
    handleSetOverflowDisclaimer({
      renderProps,
      layoutOptions,
      maxCount,
      columnCount,
      rowCount,
      overflowDisclaimer,
      qCardinal,
      dataOffset,
    });
    expect(overflowDisclaimer.set).toHaveBeenCalledWith(true);
  });

  it('sets overflowDisclaimer.show to false when not scrolled to top and dataOffset > 0 (showing overflowing data)', () => {
    const newRenderProps = { ...renderProps, visibleRowStartIndex: 1 };
    handleSetOverflowDisclaimer({
      renderProps: newRenderProps,
      layoutOptions,
      maxCount,
      columnCount,
      rowCount,
      overflowDisclaimer,
      qCardinal,
      dataOffset,
    });
    expect(overflowDisclaimer.set).toHaveBeenCalledWith(false);
  });

  it('sets overflowDisclaimer.show to true when scrolled to bottom and dataOffset is 0, but more data is available', () => {
    const newRenderProps = { ...renderProps, visibleRowStopIndex: 10 };
    handleSetOverflowDisclaimer({
      renderProps: newRenderProps,
      layoutOptions,
      maxCount,
      columnCount,
      rowCount,
      overflowDisclaimer,
      qCardinal,
      dataOffset,
    });
    expect(overflowDisclaimer.set).toHaveBeenCalledWith(true);
  });

  it('sets overflowDisclaimer.show to false when scrolled to bottom at end of data', () => {
    const newRenderProps = { ...renderProps, visibleRowStopIndex: 24, visibleRowStartIndex: 10 };
    handleSetOverflowDisclaimer({
      renderProps: newRenderProps,
      layoutOptions,
      maxCount,
      columnCount,
      rowCount: 11,
      overflowDisclaimer,
      qCardinal,
      dataOffset,
    });
    expect(overflowDisclaimer.set).toHaveBeenCalledWith(false);
  });
});
