describe('creator', () => {
  let create;
  let sandbox;
  let hook;
  let run;
  before(() => {
    sandbox = sinon.createSandbox();
    hook = sandbox.stub();
    run = sandbox.stub();
    [{ default: create }] = aw.mock(
      [
        ['**/action-hero.js', () => () => ({})],
        ['**/hooks.js', () => ({ hook, run })],
      ],
      ['../../src/creator']
    );
  });
  afterEach(() => {
    sandbox.reset();
  });

  describe('old component API', () => {
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
  });

  describe('hooked component API', () => {
    let fnComponent;
    let generator;
    let opts;
    let env;
    let hooked;
    beforeEach(() => {
      hooked = {
        __hooked: true,
        initiate: sinon.spy(),
        run: sinon.stub(),
        teardown: sinon.spy(),
        runSnaps: sinon.spy(),
        observeActions: sinon.spy(),
        getImperativeHandle: sinon.stub(),
      };
      hook.returns(hooked);
      fnComponent = sinon.spy();
      generator = {
        component: fnComponent,
        definition: {},
        qae: {
          properties: {},
        },
      };
      env = {
        translator: { language: () => 'en' },
      };
      opts = {
        model: 'model',
        app: 'app',
        selections: 'selections',
        theme: { name: () => 'green' },
      };
    });

    it('should hook into hook API', () => {
      const c = create(generator, opts, env).component;
      expect(hook).to.have.been.calledWithExactly(fnComponent);
      expect(c.isHooked).to.equal(true);
    });

    it('should initiate context', () => {
      const c = create(generator, opts, env).component;
      expect(c.context).to.eql({
        model: 'model',
        app: 'app',
        global: undefined,
        selections: 'selections',
        element: undefined,
        theme: undefined,
        translator: env.translator,
        layout: {},
        appLayout: {},
        constraints: {
          select: true,
        },
        options: {},
      });
    });

    it('should initiate hook on mount', () => {
      const c = create(generator, opts, env).component;
      c.mounted('element');
      expect(hooked.initiate).to.have.been.calledWithExactly(c);
      expect(c.context.element).to.equal('element');
    });

    it('should teardown on unmount', () => {
      const c = create(generator, opts, env).component;
      c.willUnmount();
      expect(hooked.teardown).to.have.been.calledWithExactly(c);
    });

    it('should run on resize', () => {
      const c = create(generator, opts, env).component;
      c.resize();
      expect(hooked.run).to.have.been.calledWithExactly(c);
    });

    it('should setSnapshotData', () => {
      const c = create(generator, opts, env).component;
      const layout = 'l';
      c.setSnapshotData(layout);
      expect(hooked.runSnaps).to.have.been.calledWithExactly(c, layout);
    });

    it('should observeActions', () => {
      const c = create(generator, opts, env).component;
      const fn = () => {};
      c.observeActions(fn);
      expect(hooked.observeActions).to.have.been.calledWithExactly(c, fn);
    });

    it('should get imperative handle', () => {
      const c = create(generator, opts, env).component;
      hooked.getImperativeHandle.returns('handle');
      const v = c.getImperativeHandle();
      expect(hooked.getImperativeHandle).to.have.been.calledWithExactly(c);
      expect(v).to.equal('handle');
    });

    it('should run hook on render when params are not provided', () => {
      const c = create(generator, opts, env).component;
      c.render();
      expect(hooked.run).to.have.been.calledWithExactly(c);
    });

    it('should not run hook when observed values have not changed', () => {
      const c = create(generator, opts, env).component;
      const layout = 'layout';
      c.render({
        layout,
        context: {
          appLayout: {
            bla: 'meh',
          },
          constraints: {
            passive: false,
          },
          theme: {
            name: () => 'green',
          },
        },
        options: {
          rtl: true,
        },
      });

      // use same values as above with new objects (except layout)
      // to make sure deep values are checked, and not references only
      c.render({
        layout,
        context: {
          appLayout: {
            bla: 'meh',
          },
          constraints: {
            passive: false,
          },
          theme: {
            name: () => 'green',
          },
        },
        options: {
          rtl: true,
        },
      });
      expect(hooked.run.callCount).to.equal(1);
    });

    it('should run when layout has changed', () => {
      const c = create(generator, opts, env).component;
      const layout = {};
      c.render({ layout }); // initial should always run

      c.render({ layout });
      expect(hooked.run.callCount).to.equal(1);

      c.render({ layout: {} });
      expect(hooked.run.callCount).to.equal(2);
    });

    it('should run when appLayout has changed', () => {
      const c = create(generator, opts, env).component;
      c.render({}); // initial should always run

      c.render({
        context: {
          appLayout: {
            locale: 'meh',
          },
        },
      });
      expect(hooked.run.callCount).to.equal(2);
    });

    it('should run when constraints have changed', () => {
      const c = create(generator, opts, env).component;
      c.render({}); // initial should always run

      c.render({
        context: {
          constraints: {},
        },
      });
      expect(hooked.run.callCount).to.equal(1);

      c.render({
        context: {
          constraints: {
            passive: true,
          },
        },
      });
      expect(hooked.run.callCount).to.equal(2);
    });

    it('should run when options have changed', () => {
      const c = create(generator, opts, env).component;
      c.render({}); // initial should always run

      const foo = new (class Foo {})();
      const ref = {};

      c.render({
        options: {
          rtl: true,
          foo,
          ref,
        },
      });
      expect(hooked.run.callCount).to.equal(2);

      c.render({
        options: {
          rtl: true,
          foo,
          ref,
        },
      });
      expect(hooked.run.callCount).to.equal(2);

      c.render({
        options: {
          rtl: false,
          foo,
          ref,
        },
      });
      expect(hooked.run.callCount).to.equal(3);
    });

    it('should run when theme name has changed', () => {
      const c = create(generator, opts, env).component;
      c.render({}); // initial should always run

      c.render({
        context: {
          theme: { name: () => 'red' },
        },
      });
      expect(hooked.run.callCount).to.equal(2);
    });

    it('should run when language has changed', () => {
      const c = create(generator, opts, env).component;
      c.render({}); // initial should always run

      env.translator.language = () => 'sv';

      c.render({});
      expect(hooked.run.callCount).to.equal(2);
    });

    it('should return value from run', () => {
      const c = create(generator, opts, env).component;
      hooked.run.returns('fast');
      const r = c.render({});
      expect(r).to.equal('fast');
    });

    it('should return previous return value when nothing has changed', () => {
      const c = create(generator, opts, env).component;
      // inital run
      hooked.run.returns('fast');
      const run1 = c.render({});
      expect(run1).to.equal('fast');

      const run2 = c.render({});
      expect(run2).to.equal('fast');

      expect(hooked.run.callCount).to.equal(1);
    });
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
