import React, { forwardRef, useImperativeHandle } from 'react';
import { act, create } from 'react-test-renderer';
import * as useRect from '../../../../hooks/useRect';
import useAutoHideToolbar from '../useAutoHideToolbar';

const TestHook = forwardRef(({ hook, hookProps }, ref) => {
  const result = hook(...hookProps);
  useImperativeHandle(ref, () => ({
    result,
  }));
  return null;
});

describe('useAutoHideToolbar', () => {
  let element;
  let render;
  let renderer;
  let ref;
  let elementHeight = 0;

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

  it('returns true when the container height is smaller than the hide height limit and the layout is grid', async () => {
    const layout = { layoutOptions: { dataLayout: 'grid' } };
    elementHeight = 97;
    await render(useAutoHideToolbar, { element, layout });
    expect(ref.current.result).toEqual(true);
  });

  it('returns false when the container height is greater than the hide height limit and the layout is grid', async () => {
    const layout = { layoutOptions: { dataLayout: 'grid' } };
    elementHeight = 99;
    await render(useAutoHideToolbar, { element, layout });
    expect(ref.current.result).toEqual(false);
  });

  it('returns false when the layout is not grid', async () => {
    const layout = { layoutOptions: { dataLayout: 'singleColumn' } };
    elementHeight = 97;
    await render(useAutoHideToolbar, { element, layout });
    expect(ref.current.result).toEqual(false);
  });
});
