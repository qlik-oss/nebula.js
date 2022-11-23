import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { create, act } from 'react-test-renderer';
import SvgIcon from '../SvgIcon';

describe('<SvgIcon />', () => {
  let renderer;
  let render;
  beforeEach(() => {
    render = async (props) => {
      await act(async () => {
        // eslint-disable-next-line react/jsx-props-no-spreading
        renderer = create(<SvgIcon {...props} />);
      });
    };
  });
  afterEach(() => {
    renderer.unmount();
  });
  test('should render default', async () => {
    await render();
    const i = renderer.root.findByType('i');

    expect(i.props.style).toEqual({
      fontSize: '16px',
      display: 'inline-block',
      fontStyle: 'normal',
      lineHeight: '0',
      textAlign: 'center',
      textTransform: 'none',
      verticalAlign: '-.125em',
      textRendering: 'optimizeLegibility',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    });

    const svg = renderer.root.findByType('svg');
    expect(svg.props).toEqual({
      xmlns: 'http://www.w3.org/2000/svg',
      width: '1em',
      height: '1em',
      viewBox: '0 0 16 16',
      fill: 'currentColor',
      children: [],
    });
  });

  test('should render custom', async () => {
    await render({
      style: {
        foo: 'bar',
      },
      viewBox: 'foo bar baz deluxe',
    });
    const i = renderer.root.findByType('i');

    expect(i.props.style).toEqual({
      fontSize: '16px',
      display: 'inline-block',
      fontStyle: 'normal',
      lineHeight: '0',
      textAlign: 'center',
      textTransform: 'none',
      verticalAlign: '-.125em',
      textRendering: 'optimizeLegibility',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      foo: 'bar',
    });

    const svg = renderer.root.findByType('svg');
    expect(svg.props).toEqual({
      xmlns: 'http://www.w3.org/2000/svg',
      width: '1em',
      height: '1em',
      viewBox: 'foo bar baz deluxe',
      fill: 'currentColor',
      children: [],
    });
  });

  test('should get font size', async () => {
    await render({
      size: 'large',
    });
    let i = renderer.root.findByType('i');

    expect(i.props.style).toEqual({
      fontSize: '20px',
      display: 'inline-block',
      fontStyle: 'normal',
      lineHeight: '0',
      textAlign: 'center',
      textTransform: 'none',
      verticalAlign: '-.125em',
      textRendering: 'optimizeLegibility',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    });
    await render({
      size: 'small',
    });
    i = renderer.root.findByType('i');

    expect(i.props.style).toEqual({
      fontSize: '12px',
      display: 'inline-block',
      fontStyle: 'normal',
      lineHeight: '0',
      textAlign: 'center',
      textTransform: 'none',
      verticalAlign: '-.125em',
      textRendering: 'optimizeLegibility',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    });
    await render({
      size: 'foo',
    });
    i = renderer.root.findByType('i');

    expect(i.props.style).toEqual({
      fontSize: '16px',
      display: 'inline-block',
      fontStyle: 'normal',
      lineHeight: '0',
      textAlign: 'center',
      textTransform: 'none',
      verticalAlign: '-.125em',
      textRendering: 'optimizeLegibility',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    });
  });

  test('should render shapes', async () => {
    await render({
      shapes: [
        {
          type: 'rect',
          attrs: { x: 0, y: 0, width: 100, height: 100 },
        },
        {
          type: 'rect',
          attrs: { x: 1, y: 0, width: 100, height: 100 },
        },
        {
          type: 'rect',
          attrs: { x: 2, y: 0, width: 100, height: 100 },
        },
      ],
    });
    const shapes = renderer.root.findAllByType('rect');
    expect(shapes.map((s) => s.props)).toEqual([
      { x: 0, y: 0, width: 100, height: 100 },
      { x: 1, y: 0, width: 100, height: 100 },
      { x: 2, y: 0, width: 100, height: 100 },
    ]);
  });
});
