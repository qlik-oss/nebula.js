/* eslint no-underscore-dangle:0 */
const doMock = ({ glue = () => {}, getPatches = () => {}, objectConversion = {} } = {}) =>
  aw.mock(
    [
      ['**/components/glue.jsx', () => glue],
      ['**/utils/patcher.js', () => getPatches],
      ['@nebula.js/conversion', () => objectConversion],
    ],
    ['../viz.js']
  );

describe('viz', () => {
  let api;
  let sandbox;
  let glue;
  let create;
  let mounted;
  let unmount;
  let model;
  let getPatches;
  let cellRef;
  let setSnOptions;
  let setSnContext;
  let takeSnapshot;
  let exportImage;
  let objectConversion;
  before(() => {
    sandbox = sinon.createSandbox();
    unmount = sandbox.spy();
    setSnOptions = sandbox.spy();
    setSnContext = sandbox.spy();
    takeSnapshot = sandbox.spy();
    exportImage = sandbox.spy();
    cellRef = {
      current: {
        setSnOptions,
        setSnContext,
        takeSnapshot,
        exportImage,
      },
    };
    glue = sandbox.stub().returns([unmount, cellRef]);
    getPatches = sandbox.stub().returns(['patch']);
    objectConversion = { convertTo: sandbox.stub().returns('props') };
    [{ default: create }] = doMock({ glue, getPatches, objectConversion });
    model = {
      getEffectiveProperties: sandbox.stub().returns('old'),
      applyPatches: sandbox.spy(),
      on: sandbox.spy(),
      once: sandbox.spy(),
      emit: sandbox.spy(),
      setProperties: sandbox.spy(),
      id: 'uid',
    };
    api = create({
      model,
      halo: { public: {} },
    });
  });
  after(() => {
    sandbox.restore();
  });
  describe('public api', () => {
    it('should have an id', () => {
      expect(api.id).to.be.a('string');
    });

    it('should have a destroy method', () => {
      expect(api.destroy).to.be.a('function');
    });
  });
  describe('internal api', () => {
    it('should have an applyProperties method', () => {
      expect(api.__DO_NOT_USE__.applyProperties).to.be.a('function');
    });

    it('should have an exportImage method', () => {
      expect(api.__DO_NOT_USE__.exportImage).to.be.a('function');
    });

    it('should have an convertTo method', () => {
      expect(api.__DO_NOT_USE__.convertTo).to.be.a('function');
    });
  });

  describe('mounting', () => {
    it('should mount', async () => {
      mounted = api.__DO_NOT_USE__.mount('element');
      const { onMount } = glue.getCall(0).args[0];
      onMount();
      await mounted;
      expect(glue.callCount).to.equal(1);
    });
    it('should throw if already mounted', async () => {
      expect(api.__DO_NOT_USE__.mount.bind('element2')).to.throw();
    });
  });

  describe('applyProperties', () => {
    it('should apply patches when there are some', async () => {
      await api.__DO_NOT_USE__.applyProperties('new');
      expect(model.getEffectiveProperties.callCount).to.equal(1);
      expect(getPatches).to.have.been.calledWithExactly('/', 'new', 'old');
      expect(model.applyPatches).to.have.been.calledWithExactly(['patch'], true);
    });

    it('should not apply patches when there is no diff', async () => {
      model.getEffectiveProperties.resetHistory();
      await api.__DO_NOT_USE__.applyProperties('new');
      getPatches.returns([]);
      model.applyPatches.resetHistory();
      expect(model.getEffectiveProperties.callCount).to.equal(1);
      expect(getPatches).to.have.been.calledWithExactly('/', 'new', 'old');
      expect(model.applyPatches.callCount).to.equal(0);
    });
  });

  describe('destroy', () => {
    it('should cleanup', async () => {
      await api.destroy();
      expect(unmount).to.have.been.calledWithExactly();
    });
  });

  describe('options', () => {
    it('should set sn options', async () => {
      const opts = {};
      api.__DO_NOT_USE__.options(opts);
      await mounted;
      expect(cellRef.current.setSnOptions).to.have.been.calledWithExactly(opts);
    });
  });

  describe('snapshot', () => {
    it('should take a snapshot', async () => {
      api.__DO_NOT_USE__.takeSnapshot();
      expect(cellRef.current.takeSnapshot).to.have.been.calledWithExactly();
    });
  });

  describe('export', () => {
    it('should export image', async () => {
      api.__DO_NOT_USE__.exportImage();
      expect(cellRef.current.exportImage).to.have.been.calledWithExactly();
    });
  });

  describe('convertTo', () => {
    it('should run setProperties when forceUpdate = true', async () => {
      const props = await api.__DO_NOT_USE__.convertTo({ newType: 'type', forceUpdate: true });
      expect(objectConversion.convertTo.callCount).to.equal(1);
      expect(model.setProperties.callCount).to.equal(1);
      expect(props).to.equal('props');
    });

    it('should not run setProperties when forceUpdate = false', async () => {
      objectConversion.convertTo.resetHistory();
      model.setProperties.resetHistory();
      const props = await api.__DO_NOT_USE__.convertTo({ newType: 'type', forceUpdate: false });
      expect(objectConversion.convertTo.callCount).to.equal(1);
      expect(model.setProperties.callCount).to.equal(0);
      expect(props).to.equal('props');
    });
  });
});
