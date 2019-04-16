import preact from 'preact';
import render from 'preact-render-to-string';

import { AppSelections } from '../../src/components/AppSelections';

describe('<AppSelections />', () => {
  let api;
  beforeEach(() => {
    api = {
      canGoForward: () => 'canGoForward',
      canGoBack: () => 'canGoBack',
      canClear: () => 'canClear',
      back: sinon.spy(),
      forward: sinon.spy(),
      clear: sinon.spy(),
      on: sinon.spy(),
      removeListener: sinon.spy(),
    };
  });
  describe('constructor', () => {
    it('should initiate state', () => {
      const sel = new AppSelections({ api });
      expect(sel.state).to.eql({
        back: 'canGoBack',
        forward: 'canGoForward',
        clear: 'canClear',
      });
    });
  });

  describe('didMount', () => {
    it('should listen to api changes', () => {
      const sel = new AppSelections({ api });
      sel.componentDidMount();
      expect(api.on).to.have.been.calledWithExactly('changed', sel.apiChangeHandler);
    });
  });

  describe('willUnmount', () => {
    it('should stop listening to api changes', () => {
      const sel = new AppSelections({ api });
      sel.componentWillUnmount();
      expect(api.removeListener).to.have.been.calledWithExactly('changed', sel.apiChangeHandler);
    });
  });

  it('should render a toolbar', () => {
    api.canGoBack = () => false;
    const Button = ({ className, disabled, children }) => <b c={className} d={disabled}>{children}</b>;
    const Icon = ({ name }) => `i:${name}`;
    const [{ AppSelections: AS }] = aw.mock([
      ['**/Button.jsx', () => Button],
      ['**/Icon.jsx', () => Icon],
    ], ['../../src/components/AppSelections']);
    const html = render.render(<AS api={api} />);
    expect(html).to.equal(`
      <div class="nebula-toolbar">
        <div class="nebula-selections-nav">
          <b c="lui-fade-button" d>i:selections-back</b>
          <b c="lui-fade-button">i:selections-forward</b>
          <b c="lui-fade-button">i:clear-selections</b>
        </div>
      </div>`.replace(/\n(\s+)/g, ''));
  });
});
