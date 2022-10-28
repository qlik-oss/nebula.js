import listboxHandleDeactivate from '../listbox-handle-click-outside';
import * as _identify from '../../assets/identify';
import * as _useClickOutside from '../../hooks/useClickOutside';

describe('handle click outside listbox', () => {
  let sandbox;
  let identify;
  let useClickOutside;
  let selections;

  before(() => {
    sandbox = sinon.createSandbox();
    identify = sandbox.stub(_identify, 'default');
    useClickOutside = sandbox.stub(_useClickOutside, 'default');
    selections = {
      isModal: sandbox.stub(),
      canConfirm: sandbox.stub(),
      confirm: sandbox.stub(),
      cancel: sandbox.stub(),
    };
  });

  beforeEach(() => {
    identify.returns({ hasExternalSelectionsApi: false });
    selections.isModal.returns(true);
    selections.canConfirm.returns(true);
  });

  afterEach(() => {
    sandbox.reset();
  });

  after(() => {
    sandbox.restore();
  });

  describe('it should handle or not handle clicks outside the listbox element', () => {
    it('check initial state and should confirm selections', () => {
      listboxHandleDeactivate({ element: 'element', selections, options: 'options' });
      expect(useClickOutside).calledOnce;
      const { elements, handler } = useClickOutside.args[0][0];
      expect(elements[0]).to.equal('element');
      expect(handler).to.be.a('function');
      handler({});
      expect(selections.confirm).calledOnce;
      expect(selections.cancel).not.called;
    });

    it('should cancel selections', () => {
      selections.canConfirm.returns(false);
      listboxHandleDeactivate({ element: 'element', selections, options: 'options' });
      const { handler } = useClickOutside.args[0][0];
      handler({});
      expect(selections.confirm).not.called;
      expect(selections.cancel).calledOnce;
    });

    it('should neither confirm nor cancel selections when there are not selections', () => {
      selections.isModal.returns(false);
      listboxHandleDeactivate({ element: 'element', selections, options: 'options' });
      const { handler } = useClickOutside.args[0][0];
      handler({});
      expect(selections.confirm).not.called;
      expect(selections.cancel).not.called;
    });
  });
});
