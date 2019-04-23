/* eslint object-property-newline:0 */
import React from 'react';
import renderer from 'react-test-renderer';

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
    const r = renderer.create(<AS api={api} />);

    expect(r.toJSON()).to.eql({
      type: 't', props: {}, children: [{
        type: 'g', props: {}, children: [{
          type: 'g', props: {}, children: [
            { type: 'b', props: { d: true }, children: ['Back'] },
            { type: 'b', props: { d: false }, children: ['Forward'] },
            { type: 'b', props: { d: false }, children: ['Clear'] },
          ],
        }, { type: 'g', props: {}, children: null }],
      }],
    });
  });
});
