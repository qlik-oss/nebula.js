import React from 'react';
import { create, act } from 'react-test-renderer';
import { IconButton } from '@material-ui/core';
// const SelectionToolbarItem = () => 'selectiontoolbaritem';
const LocaleContext = React.createContext();

const [{ default: SelectionToolbarWithDefault }] = aw.mock(
  [
    // [require.resolve('../SelectionToolbarItem'), () => SelectionToolbarItem],
    [require.resolve('@nebula.js/ui/theme'), () => ({ makeStyles: () => () => ({ pallette: {} }) })],
    [require.resolve('../../contexts/LocaleContext'), () => LocaleContext],
  ],
  ['../SelectionToolbar']
);

describe('<SelectionToolbarWithDefault />', () => {
  let sandbox;
  let renderer;
  let render;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    render = async (layout, api, xItems, onCancel, onConfirm) => {
      await act(async () => {
        renderer = create(
          <LocaleContext.Provider value={{ get: s => s }}>
            <SelectionToolbarWithDefault
              layout={layout}
              api={api}
              xItems={xItems}
              onCancel={onCancel}
              onConfirm={onConfirm}
            />
          </LocaleContext.Provider>
        );
      });
    };
  });
  afterEach(() => {
    sandbox.restore();
    renderer.unmount();
  });
  it('should render default', async () => {
    const api = {
      canClear: sandbox.stub(),
      clear: sandbox.stub(),
      canCancel: sandbox.stub(),
      cancel: sandbox.stub(),
      canConfirm: sandbox.stub(),
      confirm: sandbox.stub(),
    };
    await render({}, api);
    expect(api.canClear.callCount).to.equal(1);
    expect(api.canCancel.callCount).to.equal(1);
    expect(api.canConfirm.callCount).to.equal(1);
    const types = renderer.root.findAllByType(IconButton);
    expect(types).to.have.length(3);
    types.forEach(t => {
      t.props.onClick();
    });
    expect(api.clear.callCount).to.equal(1);
    expect(api.cancel.callCount).to.equal(1);
    expect(api.confirm.callCount).to.equal(1);
  });
});
