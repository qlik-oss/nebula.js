/* eslint no-underscore-dangle:0 */
import { useEffect } from 'react';
import useRect from '../../../hooks/useRect';
import {
  gridColumnContainerPaddingBottom,
  gridColumnContainerPaddingTop,
  gridRowContainerPaddingTopBottom,
  GRID_MODE_NORMAL_ITEM_HEIGHT,
} from '../constants';

const hasScrollbar = (loaderRef) => {
  const scrollElement = loaderRef.current?._listRef?._outerRef;
  const clientHeight = scrollElement?.clientHeight ?? 0;
  const offsetHeight = scrollElement?.offsetHeight ?? 0;
  return clientHeight < offsetHeight;
};

const useSetAutoDense = ({ autoDense, loaderRef, element, layout }) => {
  const [callbackRef, elementRect] = useRect();
  const isGrid = layout?.layoutOptions?.dataLayout === 'grid';
  const isRow = layout?.layoutOptions?.layoutOrder === 'row';

  useEffect(() => {
    if (!element || !isGrid) {
      return;
    }
    callbackRef(element);
    if (!elementRect) {
      return;
    }
    const elHeight = elementRect.height;
    const containerPadding = isRow
      ? gridRowContainerPaddingTopBottom + 2
      : gridColumnContainerPaddingTop + gridColumnContainerPaddingBottom + 4;
    const scrollbarHeight = hasScrollbar(loaderRef) ? 10 : 0;
    const isAutoDense = isGrid && elHeight < GRID_MODE_NORMAL_ITEM_HEIGHT + containerPadding + scrollbarHeight;
    autoDense.set(isAutoDense);
  }, [elementRect, element]);
};

export default useSetAutoDense;
