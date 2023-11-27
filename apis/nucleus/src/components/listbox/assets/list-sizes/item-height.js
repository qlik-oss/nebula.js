import { DENSE_ROW_HEIGHT, GRID_ROW_HEIGHT, GRID_ITEM_PADDING, LIST_ROW_HEIGHT } from '../../constants';

export default function getItemHeight({ isGridMode, dense }) {
  const normalItemHeight = isGridMode ? GRID_ROW_HEIGHT : LIST_ROW_HEIGHT;
  let itemHeight = dense ? DENSE_ROW_HEIGHT : normalItemHeight;
  if (isGridMode) {
    // Emulate a margin between items using padding, since the list library
    // needs an explicit row height and cannot handle margins.
    itemHeight += GRID_ITEM_PADDING;
  }
  return itemHeight;
}
