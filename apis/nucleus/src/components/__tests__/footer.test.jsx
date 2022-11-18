import React from 'react';
import { create, act } from 'react-test-renderer';
import { Typography } from '@mui/material';
import Footer from '../Footer';

describe('<Footer />', () => {
  let renderer;
  let render;
  beforeEach(() => {
    render = async (layout) => {
      await act(async () => {
        renderer = create(<Footer layout={layout} />);
      });
    };
  });
  afterEach(() => {
    renderer.unmount();
  });
  it('should render default', async () => {
    await render();
    expect(renderer.root.props.layout).toBe(undefined);
  });
  it('should render', async () => {
    await render({ showTitles: true, footnote: 'foo' });
    const types = renderer.root.findAllByType(Typography);
    expect(types.length).toBe(1);
    expect(types[0].props.children).toBe('foo');
  });
});
