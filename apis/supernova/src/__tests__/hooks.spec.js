/* eslint no-underscore-dangle: 0 */
/* eslint class-methods-use-this: 0 */
/* eslint lines-between-class-members: 0 */
import {
  hook,
  initiate,
  teardown,
  run,
  runSnaps,
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  usePromise,
  useRect,
  useModel,
  useApp,
  useGlobal,
  useElement,
  useSelections,
  useTheme,
  useLayout,
  useLazyLayout,
  useTranslator,
  onTakeSnapshot,
} from '../hooks';

const frame = () => new Promise(resolve => setTimeout(resolve));

describe('hooks', () => {
  let c;
  let sandbox;
  let DEV;
  before(() => {
    sandbox = sinon.createSandbox();
    DEV = global.__NEBULA_DEV__;
    global.__NEBULA_DEV__ = true;
    if (!global.requestAnimationFrame) {
      global.requestAnimationFrame = cb => setTimeout(cb, 20);
      global.cancelAnimationFrame = clearTimeout;
    }
  });
  after(() => {
    global.__NEBULA_DEV__ = DEV;
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('hook should bind hooks to file scope', () => {
    const fn = 'fn';
    const h = hook(fn);
    expect(h).to.eql({
      __hooked: true,
      fn: 'fn',
      initiate,
      run,
      teardown,
      runSnaps,
    });
  });

  it('should throw when hook is used outside method context', () => {
    const fn = () => useState(0);

    expect(fn).to.throw('Invalid nebula hook call. Hooks can only be called inside a supernova component.');
  });

  it('should throw when hooks are used outside top level of method context', async () => {
    sandbox.useFakeTimers();
    const { clock } = sandbox;
    c = {};
    initiate(c);
    const err = sandbox.stub(console, 'error');

    c.fn = () => {
      useLayoutEffect(() => {
        useState(0);
      });
    };

    run(c);
    clock.tick(60);
    expect(err.args[0][0].message).to.equal(
      'Invalid nebula hook call. Hooks can only be called inside a supernova component.'
    );
  });

  describe('teardown', () => {
    it('should teardown hooks', () => {
      const spy = sandbox.spy();
      c = {
        __hooks: {
          list: [{ teardown: spy }],
          pendingEffects: [],
          pendingLayoutEffects: [],
        },
      };

      teardown(c);
      expect(spy.callCount).to.equal(1);
    });
  });

  describe('runSnaps', () => {
    it('should run snaps hooks', async () => {
      const take1 = layout => {
        return Promise.resolve({ take1: 'yes', ...layout });
      };

      c = {
        __hooks: {
          snaps: [{ fn: take1 }],
        },
      };

      const s = await runSnaps(c, { a: '1' });
      expect(s).to.eql({ a: '1', take1: 'yes' });
    });
  });

  describe('useState', () => {
    beforeEach(() => {
      c = {};
      initiate(c);
    });
    afterEach(() => {
      teardown(c);
    });

    it('should initiate state with value', () => {
      let countValue;
      c.fn = () => {
        [countValue] = useState(7);
      };

      run(c);
      expect(countValue).to.equal(7);
    });

    it('should initiate state with function', () => {
      let countValue;
      c.fn = () => {
        [countValue] = useState(() => 7);
      };

      run(c);
      expect(countValue).to.equal(7);
    });

    it('should update state value', async () => {
      let setter;
      let countValue;
      c.fn = () => {
        [countValue, setter] = useState(7);
      };

      run(c);
      expect(countValue).to.equal(7);
      setter(12);
      await frame();
      expect(countValue).to.equal(12);
    });

    it('should throw error when setState is called on an unmounted component', async () => {
      let setter;
      let countValue;
      c.fn = () => {
        [countValue, setter] = useState(7);
      };

      await run(c);
      c.__hooks.obsolete = true;
      expect(setter).to.throw(
        'Calling setState on an unmounted component is a no-op and indicates a memory leak in your component.'
      );
      expect(countValue).to.equal(7);
    });

    it('should update state value based on previous', async () => {
      let setter;
      let countValue;
      c.fn = () => {
        [countValue, setter] = useState(7);
      };

      run(c);
      expect(countValue).to.equal(7);
      setter(prev => prev + 2);
      await frame();
      expect(countValue).to.equal(9);
    });

    it('should not re-render when state has not changed', async () => {
      let setter;
      let num = 0;
      c.fn = () => {
        [, setter] = useState(7);
        ++num;
      };

      run(c);
      expect(num).to.equal(1);
      setter(7);
      await frame();
      expect(num).to.equal(1);
    });

    it('should re-render only once when multiple states have changed', async () => {
      let setA;
      let setB;
      let setC;
      let num = 0;
      c.fn = () => {
        [, setA] = useState(7);
        [, setB] = useState(-4);
        [, setC] = useState(0);
        ++num;
      };

      run(c);
      expect(num).to.equal(1);
      setA(8);
      setB(-3);
      setC(1);
      await frame();
      expect(num).to.equal(2);
    });
  });

  describe('useMemo', () => {
    beforeEach(() => {
      c = {};
      initiate(c);
    });
    afterEach(() => {
      teardown(c);
    });

    it('should run only when deps change', () => {
      const stub = sandbox.stub();
      stub.onFirstCall().returns(5);
      stub.onSecondCall().returns(6);
      let dep = 'a';
      let value;
      c.fn = () => {
        value = useMemo(stub, [dep]);
      };

      run(c);
      run(c);
      expect(value).to.equal(5);

      dep = 'b';
      run(c);
      expect(value).to.equal(6);
    });
  });

  describe('useLayoutEffect', () => {
    beforeEach(() => {
      c = {};
      initiate(c);
    });
    afterEach(() => {
      teardown(c);
    });

    it('without deps should run after every render', () => {
      const spy = sandbox.spy();
      c.fn = () => {
        useLayoutEffect(spy);
      };

      run(c);
      run(c);
      run(c);
      expect(spy.callCount).to.equal(3);
    });

    it('with empty deps should run after first render', () => {
      const spy = sandbox.spy();
      c.fn = () => {
        useLayoutEffect(spy, []);
      };

      run(c);
      run(c);
      run(c);
      expect(spy.callCount).to.equal(1);
    });

    it('with deps should run only when deps change', () => {
      const spy = sandbox.spy();
      let dep1 = 'a';
      let dep2 = 0;
      c.fn = () => {
        useLayoutEffect(spy, [dep1, dep2]);
      };

      run(c);

      dep1 = 'b';
      run(c);
      expect(spy.callCount).to.equal(2);

      dep2 = false;
      run(c);
      expect(spy.callCount).to.equal(3);
    });

    it('should cleanup previous', async () => {
      const spy = sandbox.spy();
      const f = () => {
        return spy;
      };
      c.fn = () => {
        useLayoutEffect(f);
      };

      run(c); // initial render
      run(c); // should cleanup previous effects on second render
      expect(spy.callCount).to.equal(1);
    });
  });

  describe('useEffect', () => {
    let clock;
    beforeEach(() => {
      c = {};
      initiate(c);
      sandbox.useFakeTimers();
      global.requestAnimationFrame = cb => setTimeout(cb, 20);
      clock = sandbox.clock;
    });
    afterEach(() => {
      teardown(c);
    });

    it('should run once even when called multiple times', () => {
      const spy = sandbox.spy();
      c.fn = () => {
        useEffect(spy);
      };

      run(c);
      run(c);
      run(c);
      clock.tick(20);
      expect(spy.callCount).to.equal(1);
    });

    it('without deps should run after every "frame"', () => {
      const spy = sandbox.spy();
      c.fn = () => {
        useEffect(spy);
      };

      run(c);
      clock.tick(20);
      run(c);
      clock.tick(20);
      run(c);
      clock.tick(20);
      expect(spy.callCount).to.equal(3);
    });

    it('with deps should run only when deps change', () => {
      const spy = sandbox.spy();
      let dep1 = 'a';
      let dep2 = 0;
      c.fn = () => {
        useEffect(spy, [dep1, dep2]);
      };

      run(c);
      clock.tick(20);

      dep1 = 'b';
      run(c);
      clock.tick(20);
      expect(spy.callCount).to.equal(2);

      dep2 = false;
      run(c);
      clock.tick(20);
      expect(spy.callCount).to.equal(3);
    });
  });

  describe('usePromise', () => {
    beforeEach(() => {
      c = {};
      initiate(c);
    });
    afterEach(() => {
      teardown(c);
    });

    it('should resolve run-phase when pending promises are resolved', async () => {
      let reject;
      let resolve;
      const prom1 = new Promise(r => {
        resolve = r;
      });
      const prom2 = new Promise((r, j) => {
        reject = j;
      });
      let v1;
      let v2;
      c.fn = () => {
        [v1] = usePromise(() => prom1, ['']);
        [, v2] = usePromise(() => prom2, ['']);
      };

      const p = run(c);

      reject('rej');
      resolve('res');
      await p;
      expect([v1, v2]).to.eql(['res', 'rej']);
    });
  });

  describe('useRect', () => {
    let element;

    describe('with ResizeObserver', () => {
      const originalRO = global.ResizeObserver;
      let RO;
      let RO_;

      if (typeof ResizeObserver !== 'undefined') {
        // eslint-disable-next-line
        console.error('Existing ResizeObserver is about to be overridden');
      }
      beforeEach(() => {
        element = {
          getBoundingClientRect: sandbox.stub(),
        };

        RO = sandbox.stub();
        RO_ = {
          observe: sandbox.stub(),
          unobserve: sandbox.stub(),
          disconnect: sandbox.stub(),
        };
        RO.returns(RO_);

        global.ResizeObserver = RO;
        c = {
          context: {
            element,
          },
        };
        initiate(c);
      });
      afterEach(() => {
        teardown(c);
        global.ResizeObserver = originalRO;
      });

      it('should return rect', () => {
        let r;
        element.getBoundingClientRect.returns({ left: 1, top: 2, width: 3, height: 4 });
        c.fn = () => {
          [r] = useRect();
        };

        run(c);
        expect(r).to.eql({ left: 1, top: 2, width: 3, height: 4 });
      });

      it('should observe changes', () => {
        element.getBoundingClientRect.returns({ left: 1, top: 2, width: 3, height: 4 });
        c.fn = () => {
          useRect();
        };

        run(c);
        expect(RO_.observe).to.have.been.calledWithExactly(element);
        teardown(c);
        expect(RO_.unobserve).to.have.been.calledWithExactly(element);
        expect(RO_.disconnect).to.have.been.calledWithExactly(element);
      });

      it('should update rect when size changes ', async () => {
        let r;
        element.getBoundingClientRect.returns({ left: 1, top: 2, width: 3, height: 4 });
        c.fn = () => {
          [r] = useRect();
        };

        run(c);
        const handler = RO.getCall(0).args[0];
        element.getBoundingClientRect.returns({ left: 1, top: 2, width: 3, height: 5 });
        handler();
        await frame();
        expect(r).to.eql({ left: 1, top: 2, width: 3, height: 5 });
      });
    });

    describe('without ResizeObserver', () => {
      const originalW = global.window;
      const originalRO = global.ResizeObserver;

      beforeEach(() => {
        global.ResizeObserver = undefined;
        global.window = {
          addEventListener: sandbox.stub(),
          removeEventListener: sandbox.stub(),
        };
        element = {
          getBoundingClientRect: sandbox.stub(),
        };

        c = {
          context: {
            element,
          },
        };
        initiate(c);
      });
      afterEach(() => {
        teardown(c);
        global.window = originalW;
        global.ResizeObserver = originalRO;
      });

      it('should observe changes', () => {
        element.getBoundingClientRect.returns({ left: 1, top: 2, width: 3, height: 4 });
        c.fn = () => {
          useRect();
        };

        run(c);
        const add = global.window.addEventListener.getCall(0).args;
        expect(add[0]).to.equal('resize');
        expect(add[1]).to.be.a('function');

        teardown(c);

        const remove = global.window.removeEventListener.getCall(0).args;
        expect(remove[0]).to.equal('resize');
        expect(remove[1]).to.equal(add[1]);
      });
    });
  });

  describe('composed hooks', () => {
    beforeEach(() => {
      c = {};
      c.context = {
        model: 'model',
        app: 'app',
        global: 'global',
        element: 'element',
        selections: 'selections',
        theme: 'theme',
        layout: 'layout',
      };
      c.env = {
        translator: 'translator',
      };
      initiate(c);
    });
    afterEach(() => {
      teardown(c);
    });

    it('useModel', () => {
      let value;
      c.fn = () => {
        value = useModel();
      };
      run(c);
      expect(value).to.equal('model');
    });
    it('useApp', () => {
      let value;
      c.fn = () => {
        value = useApp();
      };
      run(c);
      expect(value).to.equal('app');
    });
    it('useGlobal', () => {
      let value;
      c.fn = () => {
        value = useGlobal();
      };
      run(c);
      expect(value).to.equal('global');
    });
    it('useElement', () => {
      let value;
      c.fn = () => {
        value = useElement();
      };
      run(c);
      expect(value).to.equal('element');
    });
    it('useSelections', () => {
      let value;
      c.fn = () => {
        value = useSelections();
      };
      run(c);
      expect(value).to.equal('selections');
    });
    it('useTheme', () => {
      let value;
      c.fn = () => {
        value = useTheme();
      };
      run(c);
      expect(value).to.equal('theme');
    });
    it('useLayout', () => {
      let value;
      c.fn = () => {
        value = useLayout();
      };
      run(c);
      expect(value).to.equal('layout');
    });
    it('useLazyLayout', () => {
      let value;
      c.context.layout = { hc: 'h' };
      c.fn = () => {
        value = useLazyLayout();
      };
      run(c);
      c.context.layout = { hc: 'a', qSelectionInfo: { qInSelections: true } };
      run(c);
      expect(value).to.eql({ hc: 'h' });

      c.context.layout = { hc: 'a' };
      run(c);
      expect(value).to.eql({ hc: 'a' });
    });
    it('useTranslator', () => {
      let value;
      c.fn = () => {
        value = useTranslator();
      };
      run(c);
      expect(value).to.equal('translator');
    });
    it('onTakeSnapshot', () => {
      const spy = sandbox.spy();
      c.fn = () => {
        onTakeSnapshot(spy);
      };
      run(c);
      c.__hooks.snaps[0].fn();
      expect(spy.callCount).to.equal(1);
    });
  });
});
