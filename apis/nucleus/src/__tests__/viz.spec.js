const flush = () => new Promise(r => setImmediate(r));

describe('viz', () => {
  const doMock = ({ boot = () => {}, getter = () => {}, getPatches = () => {} } = {}) =>
    aw.mock(
      [
        ['**/components/boot.jsx', () => boot],
        ['**/object/observer.js', () => ({ get: getter })],
        ['**/utils/patcher.js', () => getPatches],
      ],
      ['../viz.js']
    );

  describe('api', () => {
    let api;
    before(() => {
      const [{ default: create }] = doMock();

      const { api: foo } = create({
        model: 'a',
        config: {},
      });
      api = foo;
    });

    it('should have a reference to the model', () => {
      expect(api.model).to.equal('a');
    });

    it('should have a mount method', () => {
      expect(api.mount).to.be.a('function');
    });

    it('should have a setTemporaryProperties method', () => {
      expect(api.setTemporaryProperties).to.be.a('function');
    });
  });

  describe('mounting', () => {
    it('should not initiate mount when layout and sn are not defined', async () => {
      const boot = sinon.spy();
      const [{ default: create }] = doMock({ boot });
      const { api, setObjectProps } = create({});

      api.mount('element');

      setObjectProps();

      await flush();
      expect(boot.callCount).to.equal(0, 'invalid layout, invalid sn');
    });

    it('should initiate React mount when layout and supernova are valid', async () => {
      const boot = sinon.spy();
      const [{ default: create }] = doMock({ boot });
      const { api, setObjectProps } = create({});

      api.mount('element');

      setObjectProps({ layout: {} });
      await flush();
      expect(boot.callCount).to.equal(0, 'valid layout, invalid sn');

      setObjectProps({ layout: {}, sn: {} });
      await flush();
      expect(boot.callCount).to.equal(1, 'valid layout, invalid sn');
    });

    it('should resolve mount when React cell is ready', async () => {
      let cellIsReady;
      const boot = sinon.spy(({ onInitial }) => {
        cellIsReady = onInitial;
        return {};
      });
      const [{ default: create }] = doMock({ boot });
      const { api, setObjectProps } = create({});

      let mounted = false;

      api.mount('element').then(() => {
        mounted = true;
      });
      setObjectProps({ layout: {}, sn: {} });

      await flush();
      expect(mounted).to.equal(false, 'cell is not ready yet');

      cellIsReady();

      await flush();
      expect(mounted).to.equal(true, 'cell is ready');
    });
  });

  describe('setTemporaryProperties', () => {
    it('should apply patches when there are some', async () => {
      const getter = sinon.stub().returns(Promise.resolve('old'));
      const getPatches = sinon.stub().returns(['patch']);
      const [{ default: create }] = doMock({ getter, getPatches });
      const model = {
        applyPatches: sinon.spy(),
      };
      const { api } = create({
        model,
      });
      await api.setTemporaryProperties('new');
      expect(getter).to.have.been.calledWithExactly(model, 'effectiveProperties');
      expect(getPatches).to.have.been.calledWithExactly('/', 'new', 'old');
      expect(model.applyPatches).to.have.been.calledWithExactly(['patch'], true);
    });

    it('should not apply patches when there is no diff', async () => {
      const getter = sinon.stub().returns(Promise.resolve('old'));
      const getPatches = sinon.stub().returns([]);
      const [{ default: create }] = doMock({ getter, getPatches });
      const model = {
        applyPatches: sinon.spy(),
      };
      const { api } = create({
        model,
      });
      await api.setTemporaryProperties('new');
      expect(getter).to.have.been.calledWithExactly(model, 'effectiveProperties');
      expect(getPatches).to.have.been.calledWithExactly('/', 'new', 'old');
      expect(model.applyPatches.callCount).to.equal(0);
    });
  });
});
