import React from 'react';
import { create, act } from 'react-test-renderer';
import getStyledComponents /* , { classes } */ from '../styled-components';

describe('styled-components', () => {
  let renderer;
  let render;

  beforeAll(async () => {
    const { StyledFixedSizeList /* , StyledFixedSizeGrid */ } = getStyledComponents();
    render = async () => {
      await act(async () => {
        renderer = create(
          <StyledFixedSizeList itemSize={1} height={100}>
            <div>An item</div>
          </StyledFixedSizeList>
        );
      });
    };
  });

  it('should return a renderable base component for List and Grid', async () => {
    await render();
    const rootElement = renderer.root;
    expect(rootElement.props).toMatchSnapshot();
    expect(renderer.toTree()[0].props.cache.registered).toMatchSnapshot();
  });
});
