import React, { act } from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
import { Typography } from '@mui/material';
import PinItem from '../PinItem';

describe('<PinItem />', () => {
  let renderer;

  afterEach(() => {
    if (renderer) {
      renderer.unmount();
    }
  });

  test('should render display name', () => {
    act(() => {
      renderer = ReactTestRenderer.create(<PinItem displayName="Product" />);
    });

    const output = renderer.toJSON();
    expect(JSON.stringify(output)).toContain('Product');
  });

  test('should render Typography component with correct styles', () => {
    act(() => {
      renderer = ReactTestRenderer.create(<PinItem displayName="Test Field" />);
    });

    const typography = renderer.root.findByType(Typography);
    expect(typography).toBeDefined();
    expect(typography.props.noWrap).toBe(true);
    expect(typography.props.style).toMatchObject({
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 600,
      marginTop: '8px',
    });
  });

  test('should render empty string when displayName is empty', () => {
    act(() => {
      renderer = ReactTestRenderer.create(<PinItem displayName="" />);
    });

    const typography = renderer.root.findByType(Typography);
    expect(typography.props.children).toBe('');
  });

  test('should handle undefined displayName', () => {
    act(() => {
      renderer = ReactTestRenderer.create(<PinItem displayName={undefined} />);
    });

    const typography = renderer.root.findByType(Typography);
    expect(typography.props.children).toBeUndefined();
  });
});
