export default function getGridItemSizes({ layoutOrder, itemWidth, itemHeight }) {
  // Simulate margin/padding by making the item smaller than its container.
  switch (layoutOrder) {
    case 'row':
      return { width: Number.parseInt(itemWidth, 10) - 20 };
    case 'column':
      return { height: Number.parseInt(itemHeight, 10) - 12 };
    default:
      return {};
  }
}
