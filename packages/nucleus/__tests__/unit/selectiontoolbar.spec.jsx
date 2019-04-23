import React from 'react';
import renderer from 'react-test-renderer';

import SelectionToolbar from '../../src/components/SelectionToolbar';

describe('<SelectionToolbar />', () => {
  describe('constructor', () => {
    let st;
    let component;
    beforeEach(() => {
      component = {
        selections: {
          canConfirm: () => 'confirmable',
          canCancel: () => 'cancelable',
          canClear: () => 'clearable',
          confirm: sinon.spy(),
          cancel: sinon.spy(),
          clear: sinon.spy(),
        },
      };
      const props = {
        model: {},
        sn: {
          component,
          selectionToolbar: { items: [{ key: 'mine', type: 'random' }] },
        },
      };
      const STItem = () => '';
      const styled = () => ['classes'];
      const [{ default: STB }] = aw.mock([
        ['**/SelectionToolbarItem.jsx', () => STItem],
        ['**/styled.js', () => styled],
      ], ['../../src/components/SelectionToolbar']);
      st = new STB(props);
    });

    it('should have a confirm item', () => {
      const item = st.state.items[3];
      expect(item).to.containSubset({
        key: 'confirm',
        type: 'fade-button',
        label: 'Confirm',
        icon: 'tick',
      });

      expect(item.enabled()).to.equal('confirmable');
      item.action();
      expect(component.selections.confirm).to.have.been.calledWithExactly(component);
    });

    it('should have a cancel item', () => {
      const item = st.state.items[2];
      expect(st.state.items[2]).to.containSubset({
        key: 'cancel',
        type: 'fade-button',
        label: 'Cancel',
        icon: 'close',
      });
      expect(item.enabled()).to.equal('cancelable');
      item.action();
      expect(component.selections.cancel).to.have.been.calledWithExactly(component);
    });

    it('should have a clear item', () => {
      const item = st.state.items[1];
      expect(st.state.items[1]).to.containSubset({
        key: 'clear',
        type: 'fade-button',
        label: 'Clear',
        icon: 'clear-selections',
      });
      expect(item.enabled()).to.equal('clearable');
      item.action();
      expect(component.selections.clear).to.have.been.calledWithExactly(component);
    });

    it('should have a custom item', () => {
      expect(st.state.items[0]).to.containSubset({
        key: 'mine',
        type: 'random',
      });
    });
  });

  it('getDerivedStateFromProps', () => {
    expect(SelectionToolbar.getDerivedStateFromProps({
      sn: {
        component: {
          selections: {
            canConfirm: () => 'cm',
            canCancel: () => 'cl',
            canClear: () => 'cr',
          },
        },
      },
    })).to.eql({
      confirmable: 'cm',
      cancelable: 'cl',
      clearable: 'cr',
    });
  });

  it('should render a toolbar', () => {
    const props = {
      model: {},
      sn: {
        component: {
          selections: {
            canConfirm() {},
            canCancel() {},
            canClear() {},
          },
        },
        selectionToolbar: { items: [{ key: 'mine' }] },
      },
    };
    const STItem = ({ isCustom }) => `-${isCustom}-`;
    const styled = () => ['a'];
    const [{ default: STB }] = aw.mock([
      ['**/SelectionToolbarItem.jsx', () => STItem],
      ['**/styled.js', () => styled],
    ], ['../../src/components/SelectionToolbar']);
    const c = renderer.create(<STB sn={props.sn} />);
    expect(c.toJSON()).to.eql({
      type: 'div',
      props: { className: 'a' },
      children: ['-true-', '-false-', '-false-', '-false-'],
    });
  });
});
