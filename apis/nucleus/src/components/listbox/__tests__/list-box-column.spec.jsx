import React from 'react';
import renderer from 'react-test-renderer';
import { Grid, Typography } from '@material-ui/core';
import Lock from '@nebula.js/ui/icons/lock';

const [{ default: ListBoxColumn }] = aw.mock(
  [
    [
      require.resolve('@nebula.js/ui/theme'),
      () => ({
        makeStyles: () => () => ({
          S: 'selected',
          A: 'alternative',
          X: 'excluded',
          highlighted: 'highlighted',
        }),
      }),
    ],
  ],
  ['../ListBoxRow']
);

describe('<ListBoxColumn />', () => {
  it('should have default props', () => {
    const index = 0;
    const style = {};
    const data = {
      onClick: sinon.spy(),
      pages: [],
    };
    const testRenderer = renderer.create(<ListBoxColumn index={index} style={style} data={data} />);
    const testInstance = testRenderer.root;

    const type = testInstance.findByType(Grid);
    expect(type.props.container).to.equal(true);
    expect(type.props.spacing).to.equal(0);
    expect(type.props.style).to.deep.equal({});
    expect(type.props.role).to.equal('row');
    expect(type.props.className).to.equal('');
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
    const testRenderer = renderer.create(<ListBoxColumn index={index} style={style} data={data} />);
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
    const testRenderer = renderer.create(<ListBoxColumn index={index} style={style} data={data} />);
    const testInstance = testRenderer.root;
    const type = testInstance.findByType(Grid);
    expect(type.props.className).to.equal('selected');
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
    const testRenderer = renderer.create(<ListBoxColumn index={index} style={style} data={data} />);
    const testInstance = testRenderer.root;
    const type = testInstance.findByType(Grid);
    expect(type.props.className).to.equal('alternative');
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
    const testRenderer = renderer.create(<ListBoxColumn index={index} style={style} data={data} />);
    const testInstance = testRenderer.root;
    const type = testInstance.findByType(Grid);
    expect(type.props.className).to.equal('excluded');
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
    const testRenderer = renderer.create(<ListBoxColumn index={index} style={style} data={data} />);
    const testInstance = testRenderer.root;
    const type = testInstance.findByType(Grid);
    expect(type.props.className).to.equal('excluded');
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
    const testRenderer = renderer.create(<ListBoxColumn index={index} style={style} data={data} />);
    const testInstance = testRenderer.root;
    const type = testInstance.findByType(Grid);
    expect(type.props.className).to.equal('excluded');
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
    const testRenderer = renderer.create(<ListBoxColumn index={index} style={style} data={data} />);
    const testInstance = testRenderer.root;
    const types = testInstance.findAllByType(Typography);
    expect(types[0].props.children).to.equal('nebula.js');
    expect(types[0].props.className).to.equal('highlighted');
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
    const testRenderer = renderer.create(<ListBoxColumn index={index} style={style} data={data} />);
    const testInstance = testRenderer.root;
    const types = testInstance.findAllByType(Typography);
    expect(types[0].props.children).to.equal('nebula.js ');
    expect(types[1].props.children).to.equal('ftw');
    expect(types[1].props.className).to.equal('highlighted');
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
    const testRenderer = renderer.create(<ListBoxColumn index={index} style={style} data={data} />);
    const testInstance = testRenderer.root;
    const types = testInstance.findAllByType(Typography);
    expect(types[0].props.children).to.equal('nebula.js ftw ');
    expect(types[1].props.children).to.equal('yeah');
    expect(types[1].props.className).to.equal('highlighted');
    expect(types[2].props.children).to.equal(' buddy');
  });
});
