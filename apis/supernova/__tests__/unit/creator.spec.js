describe('creator', () => {
  let create;
  before(() => {
    [{ default: create }] = aw.mock([['**/action-hero.js', () => () => ({})]], ['../../src/creator']);
  });

  it('should return a default component api', () => {
    const generator = {
      component: {},
      definition: {},
      qae: {
        properties: {},
      },
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
      qae: {
        properties: {},
      },
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

  it('should call onChange on setProperties and applyPatches', async () => {
    const generator = {
      component: {},
      definition: {},
      qae: {
        properties: {
          onChange: sinon.spy(),
        },
      },
    };
    const env = {};
    const properties = { dummyPatched: false };
    const params = {
      model: {
        setProperties: () => Promise.resolve(),
        applyPatches: () => Promise.resolve(),
        getEffectiveProperties: () => Promise.resolve(properties),
      },
      app: {},
    };

    create(generator, params, env).component;

    await params.model.setProperties(properties);

    expect(
      generator.qae.properties.onChange.thisValues[0],
      'incorrect params in this context after setProperties call'
    ).to.eql({ model: params.model });

    expect(
      generator.qae.properties.onChange,
      'incorrect input params after setProperties call'
    ).to.have.been.calledWith(properties);

    await params.model.applyPatches([{ qOp: 'replace', qValue: true, qPath: 'dummyPatched' }], true);

    expect(
      generator.qae.properties.onChange.thisValues[0],
      'incorrect params in this context after applyPatches call'
    ).to.eql({ model: params.model });

    expect(
      generator.qae.properties.onChange,
      'incorrect input params after applyPatches call'
    ).to.have.been.calledWith({ dummyPatched: true });
  });
});
