import React from 'react';
import { create, act } from 'react-test-renderer';
import getStyledComponents /* , { classes } */ from '../styled-components';

describe('styled-components', () => {
  let renderer;
  let render;

  describe('StyledFixedSizeList', () => {
    beforeAll(async () => {
      const { StyledFixedSizeList } = getStyledComponents();
      render = async () => {
        await act(async () => {
          renderer = create(
            <StyledFixedSizeList itemHeight={1} height={100}>
              <div>An item</div>
            </StyledFixedSizeList>
          );
        });
      };
    });

    it('should return a renderable base component for List', async () => {
      await render();
      const rootElement = renderer.root;
      expect(rootElement.props).toMatchSnapshot();
      expect(renderer.toTree()[0].props.cache.registered).toMatchSnapshot();
    });
  });

  describe('StyledFixedSizeGrid', () => {
    beforeAll(async () => {
      const { StyledFixedSizeGrid } = getStyledComponents();
      render = async () => {
        await act(async () => {
          renderer = create(
            <StyledFixedSizeGrid itemHeight={1} height={100} width={150} columnWidth={50} rowHeight={10}>
              <div>An item</div>
            </StyledFixedSizeGrid>
          );
        });
      };
    });

    it('should return a renderable base component for Grid', async () => {
      await render();
      const rootElement = renderer.root;
      expect(rootElement.props).toMatchSnapshot();
      expect(renderer.toTree()[0].props.cache.registered).toMatchSnapshot();
    });
  });
});
