import listboxHandleDeactivate from '../listbox-handle-click-outside';
import * as _useClickOutside from '../../hooks/useClickOutside';

describe('handle click outside listbox', () => {
  let sandbox;
  let useClickOutside;
  let selections;

  before(() => {
    sandbox = sinon.createSandbox();
    useClickOutside = sandbox.stub(_useClickOutside, 'default');
    selections = {
      isModal: sandbox.stub(),
      confirm: sandbox.stub(),
    };
  });

  beforeEach(() => {
    selections.isModal.returns(true);
  });

  afterEach(() => {
    sandbox.reset();
  });

  after(() => {
    sandbox.restore();
  });

  describe('it should handle or not handle clicks outside the listbox element', () => {
    it('should confirm selections', () => {
      listboxHandleDeactivate({ element: 'element', selections, options: 'options' });
      expect(useClickOutside).calledOnce;
      const { elements, handler } = useClickOutside.args[0][0];
      expect(elements[0]).to.equal('element');
      expect(handler).to.be.a('function');
      handler({});
      expect(selections.confirm).calledOnce;
    });

    it('should not confirm selections when there are no selections to confirm', () => {
      selections.isModal.returns(false);
      listboxHandleDeactivate({ element: 'element', selections, options: 'options' });
      const { handler } = useClickOutside.args[0][0];
      handler({});
      expect(selections.confirm).not.called;
    });
  });
});
