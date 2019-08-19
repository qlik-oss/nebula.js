
describe('ObjectAPI', () => {
  const doMock = ({
    createObjectSelectionAPI = () => ({}),
  } = {}) => aw.mock([
    ['**/selections/index.js', () => ({
      createObjectSelectionAPI,
    })],
  ], ['../../src/object/object-api']);

  it('setState should pass props to viz', () => {
    const [{ default: API }] = doMock();
    const viz = {
      setObjectProps: sinon.spy(),
    };
    const api = new API('model', 'context', viz);
    api.setState({
      sn: 'sn',
    });
    expect(viz.setObjectProps).to.have.been.calledWithExactly({
      layout: null,
      sn: 'sn',
      error: null,
    });
  });

  describe('updateModal', () => {
    let selections;
    let api;
    beforeEach(() => {
      const [{ default: API }] = doMock();
      selections = {
        setLayout: sinon.spy(),
        goModal: sinon.spy(),
        noModal: sinon.spy(),
        isModal: sinon.stub(),
      };
      api = new API({}, 'context', 'viz');
      api.state.sn = { component: { selections } };
    });

    it('should update layout when selection model has same id', () => {
      selections.id = 'unique';
      api.model.id = 'unique';
      api.updateModal('layout');
      expect(selections.setLayout).to.have.been.calledWithExactly('layout');
    });

    it('should go modal when in selections', () => {
      selections.id = 'unique';
      api.model.id = 'unique';
      api.updateModal({ qSelectionInfo: { qInSelections: true } });
      expect(selections.goModal).to.have.been.calledWithExactly('/qHyperCubeDef');
    });

    it('should exit modal when not in selections', () => {
      selections.id = 'unique';
      api.model.id = 'unique';
      selections.isModal.returns(true);
      api.updateModal({ qSelectionInfo: { qInSelections: false } });
      expect(selections.noModal).to.have.been.calledOnce;
    });
  });

  describe('setType', () => {
    let api;
    let context;
    beforeEach(() => {
      const [{ default: API }] = doMock();
      context = {
        nebbie: {
          types: {
            get: sinon.stub(),
          },
        },
        config: { env: { Promise: { resolve: sinon.spy() } } },
      };
      context.nebbie.types.get.withArgs({ name: 'my-type', version: 'my-sn-version' }).returns({ supernova: () => Promise.resolve('my-sn') });
      api = new API('model', context, 'viz');
      api.setSupernova = sinon.spy();
    });

    it('should load SN but not set when mismatched', async () => {
      api.state.layout = { visualization: 'my-other-type' };
      await api.setType('my-type', '', 'my-sn-version');
      expect(api.setSupernova).to.not.have.been.called;
      expect(context.config.env.Promise.resolve).to.have.been.calledOnce;
    });

    it('should load SN', async () => {
      api.state.layout = { visualization: 'my-type' };
      await api.setType('my-type', '', 'my-sn-version');
      expect(api.setSupernova).to.have.been.calledWithExactly('my-sn');
    });
  });

  describe('setLayout', () => {
    let getSupportedVersion;
    let api;
    beforeEach(() => {
      getSupportedVersion = sinon.stub();
      const [{ default: API }] = doMock();
      const context = {
        nebbie: {
          types: {
            getSupportedVersion,
          },
        },
      };
      api = new API('model', context);
    });

    it('should update modal', () => {
      api.updateModal = sinon.spy();
      api.setType = sinon.spy();
      api.setState = sinon.spy();
      api.setLayout('layout');
      expect(api.updateModal).to.have.been.calledWithExactly('layout');
    });

    it('should setState with error when supported version is not found', () => {
      api.updateModal = sinon.spy();
      api.setType = sinon.spy();
      api.setState = sinon.spy();
      api.setLayout({ visualization: 'viz', version: 'vers' });
      expect(api.setState).to.have.been.calledWithExactly({
        layout: { visualization: 'viz', version: 'vers' },
        error: { message: 'Could not find a version that supports current object version' },
        sn: null,
      });
    });

    it('should setType and reset sn when type has changed', () => {
      getSupportedVersion.returns('sn-version');
      api.updateModal = sinon.spy();
      api.setType = sinon.spy();
      api.setState = sinon.spy();
      api.setLayout({ visualization: 'viz', version: 'prop-version' });
      expect(api.setState).to.have.been.calledWithExactly({ layout: { visualization: 'viz', version: 'prop-version' }, error: null, sn: null });
      expect(api.setType).to.have.been.calledWithExactly('viz', 'prop-version', 'sn-version');
    });

    it('should only set state when type has not changed', () => {
      api.updateModal = sinon.spy();
      api.setType = sinon.spy();
      api.setState = sinon.spy();
      api.currentObjectType = 'viz';
      api.currentPropertyVersion = '1.0.0';
      api.setLayout({ visualization: 'viz', version: '1.0.0' });
      expect(api.setState).to.have.been.calledWithExactly({ layout: { visualization: 'viz', version: '1.0.0' }, error: null });
      expect(api.setType).to.not.have.been.called;
    });
  });

  describe('close', () => {
    it('should close viz', () => {
      const [{ default: API }] = doMock();
      const viz = { api: { close: sinon.spy() } };
      const api = new API('', '', viz);
      api.setState = sinon.spy();
      api.close();
      expect(viz.api.close).to.have.been.called;
      expect(api.setState).to.have.been.calledWithExactly({ layout: null, sn: null });
    });
  });
});
