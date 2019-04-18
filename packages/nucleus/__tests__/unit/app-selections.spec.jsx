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
      layout: () => (null),
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
        items: [],
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
    const Button = ({ disabled, children }) => <b d={disabled}>{children}</b>;
    const Toolbar = ({ children }) => <t>{children}</t>;
    const Grid = ({ children }) => <g>{children}</g>;
    const [{ AppSelections: AS }] = aw.mock([
      ['**/SelectionsBack.jsx', () => () => 'Back'],
      ['**/SelectionsForward.jsx', () => () => 'Forward'],
      ['**/ClearSelections.jsx', () => () => 'Clear'],
      ['**/ButtonInline.jsx', () => Button],
      ['**/Toolbar.jsx', () => Toolbar],
      ['**/Grid.jsx', () => Grid],
      ['**/Text.jsx', () => Button],
    ], ['../../src/components/AppSelections']);
    const html = render.render(<AS api={api} />);
    expect(html).to.equal(`
    <t>
      <g>
        <g>
          <b d>Back</b>
          <b>Forward</b>
          <b>Clear</b>
        </g>
        <g></g>
      </g>
    </t>`.replace(/\n(\s+)/g, ''));
  });
});
