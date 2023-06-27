class MenuBuilder {
  constructor() {
    this.builders = {};
    this.supportFunctions = {};
  }

  registerBuilder(id, builder) {
    if (!Object.keys(this.builders).includes(id)) {
      this.builders[id] = builder;
    }
  }

  getBuilder(id) {
    return this.builders[id];
  }

  registerSupportFunction(id, func) {
    if (!Object.keys(this.builders).includes(id)) {
      this.supportFunctions[id] = func;
    }
  }

  getSupportFunction(id) {
    return this.supportFunctions[id];
  }
}

export default MenuBuilder;
