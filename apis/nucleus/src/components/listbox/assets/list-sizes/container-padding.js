import getItemHeight from './item-height';

export default function getContainerPadding({ isGridMode, dense, height, layoutOrder }) {
  let containerPadding;
  if (isGridMode) {
    const itemHeight = getItemHeight({ isGridMode, dense });
    let paddingY;
    if (itemHeight > height) {
      paddingY = '0px';
    } else {
      paddingY = '2px';
    }
    containerPadding = layoutOrder === 'row' ? `${paddingY} 4px` : `${paddingY} 6px ${paddingY} 4px`;
  } else {
    containerPadding = undefined; // to prevent overriding any default padding
  }
  return containerPadding;
}
