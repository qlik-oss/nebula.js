import React from 'react';
import renderer from 'react-test-renderer';
import { Grid, Typography } from '@mui/material';
import Lock from '@nebula.js/ui/icons/lock';
import { createTheme, ThemeProvider } from '@nebula.js/ui/theme';
import ListBoxColumn from '../ListBoxColumn';

const getRenderSetup = ({ theme, index, style, data }) => (
  <ThemeProvider theme={theme}>
    <ListBoxColumn index={index} style={style} data={data} />
  </ThemeProvider>
);

describe('<ListBoxColumn />', () => {
  it('should have default props', () => {
    const index = 0;
    const style = {};
    const data = {
      onClick: sinon.spy(),
      pages: [],
    };
    const theme = createTheme('dark');
    const testRenderer = renderer.create(getRenderSetup({ theme, index, style, data }));
    const testInstance = testRenderer.root;

    const type = testInstance.findByType(Grid);
    expect(type.props.container).to.equal(true);
    expect(type.props.spacing).to.equal(0);
    expect(type.props.style).to.deep.equal({});
    expect(type.props.role).to.equal('row');
    expect(type.props.onClick.callCount).to.equal(0);

    const types = testInstance.findAllByType(Typography);
    expect(types).to.have.length(1);
    expect(types[0].props.component).to.equal('span');
    expect(types[0].props.noWrap).to.equal(true);
    expect(types[0].props.children).to.equal('');
  });
  it('should set locked state', () => {
    const index = 0;
    const style = {};
    const data = {
      onClick: sinon.spy(),
      pages: [
        {
          qArea: {
            qLeft: 0,
            qTop: 0,
            qWidth: 0,
            qHeight: 100,
          },
          qMatrix: [
            [
              {
                qState: 'L',
              },
            ],
          ],
        },
      ],
    };
    const theme = createTheme('dark');
    const testRenderer = renderer.create(getRenderSetup({ theme, index, style, data }));
    const testInstance = testRenderer.root;

    const type = testInstance.findByType(Lock);
    expect(type.props.size).to.equal('small');
  });
  it('should set selected', () => {
    const index = 0;
    const style = {};
    const data = {
      onClick: sinon.spy(),
      pages: [
        {
          qArea: {
            qLeft: 0,
            qTop: 0,
            qWidth: 0,
            qHeight: 100,
          },
          qMatrix: [
            [
              {
                qState: 'L',
              },
            ],
          ],
        },
      ],
    };
    const theme = createTheme('dark');
    const testRenderer = renderer.create(getRenderSetup({ theme, index, style, data }));
    const testInstance = testRenderer.root;
    const type = testInstance.findByType(Grid);
    expect(type.props.sx.background).to.equal(theme.palette.selected.main);
  });
  it('should set alternative', () => {
    const index = 0;
    const style = {};
    const data = {
      onClick: sinon.spy(),
      pages: [
        {
          qArea: {
            qLeft: 0,
            qTop: 0,
            qWidth: 0,
            qHeight: 100,
          },
          qMatrix: [
            [
              {
                qState: 'A',
              },
            ],
          ],
        },
      ],
    };
    const theme = createTheme('dark');
    const testRenderer = renderer.create(getRenderSetup({ theme, index, style, data }));
    const testInstance = testRenderer.root;
    const type = testInstance.findByType(Grid);
    expect(type.props.sx.background).to.equal(theme.palette.selected.alternative);
  });
  it('should set excluded - qState X', () => {
    const index = 0;
    const style = {};
    const data = {
      onClick: sinon.spy(),
      pages: [
        {
          qArea: {
            qLeft: 0,
            qTop: 0,
            qWidth: 0,
            qHeight: 100,
          },
          qMatrix: [
            [
              {
                qState: 'X',
              },
            ],
          ],
        },
      ],
    };
    const theme = createTheme('dark');
    const testRenderer = renderer.create(getRenderSetup({ theme, index, style, data }));
    const testInstance = testRenderer.root;
    const type = testInstance.findByType(Grid);
    expect(type.props.sx.background).to.equal(theme.palette.selected.excluded);
  });
  it('should set excluded - qState XS', () => {
    const index = 0;
    const style = {};
    const data = {
      onClick: sinon.spy(),
      pages: [
        {
          qArea: {
            qLeft: 0,
            qTop: 0,
            qWidth: 0,
            qHeight: 100,
          },
          qMatrix: [
            [
              {
                qState: 'XS',
              },
            ],
          ],
        },
      ],
    };
    const theme = createTheme('dark');
    const testRenderer = renderer.create(getRenderSetup({ theme, index, style, data }));
    const testInstance = testRenderer.root;
    const type = testInstance.findByType(Grid);
    expect(type.props.sx.background).to.equal(theme.palette.selected.excluded);
  });
  it('should set excluded - qState XL', () => {
    const index = 0;
    const style = {};
    const data = {
      onClick: sinon.spy(),
      pages: [
        {
          qArea: {
            qLeft: 0,
            qTop: 0,
            qWidth: 0,
            qHeight: 100,
          },
          qMatrix: [
            [
              {
                qState: 'XL',
              },
            ],
          ],
        },
      ],
    };
    const theme = createTheme('dark');
    const testRenderer = renderer.create(getRenderSetup({ theme, index, style, data }));
    const testInstance = testRenderer.root;
    const type = testInstance.findByType(Grid);
    expect(type.props.sx.background).to.equal(theme.palette.selected.excluded);
  });
  it('should highlight ranges', () => {
    const index = 0;
    const style = {};
    const data = {
      onClick: sinon.spy(),
      pages: [
        {
          qArea: {
            qLeft: 0,
            qTop: 0,
            qWidth: 0,
            qHeight: 100,
          },
          qMatrix: [
            [
              {
                qState: '',
                qText: 'nebula.js ftw',
                qHighlightRanges: {
                  qRanges: [{ qCharPos: 0, qCharCount: 9 }],
                },
              },
            ],
          ],
        },
      ],
    };
    const theme = createTheme('dark');
    const testRenderer = renderer.create(getRenderSetup({ theme, index, style, data }));
    const testInstance = testRenderer.root;
    const types = testInstance.findAllByType(Typography);
    expect(types[0].props.children).to.equal('nebula.js');
    expect(types[0].props.sx.backgroundColor).to.equal('#FFC72A');
    expect(types[1].props.children).to.equal(' ftw');
  });
  it('should highlight ranges', () => {
    const index = 0;
    const style = {};
    const data = {
      onClick: sinon.spy(),
      pages: [
        {
          qArea: {
            qLeft: 0,
            qTop: 0,
            qWidth: 0,
            qHeight: 100,
          },
          qMatrix: [
            [
              {
                qState: '',
                qText: 'nebula.js ftw',
                qHighlightRanges: {
                  qRanges: [{ qCharPos: 10, qCharCount: 3 }],
                },
              },
            ],
          ],
        },
      ],
    };
    const theme = createTheme('dark');
    const testRenderer = renderer.create(getRenderSetup({ theme, index, style, data }));
    const testInstance = testRenderer.root;
    const types = testInstance.findAllByType(Typography);
    expect(types[0].props.children).to.equal('nebula.js ');
    expect(types[1].props.children).to.equal('ftw');
    expect(types[1].props.sx.backgroundColor).to.equal('#FFC72A');
  });
  it('should highlight ranges', () => {
    const index = 0;
    const style = {};
    const data = {
      onClick: sinon.spy(),
      pages: [
        {
          qArea: {
            qLeft: 0,
            qTop: 0,
            qWidth: 0,
            qHeight: 100,
          },
          qMatrix: [
            [
              {
                qState: '',
                qText: 'nebula.js ftw yeah buddy',
                qHighlightRanges: {
                  qRanges: [{ qCharPos: 14, qCharCount: 4 }],
                },
              },
            ],
          ],
        },
      ],
    };
    const theme = createTheme('dark');
    const testRenderer = renderer.create(getRenderSetup({ theme, index, style, data }));
    const testInstance = testRenderer.root;
    const types = testInstance.findAllByType(Typography);
    expect(types[0].props.children).to.equal('nebula.js ftw ');
    expect(types[1].props.children).to.equal('yeah');
    expect(types[1].props.sx.backgroundColor).to.equal('#FFC72A');
    expect(types[2].props.children).to.equal(' buddy');
  });
});
