import { useEffect, useState } from 'react';
import useRect from '../../../hooks/useRect';
import { HEADER_HEIGHT, SCROLL_BAR_HEIGHT, SINGLE_GRID_ROW_HEIGHT } from '../constants';

export default function useAutoHideToolbar({ element, layout }) {
  const [autoHideToolbar, setAutoHideToolbar] = useState(false);
  const [callbackRef, elementRect] = useRect();

  useEffect(() => {
    if (!element) {
      return;
    }
    callbackRef(element);
    if (!elementRect) {
      return;
    }
    const isGrid = layout?.layoutOptions?.dataLayout === 'grid';
    const containerHeight = elementRect.height;
    const headerHeightPadding = 16;
    const headerHeight = HEADER_HEIGHT + headerHeightPadding;
    const hideHeightLimit = headerHeight + SINGLE_GRID_ROW_HEIGHT + SCROLL_BAR_HEIGHT;
    if (containerHeight < hideHeightLimit && isGrid) {
      setAutoHideToolbar(true);
      return;
    }
    setAutoHideToolbar(false);
  }, [elementRect, element]);

  return autoHideToolbar;
}
