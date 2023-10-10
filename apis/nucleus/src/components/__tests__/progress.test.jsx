import React from 'react';
import { create, act } from 'react-test-renderer';
import { CircularProgress } from '@mui/material';
import Progress from '../Progress';

describe('<Progress />', () => {
  let renderer;
  let render;
  beforeEach(() => {
    render = async (size) => {
      await act(async () => {
        renderer = create(<Progress size={size} />);
      });
    };
  });
  afterEach(() => {
    renderer.unmount();
  });
  test('should render default', () => {
    render();
    const types = renderer.root.findAllByType(CircularProgress);
    expect(types).toHaveLength(2);
    expect(types[0].props.size).toBe(32);
    expect(types[1].props.size).toBe(32);
  });
  test('should render small', () => {
    render('small');
    const types = renderer.root.findAllByType(CircularProgress);
    expect(types).toHaveLength(2);
    expect(types[0].props.size).toBe(16);
    expect(types[1].props.size).toBe(16);
  });
  test('should render large', () => {
    render('large');
    const types = renderer.root.findAllByType(CircularProgress);
    expect(types).toHaveLength(2);
    expect(types[0].props.size).toBe(64);
    expect(types[1].props.size).toBe(64);
  });
  test('should render xlarge', () => {
    render('xlarge');
    const types = renderer.root.findAllByType(CircularProgress);
    expect(types).toHaveLength(2);
    expect(types[0].props.size).toBe(128);
    expect(types[1].props.size).toBe(128);
  });
});
