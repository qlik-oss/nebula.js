import { renderHook } from '@testing-library/react';
import useStaleLayout from '../useStaleLayout';

describe('useStaleLayout', () => {
  test('returns the current layout when not in a modal selection', () => {
    const layout = { hc: 'a' };
    const { result } = renderHook(() => useStaleLayout(layout));
    expect(result.current).toBe(layout);
  });

  test('freezes the layout while qInSelections is true', () => {
    const layout = { hc: 'a' };
    const { result, rerender } = renderHook((props) => useStaleLayout(props), { initialProps: layout });
    rerender({ hc: 'b', qSelectionInfo: { qInSelections: true } });
    expect(result.current).toBe(layout);
  });

  test('updates again once qInSelections goes back to false', () => {
    const layout = { hc: 'a' };
    const { result, rerender } = renderHook((props) => useStaleLayout(props), { initialProps: layout });
    rerender({ hc: 'b', qSelectionInfo: { qInSelections: true } });
    const updatedLayout = { hc: 'c', qSelectionInfo: { qInSelections: false } };
    rerender(updatedLayout);
    expect(result.current).toBe(updatedLayout);
  });

  test('handles an undefined layout', () => {
    const { result } = renderHook(() => useStaleLayout(undefined));
    expect(result.current).toBeUndefined();
  });
});
