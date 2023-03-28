import React, { forwardRef, useImperativeHandle } from 'react';
import { act, create } from 'react-test-renderer';
import * as useRect from '../../../../hooks/useRect';
import useAutoDense from '../useSetAutoDense';

const TestHook = forwardRef(({ hook, hookProps }, ref) => {
  const result = hook(...hookProps);
  useImperativeHandle(ref, () => ({
    result,
  }));
  return null;
});

const getListRef = (hasScrollbar) => {
  const offsetHeight = hasScrollbar ? 51 : 49;
  return { current: { _listRef: { _outerRef: { clientHeight: 50, offsetHeight } } } };
};

describe('useAutoHideToolbar', () => {
  let element;
  let render;
  let renderer;
  let ref;
  let elementHeight = 0;
  const autoDense = { set: jest.fn() };

  beforeEach(() => {
    jest.spyOn(useRect, 'default').mockImplementation(() => [() => {}, { height: elementHeight }]);
    element = document.createElement('div');

    ref = React.createRef();
    render = async (hook, ...hookProps) => {
      await act(async () => {
        renderer = create(<TestHook ref={ref} hook={hook} hookProps={hookProps} />);
      });
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
    renderer.unmount();
  });

  it('set true when the container height is smaller than the item and scrollbar height', async () => {
    const layout = { layoutOptions: { dataLayout: 'grid' } };
    elementHeight = 49;
    await render(useAutoDense, { autoDense, loaderRef: getListRef(true), element, layout });
    expect(autoDense.set).toHaveBeenCalledTimes(1);
    expect(autoDense.set).toHaveBeenCalledWith(true);
  });

  it('set true when the container height is smaller than the item hight without scrollbar', async () => {
    const layout = { layoutOptions: { dataLayout: 'grid' } };
    elementHeight = 39;
    await render(useAutoDense, { autoDense, loaderRef: getListRef(false), element, layout });
    expect(autoDense.set).toHaveBeenCalledTimes(1);
    expect(autoDense.set).toHaveBeenCalledWith(true);
  });

  it('set false when the container height is smaller than the item hight without scrollbar', async () => {
    const layout = { layoutOptions: { dataLayout: 'grid' } };
    elementHeight = 41;
    await render(useAutoDense, { autoDense, loaderRef: getListRef(false), element, layout });
    expect(autoDense.set).toHaveBeenCalledTimes(1);
    expect(autoDense.set).toHaveBeenCalledWith(false);
  });
});
