import Item from './menu-item';

const Menu = () => {
  const root = new Item();
  return {
    addItem: (item) => root.addItem(item),
    deleteItem: (id) => root.deleteItem(id),
    setItems: (items) => {
      root.items = items;
    },
    items: root.items,
  };
};
export default Menu;
