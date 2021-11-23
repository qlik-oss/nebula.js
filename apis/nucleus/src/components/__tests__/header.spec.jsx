import React from 'react';
import { create, act } from 'react-test-renderer';
import { makeStyles, Grid, Typography } from '@material-ui/core';

const Popover = (props) => props.children;
const ActionsToolbar = () => 'ActionsToolbar';

describe('<Header />', () => {
  let sandbox;
  let renderer;
  let render;
  let Header;
  let rect;
  before(() => {
    sandbox = sinon.createSandbox();
    rect = { width: 900 };
    [{ default: Header }] = aw.mock(
      [
        [require.resolve('../ActionsToolbar'), () => ActionsToolbar],
        [require.resolve('../../hooks/useRect'), () => () => [() => {}, rect]],
        [
          require.resolve('@material-ui/core'),
          () => ({
            makeStyles,
            Grid,
            Typography,
            Popover,
          }),
        ],
      ],
      ['../Header']
    );
  });
  beforeEach(() => {
    render = async (layout = {}, sn = { component: {}, selectionToolbar: {} }, focusHandler = {}) => {
      await act(async () => {
        renderer = create(<Header layout={layout} sn={sn} focusHandler={focusHandler} />);
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
    const types = renderer.root.findAllByType(ActionsToolbar);
    expect(types).to.have.length(1);
  });
});
