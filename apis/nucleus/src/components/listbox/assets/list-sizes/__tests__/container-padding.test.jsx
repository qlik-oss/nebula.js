import getContainerPadding from '../container-padding';

describe('container-padding', () => {
  it('list mode should always return undefined', () => {
    const p = getContainerPadding({ isGridMode: false });
    expect(p).toEqual(undefined);
  });

  describe('grid mode - check breakpoint for removing padding', () => {
    const isGridMode = true;

    it('when row layout height is smaller than regular item height - expect 0 padding', () => {
      const p = getContainerPadding({ isGridMode, dense: false, height: 36, layoutOrder: 'row' });
      expect(p).toEqual('2px 4px');
      const p2 = getContainerPadding({ isGridMode, dense: false, height: 35, layoutOrder: 'row' });
      expect(p2).toEqual('0px 4px');
    });
    it('ensure row layout accounts for dense item height when checking for padding', () => {
      const p = getContainerPadding({ isGridMode, dense: true, height: 24, layoutOrder: 'row' });
      expect(p).toEqual('2px 4px');
      const p2 = getContainerPadding({ isGridMode, dense: true, height: 23, layoutOrder: 'row' });
      expect(p2).toEqual('0px 4px');
    });
    it('when column layout height is smaller than regular item height - expect 0 padding', () => {
      const p = getContainerPadding({ isGridMode, dense: false, height: 36, layoutOrder: 'column' });
      expect(p).toEqual('2px 6px 2px 4px');
      const p2 = getContainerPadding({ isGridMode, dense: false, height: 35, layoutOrder: 'column' });
      expect(p2).toEqual('0px 6px 0px 4px');
    });
    it('ensure column layout accounts for dense item height when checking for padding', () => {
      const p = getContainerPadding({ isGridMode, dense: true, height: 24, layoutOrder: 'column' });
      expect(p).toEqual('2px 6px 2px 4px');
      const p2 = getContainerPadding({ isGridMode, dense: true, height: 23, layoutOrder: 'column' });
      expect(p2).toEqual('0px 6px 0px 4px');
    });
  });
});
