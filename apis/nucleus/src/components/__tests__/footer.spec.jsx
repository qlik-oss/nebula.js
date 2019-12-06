import React from 'react';
import { create, act } from 'react-test-renderer';
import { Typography } from '@material-ui/core';

const [{ default: Footer }] = aw.mock([], ['../Footer']);

describe('<Footer />', () => {
  let sandbox;
  let renderer;
  let render;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    render = async layout => {
      await act(async () => {
        renderer = create(<Footer layout={layout} />);
      });
    };
  });
  afterEach(() => {
    sandbox.restore();
    renderer.unmount();
  });
  it('should render default', async () => {
    await render();
    expect(renderer.root.props.layout).to.be.an('undefined');
  });
  it('should render', async () => {
    await render({ showTitles: true, footnote: 'foo' });
    const types = renderer.root.findAllByType(Typography);
    expect(types).to.have.length(1);
    expect(types[0].props.children).to.equal('foo');
  });
});
