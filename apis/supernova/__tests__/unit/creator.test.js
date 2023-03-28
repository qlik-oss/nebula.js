import create from '../../src/creator';
import * as HooksUtil from '../../src/hooks';

describe('creator', () => {
  let hookMock;

  beforeEach(() => {
    hookMock = jest.fn();
    /* eslint-disable no-underscore-dangle */
    global.__NEBULA_DEV__ = false;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('old component API', () => {
    let createdMock;
    let mountedMock;
    let renderMock;
    let resizeMock;
    let willUnmountMock;
    let destroyMock;
    let customMock;

    beforeEach(() => {
      createdMock = jest.fn();
      mountedMock = jest.fn();
      renderMock = jest.fn();
      resizeMock = jest.fn();
      willUnmountMock = jest.fn();
      destroyMock = jest.fn();
      customMock = jest.fn();
    });

    test('should call user defined hooks', () => {
      const generator = {
        component: {
          created: createdMock,
          mounted: mountedMock,
          render: renderMock,
          resize: resizeMock,
          willUnmount: willUnmountMock,
          destroy: destroyMock,
          custom: customMock,
        },
        definition: {},
        qae: {
          properties: {},
        },
      };
      const galaxy = {};
      const params = {
        model: {},
        app: {},
      };

      const c = create(generator, params, galaxy).component;

      ['created', 'mounted', 'render', 'resize', 'willUnmount', 'destroy'].forEach((key) => {
        c[key]('a');
        expect(generator.component[key]).toHaveBeenCalledWith('a');
      });
      expect(c.custom).toBe(undefined);
    });
  });

  describe('hooked component API', () => {
    let generator;
    let opts;
    let galaxy;
    let hooked;

    let fnComponentMock;
    let initiateMock;
    let runMock;
    let teardownMock;
    let runSnapsMock;
    let observeActionsMock;
    let getImperativeHandleMock;
    let updateRectOnNextRunMock;

    beforeEach(() => {
      fnComponentMock = jest.fn();

      initiateMock = jest.fn();
      runMock = jest.fn();
      teardownMock = jest.fn();
      runSnapsMock = jest.fn();
      observeActionsMock = jest.fn();
      getImperativeHandleMock = jest.fn();
      updateRectOnNextRunMock = jest.fn();

      hooked = {
        __hooked: true,
        initiate: initiateMock,
        run: runMock,
        teardown: teardownMock,
        runSnaps: runSnapsMock,
        observeActions: observeActionsMock,
        getImperativeHandle: getImperativeHandleMock,
        updateRectOnNextRun: updateRectOnNextRunMock,
      };

      hookMock.mockReturnValue(hooked);
      jest.spyOn(HooksUtil, 'hook').mockImplementation(hookMock);

      fnComponentMock = jest.fn();
      generator = {
        component: fnComponentMock,
        definition: {},
        qae: {
          properties: {},
        },
      };
      galaxy = {
        deviceType: 'desktop',
        translator: { language: () => 'en' },
      };
      opts = {
        nebbie: 'embedAPI',
        keyboardNavigation: false,
        focusHandler: 'focusHandler',
        emitter: 'emitter',
        model: 'model',
        app: 'app',
        selections: 'selections',
        theme: { name: () => 'green' },
      };
    });

    test('should hook into hook API', () => {
      const c = create(generator, opts, galaxy).component;
      expect(hookMock).toHaveBeenCalledWith(fnComponentMock);
      expect(c.isHooked).toBe(true);
    });

    test('should initiate context', () => {
      const c = create(generator, opts, galaxy).component;
      expect(c.context).toEqual({
        model: 'model',
        app: 'app',
        global: undefined,
        selections: 'selections',
        nebbie: 'embedAPI',
        keyboardNavigation: false,
        focusHandler: 'focusHandler',
        emitter: 'emitter',
        element: undefined,
        theme: undefined,
        translator: galaxy.translator,
        layout: {},
        appLayout: {},
        constraints: {
          select: true,
        },
        deviceType: 'desktop',
        options: {},
        plugins: [],
      });
    });

    test('should initiate hook on mount', () => {
      const c = create(generator, opts, galaxy).component;
      c.mounted('element');
      expect(hooked.initiate).toHaveBeenCalledWith(c, { explicitResize: false });
      expect(c.context.element).toBe('element');
    });

    test('should initiate with explicitResize on mount', () => {
      const c = create(generator, { explicitResize: true, ...opts }, galaxy).component;
      c.mounted('element');
      expect(hooked.initiate).toHaveBeenCalledWith(c, { explicitResize: true });
      expect(c.context.element).toBe('element');
    });

    test('should teardown on unmount', () => {
      const c = create(generator, opts, galaxy).component;
      c.willUnmount();
      expect(hooked.teardown).toHaveBeenCalledWith(c);
    });

    test('should schedule update on rect and run on resize', () => {
      const c = create(generator, opts, galaxy).component;
      c.resize();
      expect(hooked.updateRectOnNextRun).toHaveBeenCalledWith(c);
      expect(hooked.run).toHaveBeenCalledWith(c);
    });

    test('should setSnapshotData', () => {
      const c = create(generator, opts, galaxy).component;
      const layout = 'l';
      c.setSnapshotData(layout);
      expect(hooked.runSnaps).toHaveBeenCalledWith(c, layout);
    });

    test('should observeActions', () => {
      const c = create(generator, opts, galaxy).component;
      const fn = () => {};
      c.observeActions(fn);
      expect(hooked.observeActions).toHaveBeenCalledWith(c, fn);
    });

    test('should get imperative handle', () => {
      const c = create(generator, opts, galaxy).component;
      getImperativeHandleMock.mockReturnValue('handle');
      const v = c.getImperativeHandle();
      expect(hooked.getImperativeHandle).toHaveBeenCalledWith(c);
      expect(v).toBe('handle');
    });

    test('should run hook on render when params are not provided', () => {
      const c = create(generator, opts, galaxy).component;
      c.render();
      expect(hooked.run).toHaveBeenCalledWith(c);
    });

    test('should not run hook when observed values have not changed', () => {
      const c = create(generator, opts, galaxy).component;
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
      expect(runMock).toHaveBeenCalledTimes(1);
    });

    test('should run when layout has changed', () => {
      const c = create(generator, opts, galaxy).component;
      const layout = {};
      c.render({ layout }); // initial should always run

      c.render({ layout });
      expect(runMock).toHaveBeenCalledTimes(1);

      c.render({ layout: {} });
      expect(runMock).toHaveBeenCalledTimes(2);
    });

    test('should run when appLayout has changed', () => {
      const c = create(generator, opts, galaxy).component;
      c.render({}); // initial should always run

      c.render({
        context: {
          appLayout: {
            locale: 'meh',
          },
        },
      });
      expect(runMock).toHaveBeenCalledTimes(2);
    });

    test('should run when keyboardNavigation have changed', () => {
      const c = create(generator, opts, galaxy).component;
      c.render({}); // initial should always run

      c.render({
        context: {
          keyboardNavigation: false,
        },
      });
      expect(runMock).toHaveBeenCalledTimes(1);

      c.render({
        context: {
          keyboardNavigation: true,
        },
      });
      expect(runMock).toHaveBeenCalledTimes(2);
    });

    test('should run when constraints have changed', () => {
      const c = create(generator, opts, galaxy).component;
      c.render({}); // initial should always run

      c.render({
        context: {
          constraints: {},
        },
      });
      expect(runMock).toHaveBeenCalledTimes(1);

      c.render({
        context: {
          constraints: {
            passive: true,
          },
        },
      });
      expect(runMock).toHaveBeenCalledTimes(2);
    });

    test('should run when options have changed', () => {
      const c = create(generator, opts, galaxy).component;
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
      expect(runMock).toHaveBeenCalledTimes(2);

      c.render({
        options: {
          rtl: true,
          foo,
          ref,
        },
      });
      expect(runMock).toHaveBeenCalledTimes(2);

      c.render({
        options: {
          rtl: false,
          foo,
          ref,
        },
      });
      expect(runMock).toHaveBeenCalledTimes(3);

      expect(c.context.options).toEqual({
        rtl: false,
        foo,
        ref,
      });
    });

    test('should run when plugins have changed', () => {
      const c = create(generator, opts, galaxy).component;
      c.render({}); // initial should always run

      const plugins1 = [
        { info: { name: 'a' }, fn() {} },
        { info: { name: 'b' }, fn() {} },
      ];
      const plugins2 = [
        { info: { name: 'a' }, fn() {} },
        { info: { name: 'b' }, fn() {} },
      ];

      c.render({
        plugins: plugins1,
      });
      expect(runMock).toHaveBeenCalledTimes(2);

      c.render({
        plugins: plugins1,
      });
      expect(runMock).toHaveBeenCalledTimes(2);

      c.render({
        plugins: plugins2,
      });
      expect(runMock).toHaveBeenCalledTimes(3);

      plugins2.pop();
      c.render({
        plugins: plugins2,
      });
      expect(runMock).toHaveBeenCalledTimes(4);
      expect(c.context.plugins).toEqual(plugins2);
    });

    test('should run when theme name has changed', () => {
      const c = create(generator, opts, galaxy).component;
      c.render({}); // initial should always run

      c.render({
        context: {
          theme: { name: () => 'red' },
        },
      });
      expect(runMock).toHaveBeenCalledTimes(2);
    });

    test('should run when language has changed', () => {
      const c = create(generator, opts, galaxy).component;
      c.render({}); // initial should always run

      galaxy.translator.language = () => 'sv';

      c.render({});
      expect(runMock).toHaveBeenCalledTimes(2);
    });

    test('should return value from run', () => {
      const c = create(generator, opts, galaxy).component;
      runMock.mockReturnValue('fast');
      const r = c.render({});
      expect(r).toBe('fast');
    });

    test('should return previous return value when nothing has changed', () => {
      const c = create(generator, opts, galaxy).component;
      // inital run
      runMock.mockReturnValue('fast');
      const run1 = c.render({});
      expect(run1).toBe('fast');

      const run2 = c.render({});
      expect(run2).toBe('fast');

      expect(runMock).toHaveBeenCalledTimes(1);
    });
  });

  test('should return a default component api', () => {
    const generator = {
      component: {},
      definition: {},
      qae: {
        properties: {},
      },
    };
    const galaxy = {};
    const params = {
      model: {},
      app: {},
    };

    const c = create(generator, params, galaxy).component;

    ['created', 'mounted', 'render', 'resize', 'willUnmount', 'destroy'].forEach((key) =>
      expect(c[key] instanceof Function).toBe(true)
    );

    expect(c.model).toEqual(params.model);
    expect(c.app).toEqual(params.app);
  });

  test('should call onChange on setProperties and applyPatches', async () => {
    const onChangeMock = jest.fn();
    const generator = {
      component: {},
      definition: {},
      qae: {
        properties: {
          onChange: onChangeMock,
        },
      },
    };
    const galaxy = {};
    const properties = { dummyPatched: false };
    const params = {
      model: {
        setProperties: () => Promise.resolve(),
        applyPatches: () => Promise.resolve(),
        getEffectiveProperties: () => Promise.resolve(properties),
      },
      app: {},
    };

    create(generator, params, galaxy).component;
    await params.model.setProperties(properties);

    expect(onChangeMock.mock.instances[0]).toEqual({ model: params.model });
    expect(onChangeMock).toHaveBeenCalledWith(properties);

    await params.model.applyPatches([{ qOp: 'replace', qValue: true, qPath: 'dummyPatched' }], true);

    expect(onChangeMock.mock.instances[0]).toEqual({ model: params.model });
    expect(onChangeMock).toHaveBeenCalledWith({
      dummyPatched: true,
    });
  });
});
