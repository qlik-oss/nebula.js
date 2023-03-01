export default function getGridItemSizes({ dataLayout, layoutOrder, itemPadding }) {
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
        height: `calc(100% - ${itemPadding}px)`,
        width: `calc(100% - ${2 * itemPadding}px)`,
      };
    case 'column':
      return {
        height: `calc(100% - ${itemPadding}px)`,
        width: `calc(100% - ${2 * itemPadding}px)`,
      };
    default:
      return {};
  }
}
