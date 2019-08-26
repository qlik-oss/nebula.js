describe('creator', () => {
  const [{ default: create }] = aw.mock([['**/action-hero.js', () => () => ({})]], ['../../src/creator']);

  it('should return a default component api', () => {
    const generator = {
      component: {},
      definition: {},
    };
    const env = {};
    const params = {
      model: {},
      app: {},
    };

    const c = create(generator, params, env).component;

    ['created', 'mounted', 'render', 'resize', 'willUnmount', 'destroy'].forEach(key =>
      expect(c[key]).to.be.a('function')
    );

    expect(c.model).to.equal(params.model);
    expect(c.app).to.equal(params.app);
  });

  it('should call user defined hooks', () => {
    const generator = {
      component: {
        created: sinon.spy(),
        mounted: sinon.spy(),
        render: sinon.spy(),
        resize: sinon.spy(),
        willUnmount: sinon.spy(),
        destroy: sinon.spy(),
        custom: sinon.spy(),
      },
      definition: {},
    };
    const env = {};
    const params = {
      model: {},
      app: {},
    };

    const c = create(generator, params, env).component;

    ['created', 'mounted', 'render', 'resize', 'willUnmount', 'destroy'].forEach(key => {
      c[key]('a');
      expect(generator.component[key]).to.have.been.calledWithExactly('a');
    });
    expect(c.custom).to.be.undefined;
  });
});
