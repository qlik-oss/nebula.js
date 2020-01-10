/* eslint no-underscore-dangle: 0 */
import {
  hook,
  initiate,
  teardown,
  render,
  runSnaps,
  useState,
  useEffect,
  useMemo,
  useModel,
  useApp,
  useGlobal,
  useElement,
  useSelections,
  useTheme,
  useLayout,
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
      global.requestAnimationFrame = setTimeout;
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
      render,
      teardown,
      runSnaps,
    });
  });

  it('should throw when hook is used outside method context', () => {
    const fn = () => useState(0);

    expect(fn).to.throw('Invalid nebula hook call. Hooks can only be called inside a supernova component.');
  });

  it('should throw when hooks are used outside top level of method context', async () => {
    c = {};
    initiate(c);
    const err = sandbox.stub(console, 'error');

    c.fn = () => {
      useEffect(() => {
        useState(0);
      });
    };

    render(c);
    await frame();
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

      render(c);
      expect(countValue).to.equal(7);
    });

    it('should initiate state with function', () => {
      let countValue;
      c.fn = () => {
        [countValue] = useState(() => 7);
      };

      render(c);
      expect(countValue).to.equal(7);
    });

    it('should update state value', async () => {
      let setter;
      let countValue;
      c.fn = () => {
        [countValue, setter] = useState(7);
      };

      render(c);
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

      await render(c);
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

      render(c);
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

      render(c);
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

      render(c);
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

      render(c);
      render(c);
      expect(value).to.equal(5);

      dep = 'b';
      render(c);
      expect(value).to.equal(6);
    });
  });

  describe('useEffect', () => {
    beforeEach(() => {
      c = {};
      initiate(c);
    });
    afterEach(() => {
      teardown(c);
    });

    it('without deps should run after every render', async () => {
      const spy = sandbox.spy();
      c.fn = () => {
        useEffect(spy);
      };

      await render(c);
      await render(c);
      await render(c);
      expect(spy.callCount).to.equal(3);
    });

    it('with empty deps should run after first render', async () => {
      const spy = sandbox.spy();
      c.fn = () => {
        useEffect(spy, []);
      };

      await render(c);
      await render(c);
      await render(c);
      expect(spy.callCount).to.equal(1);
    });

    it('with deps should run only when deps change', async () => {
      const spy = sandbox.spy();
      let dep1 = 'a';
      let dep2 = 0;
      c.fn = () => {
        useEffect(spy, [dep1, dep2]);
      };

      await render(c);

      dep1 = 'b';
      await render(c);
      expect(spy.callCount).to.equal(2);

      dep2 = false;
      await render(c);
      expect(spy.callCount).to.equal(3);
    });

    it('should cleanup previous', async () => {
      const spy = sandbox.spy();
      const f = () => {
        return spy;
      };
      c.fn = () => {
        useEffect(f);
      };

      await render(c); // initial render
      await render(c); // should cleanup previous effects on second render
      expect(spy.callCount).to.equal(1);
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
      render(c);
      expect(value).to.equal('model');
    });
    it('useApp', () => {
      let value;
      c.fn = () => {
        value = useApp();
      };
      render(c);
      expect(value).to.equal('app');
    });
    it('useGlobal', () => {
      let value;
      c.fn = () => {
        value = useGlobal();
      };
      render(c);
      expect(value).to.equal('global');
    });
    it('useElement', () => {
      let value;
      c.fn = () => {
        value = useElement();
      };
      render(c);
      expect(value).to.equal('element');
    });
    it('useSelections', () => {
      let value;
      c.fn = () => {
        value = useSelections();
      };
      render(c);
      expect(value).to.equal('selections');
    });
    it('useTheme', () => {
      let value;
      c.fn = () => {
        value = useTheme();
      };
      render(c);
      expect(value).to.equal('theme');
    });
    it('useLayout', () => {
      let value;
      c.fn = () => {
        value = useLayout();
      };
      render(c);
      expect(value).to.equal('layout');
    });
    it('useTranslator', () => {
      let value;
      c.fn = () => {
        value = useTranslator();
      };
      render(c);
      expect(value).to.equal('translator');
    });
    it('onTakeSnapshot', () => {
      const spy = sandbox.spy();
      c.fn = () => {
        onTakeSnapshot(spy);
      };
      render(c);
      c.__hooks.snaps[0].fn();
      expect(spy.callCount).to.equal(1);
    });
  });
});
