class MenuBuilder {
  constructor() {
    this.builders = [];
    this.supportFunctions = [];
  }

  registerBuilder(id, builder) {
    if (Object.keys(this.builders).includes(id)) {
      throw new Error('id for builder must be unique');
    }
    this.builders[id] = builder;
  }

  getBuilder(id) {
    return this.builders[id];
  }

  getSupportFunction(id) {
    return this.supportFunctions[id];
  }
}

export default MenuBuilder;
