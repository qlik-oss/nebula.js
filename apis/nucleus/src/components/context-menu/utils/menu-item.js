const Item = function (item) {
  const self = this;
  Object.keys(item || {}).forEach((key) => {
    self[key] = item[key];
  });
  this.items = this.items || [];
};

Item.prototype.addItem = function (options, index) {
  const item = new Item(options);
  item.tabIndex = this.items.length === 0 ? 0 : -1;
  if (typeof index === 'undefined') {
    this.items.push(item);
  } else {
    this.items.splice(index, 0, item);
  }
  return item;
};

Item.prototype.updateItem = function (options) {
  Object.entries(options).forEach(([key, value]) => {
    this[key] = value;
  });
};

Item.prototype.deleteItem = function (id) {
  this.items = this.items.filter((i) => i.id !== id);
};

Item.prototype.deleteAll = () => {
  this.items = [];
};

Item.prototype.hasSubmenu = function () {
  return this.items.length > 0;
};

Item.prototype.hasIcon = function () {
  return !!this.icon;
};

Item.prototype.getLabel = function (translator) {
  function getTranslationString(value) {
    if (Array.isArray(value)) {
      return translator.get(value[0], value.slice(1).join(','));
    }
    return translator.get(value);
  }

  if (typeof this.translation === 'function') {
    return getTranslationString(this.translation());
  }
  if (this.translation) {
    return getTranslationString(this.translation);
  }
  if (typeof this.label === 'function') {
    return this.label();
  }
  if (this.label) {
    return this.label;
  }
  return 'Missing translation/label';
};

export default Item;
