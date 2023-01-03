export default function getGridItemSizes({ layoutOrder, itemWidth, itemHeight }) {
  switch (layoutOrder) {
    case 'row':
      return { width: Number.parseInt(itemWidth, 10) - 20 };
    case 'column':
      return { height: Number.parseInt(itemHeight, 10) - 8 };
    default:
      return {};
  }
}
