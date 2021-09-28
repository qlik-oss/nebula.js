/* eslint object-property-newline:0 */
import React from 'react';
import renderer from 'react-test-renderer';

const mock = ({
  components = {
    Grid: ({ children }) => <g>{children}</g>,
  },
  theme = {
    createTheme: () => ({}),
    ThemeProvider: ({ children }) => <tp>{children}</tp>,
  },
  SelectedFields = () => <sf />,
  Nav = () => <nav />,
} = {}) =>
  aw.mock(
    [
      ['**/ui/components/index.js', () => components],
      ['**/ui/theme/index.js', () => theme],
      ['**/SelectedFields.jsx', () => SelectedFields],
      ['**/Nav.jsx', () => Nav],
    ],
    ['../AppSelections']
  );

describe('<AppSelections />', () => {
  let api;
  beforeEach(() => {
    api = {
      canGoForward: () => 'canGoForward',
      canGoBack: () => 'canGoBack',
      canClear: () => 'canClear',
      layout: () => null,
      back: sinon.spy(),
      forward: sinon.spy(),
      clear: sinon.spy(),
      on: sinon.spy(),
      removeListener: sinon.spy(),
    };
  });

  it.skip('should render a toolbar', () => {
    api.canGoBack = () => false;
    const [{ AppSelections: AS }] = mock();
    const r = renderer.create(<AS api={api} />);

    expect(r.toJSON()).to.eql({
      type: 'sp',
      props: {},
      children: [
        {
          type: 'tp',
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
                      type: 'nav',
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
                      type: 'sf',
                      props: {},
                      children: null,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  });
});
