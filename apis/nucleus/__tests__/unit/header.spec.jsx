/* eslint object-curly-newline: 0 */
/* eslint object-property-newline: 0 */

import React from 'react';
import renderer from 'react-test-renderer';

const mock = ({
  components = {
    Grid: ({ children }) => <g>{children}</g>,
    Typography: ({ children }) => <t>{children}</t>,
  },
  STB = () => <stb />,
} = {}) =>
  aw.mock(
    [
      [require.resolve('@material-ui/core'), () => components],
      ['**/SelectionToolbar.jsx', () => STB],
    ],
    ['../../src/components/Header']
  );

describe('<Header />', () => {
  it('should render a title', () => {
    const layout = { showTitles: true, title: 'title' };
    const [{ default: Header }] = mock();
    const tree = renderer.create(<Header layout={layout} />).toJSON();
    expect(tree).to.eql({
      type: 'g',
      props: {},
      children: [
        {
          type: 'g',
          props: {},
          children: [
            {
              type: 'g',
              props: {},
              children: [
                {
                  type: 't',
                  props: {},
                  children: ['title'],
                },
              ],
            },
          ],
        },
        { type: 'g', props: {}, children: null },
      ],
    });
  });

  it('should render a subtitle', () => {
    const layout = { showTitles: true, subtitle: 'sub' };
    const [{ default: Header }] = mock();
    const tree = renderer.create(<Header layout={layout} />).toJSON();
    expect(tree).to.eql({
      type: 'g',
      props: {},
      children: [
        {
          type: 'g',
          props: {},
          children: [
            {
              type: 'g',
              props: {},
              children: [
                {
                  type: 't',
                  props: {},
                  children: ['sub'],
                },
              ],
            },
          ],
        },
        { type: 'g', props: {}, children: null },
      ],
    });
  });

  it('should render selection actions', () => {
    const sn = { component: { selections: {} }, selectionToolbar: { items: [] } };
    const layout = { showTitles: false, qSelectionInfo: { qInSelections: true } };
    const [{ default: Header }] = mock();
    const tree = renderer.create(<Header layout={layout} sn={sn} />).toJSON();
    expect(tree).to.eql({
      type: 'g',
      props: {},
      children: [
        {
          type: 'g',
          props: {},
          children: [
            {
              type: 'g',
              props: {},
              children: null,
            },
          ],
        },
        {
          type: 'g',
          props: {},
          children: [
            {
              type: 'stb',
              props: {},
              children: null,
            },
          ],
        },
      ],
    });
  });
});
