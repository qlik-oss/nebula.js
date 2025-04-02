import React from 'react';
import { create, act } from 'react-test-renderer';
import { Typography } from '@mui/material';
import Footer from '../Footer';
import * as generateSetExpression from '../../utils/generateSetExpression';
import * as FiltersFooter from '../FiltersFooter';

describe('<Footer />', () => {
  let renderer;
  let render;
  let FiltersFootnote;
  beforeEach(() => {
    jest.spyOn(generateSetExpression, 'generateFiltersString').mockReturnValue('filters string');
    FiltersFootnote = jest.spyOn(FiltersFooter, 'default').mockReturnValue('FiltersFooter');
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
  it('should render footnote when has footnote', async () => {
    await render({ showTitles: true, footnote: 'foo' });
    const types = renderer.root.findAllByType(Typography);
    expect(types).toHaveLength(1);
    expect(types[0].props.children).toBe('foo');
  });

  it('should render filters footnote when has filters and no footnote', async () => {
    jest.mock('../FiltersFooter', () => ({
      FiltersFooter: jest.fn(() => <div>Filters footNote</div>),
    }));
    await render({ showTitles: true, footnote: '', filters: ['A'], qHyperCube: { qMeasureInfo: [{ cId: 'chart' }] } });
    const types = renderer.root.findAllByType(FiltersFootnote);
    expect(types).toHaveLength(1);
  });
});
