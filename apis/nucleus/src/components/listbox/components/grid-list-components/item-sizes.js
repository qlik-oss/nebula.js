export default function getGridItemSizes({ dataLayout, layoutOrder, itemPadding, fillHeight }) {
  // Simulate margin/padding by making the item smaller than its container.
  if (dataLayout === 'singleColumn') {
    return {
      height: '100%',
      width: '100%',
    };
  }

  switch (layoutOrder) {
    case 'row':
      return {
        height: fillHeight ? '100%' : `calc(100% - ${itemPadding}px)`,
        width: `calc(100% - ${2 * itemPadding}px)`,
        position: 'absolute',
        left: 4,
      };
    case 'column':
      return {
        height: fillHeight ? '100%' : `calc(100% - ${itemPadding}px)`,
        width: `calc(100% - ${2 * itemPadding}px)`,
        position: 'absolute',
        left: 4,
      };
    default:
      return {};
  }
}
