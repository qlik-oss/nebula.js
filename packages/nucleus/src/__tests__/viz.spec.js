describe('viz', () => {
  const doMock = ({
    boot = () => {},
  } = {}) => aw.mock([
    ['**/components/boot.jsx', () => boot],
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
});
