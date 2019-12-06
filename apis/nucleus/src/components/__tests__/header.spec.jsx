import React from 'react';
import { create, act } from 'react-test-renderer';
import { Typography } from '@material-ui/core';

const SelectionToolbar = () => 'selectiontoolbar';

const [{ default: Header }] = aw.mock(
  [[require.resolve('../SelectionToolbar'), () => SelectionToolbar]],
  ['../Header']
);

describe('<Header />', () => {
  let sandbox;
  let renderer;
  let render;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    render = async (layout, sn) => {
      await act(async () => {
        renderer = create(<Header layout={layout} sn={sn} />);
      });
    };
  });
  afterEach(() => {
    sandbox.restore();
    renderer.unmount();
  });
  it('should render default', async () => {
    await render();
    const types = renderer.root.findAllByType(Typography);
    expect(types).to.have.length(0);
  });
  it('should render title', async () => {
    await render({ showTitles: true, title: 'foo' });
    const types = renderer.root.findAllByType(Typography);
    expect(types).to.have.length(1);
    expect(types[0].props.children).to.equal('foo');
  });
  it('should render subtitle', async () => {
    await render({ showTitles: true, subtitle: 'bar' });
    const types = renderer.root.findAllByType(Typography);
    expect(types).to.have.length(1);
    expect(types[0].props.children).to.equal('bar');
  });
  it('should render selection toolbar', async () => {
    await render({ qSelectionInfo: { qInSelections: true } }, { component: {}, selectionToolbar: {} });
    const types = renderer.root.findAllByType(SelectionToolbar);
    expect(types).to.have.length(1);
  });
});
