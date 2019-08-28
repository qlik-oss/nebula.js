import React from 'react';
import renderer from 'react-test-renderer';

describe('<SelectionToolbar />', () => {
  describe('state', () => {
    let items;
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
      const LocaleContext = React.createContext();
      const [{ default: STB }] = aw.mock(
        [['**/SelectionToolbarItem.jsx', () => STItem], ['**/LocaleContext.js', () => LocaleContext]],
        ['../../src/components/SelectionToolbar']
      );

      const translator = {
        get: sinon.stub(),
      };

      translator.get.withArgs('Selection.Confirm').returns('localized confirm');
      translator.get.withArgs('Selection.Cancel').returns('localized cancel');
      translator.get.withArgs('Selection.Clear').returns('localized clear');

      const c = renderer.create(
        <LocaleContext.Provider value={translator}>
          <STB api={props.sn.component.selections} items={props.sn.selectionToolbar.items} />
        </LocaleContext.Provider>
      );

      items = c.root.findAllByType(STItem);
    });

    it('should have a confirm item', () => {
      const { item } = items[3].props;
      expect(item).to.containSubset({
        key: 'confirm',
        type: 'icon-button',
        label: 'localized confirm',
        icon: 'tick',
      });

      expect(item.enabled()).to.equal('confirmable');
      item.action();
      expect(component.selections.confirm).to.have.been.calledWithExactly();
    });

    it('should have a cancel item', () => {
      const { item } = items[2].props;
      expect(item).to.containSubset({
        key: 'cancel',
        type: 'icon-button',
        label: 'localized cancel',
        icon: 'close',
      });
      expect(item.enabled()).to.equal('cancelable');
      item.action();
      expect(component.selections.cancel).to.have.been.calledWithExactly();
    });

    it('should have a clear item', () => {
      const { item } = items[1].props;
      expect(item).to.containSubset({
        key: 'clear',
        type: 'icon-button',
        label: 'localized clear',
        icon: 'clear-selections',
      });
      expect(item.enabled()).to.equal('clearable');
      item.action();
      expect(component.selections.clear).to.have.been.calledWithExactly();
    });

    it('should have a custom item', () => {
      const { item } = items[0].props;
      expect(item).to.containSubset({
        key: 'mine',
        type: 'random',
      });
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
    const LocaleContext = React.createContext();
    const [{ default: STB }] = aw.mock(
      [['**/SelectionToolbarItem.jsx', () => STItem], ['**/LocaleContext.js', () => LocaleContext]],
      ['../../src/components/SelectionToolbar']
    );

    const translator = {
      get: sinon.stub(),
    };

    const c = renderer.create(
      <LocaleContext.Provider value={translator}>
        <STB api={props.sn.component.selections} items={props.sn.selectionToolbar.items} />
      </LocaleContext.Provider>
    );

    expect(c.toJSON()).to.eql({
      type: 'div',
      props: {},
      children: ['-true-', '-false-', '-false-', '-false-'],
    });
  });
});
