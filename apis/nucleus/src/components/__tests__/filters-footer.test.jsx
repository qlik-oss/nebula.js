import React from 'react';
import { create, act } from 'react-test-renderer';
import { Typography } from '@mui/material';
import * as generateSetExpression from '../../utils/generateSetExpression';
import FiltersFooter from '../FiltersFooter';

describe('<FiltersFooter />', () => {
  let renderer;
  let render;

  beforeEach(() => {
    jest.spyOn(generateSetExpression, 'generateFiltersLabels').mockReturnValue([
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
    expect(types).toHaveLength(10);
    expect(types[0].props.children).toBe('Object.FiltersApplied');
    expect(types[2].props.children).toBe('Alpha:');
    expect(types[4].props.children).toEqual([' ', 'B, C']);
    expect(types[6].props.children).toBe('Dim1:');
    expect(types[8].props.children).toEqual([' ', 'B']);
  });
});
