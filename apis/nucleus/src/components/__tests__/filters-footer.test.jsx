import React from 'react';
import { create, act } from 'react-test-renderer';
import { Typography } from '@mui/material';
import * as generateFiltersInfo from '../../utils/generateFiltersInfo';
import FiltersFooter from '../FiltersFooter';

describe('<FiltersFooter />', () => {
  let renderer;
  let render;

  beforeEach(() => {
    jest.spyOn(generateFiltersInfo, 'generateFiltersLabels').mockReturnValue([
      {
        field: 'Alpha',
        label: 'B, C',
      },
      {
        field: 'Dim1',
        label: 'B',
      },
    ]);
    render = async ({ layout, footerStyle, translator }) => {
      await act(async () => {
        renderer = create(<FiltersFooter layout={layout} footerStyle={footerStyle} translator={translator} />);
      });
    };
  });
  afterEach(() => {
    renderer.unmount();
  });

  it('should render filters footnote', async () => {
    const translator = { get: (s) => s };
    const layout = {
      filters: [
        {
          type: 'values',
          field: 'Alpha',
          options: {
            values: ['B', 'C'],
          },
        },
        {
          type: 'values',
          field: 'Dim1',
          options: {
            values: ['B'],
          },
        },
      ],
    };
    const footerStyle = { backgroundColor: 'red', color: 'blue' };
    await render({ layout, footerStyle, translator });
    const types = renderer.root.findAllByType(Typography);
    expect(types).toHaveLength(5);
    expect(types[0].props.children.map((child) => (typeof child === 'string' ? child.trim() : child))).toEqual([
      'Object.FiltersApplied',
      '',
    ]);
    expect(types[1].props.children).toBe('Alpha:');
    expect(types[2].props.children.map((child) => (typeof child === 'string' ? child.trim() : child))).toEqual([
      '',
      'B, C',
      '',
    ]);
    expect(types[3].props.children).toBe('Dim1:');
    expect(types[4].props.children.map((child) => (typeof child === 'string' ? child.trim() : child))).toEqual([
      '',
      'B',
      '',
    ]);
  });
});
