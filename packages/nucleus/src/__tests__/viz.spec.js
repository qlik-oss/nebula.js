describe('viz', () => {
  const doMock = ({
    boot = () => {},
    getter = () => {},
    getPatches = () => {},
  } = {}) => aw.mock([
    ['**/components/boot.jsx', () => boot],
    ['**/object/observer.js', () => ({ get: getter })],
    ['**/utils/patcher.js', () => getPatches],
  ], ['../viz.js']);

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
    it('should not mount when layout is not defined', () => {
      const boot = sinon.spy();
      const [{ default: create }] = doMock();
      const { api } = create({});
      api.mount('element');
      expect(boot.callCount).to.equal(0);
    });

    it('should mount when layout is valid', () => {
      const boot = sinon.stub().returns(Promise.resolve());
      const [{ default: create }] = doMock({ boot });
      const { api, setObjectProps } = create({});
      api.mount('element');
      expect(boot.callCount).to.equal(0);
      setObjectProps({
        layout: {},
      });
      expect(boot.callCount).to.equal(1);
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
