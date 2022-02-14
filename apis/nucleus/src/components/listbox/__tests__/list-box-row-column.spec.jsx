import React from 'react';
import renderer from 'react-test-renderer';
import { Grid, Typography } from '@material-ui/core';
import Lock from '@nebula.js/ui/icons/lock';
import ListBoxCheckbox from '../ListBoxCheckbox';

const [{ default: ListBoxRowColumn }] = aw.mock(
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
      // require.resolve('../ListBoxCheckbox'),
      // () => React.createElement('div', { type: 'checkbox' }),
    ],
  ],
  ['../ListBoxRowColumn']
);

async function render(content) {
  let testRenderer;
  await renderer.act(async () => {
    testRenderer = renderer.create(content);
  });
  return testRenderer;
}

describe('<ListBoxRowColumn />', () => {
  describe('as row', () => {
    ['row', 'column'].forEach((rowCol) => {
      it('should have default props', async () => {
        const index = 0;
        const style = {};
        const data = {
          onMouseDown: sinon.spy(),
          onMouseUp: sinon.spy(),
          onMouseEnter: sinon.spy(),
          onClick: sinon.spy(),
          pages: [],
        };
        const testRenderer = await render(
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        );
        const testInstance = testRenderer.root;

        const type = testInstance.findByType(Grid);
        expect(type.props.container).to.equal(true);
        expect(type.props.spacing).to.equal(0);
        expect(type.props.style).to.deep.equal({});
        expect(type.props.role).to.equal(rowCol);
        expect(type.props.className).to.equal('');
        expect(type.props.onMouseDown.callCount).to.equal(0);
        expect(type.props.onMouseUp.callCount).to.equal(0);
        expect(type.props.onMouseEnter.callCount).to.equal(0);
        expect(type.props.onClick.callCount).to.equal(0);

        const types = testInstance.findAllByType(Typography);
        expect(types).to.have.length(1);
        expect(types[0].props.component).to.equal('span');
        expect(types[0].props.noWrap).to.equal(true);
        expect(types[0].props.children).to.equal('');

        const cbs = testInstance.findAllByType(ListBoxCheckbox);
        expect(cbs).to.have.length(0);
      });

      it('should render with checkboxes', async () => {
        const index = 0;
        const style = {};
        const data = {
          checkboxes: true,
          onMouseDown: sinon.spy(),
          onMouseUp: sinon.spy(),
          onMouseEnter: sinon.spy(),
          onClick: sinon.spy(),
          pages: [],
        };
        const testRenderer = await render(
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        );
        const testInstance = testRenderer.root;

        const type = testInstance.findByType(Grid);
        expect(type.props.container).to.equal(true);
        expect(type.props.spacing).to.equal(0);
        expect(type.props.style).to.deep.equal({});
        expect(type.props.role).to.equal(rowCol);
        expect(type.props.className).to.equal('');
        expect(type.props.onMouseDown.callCount).to.equal(0);
        expect(type.props.onMouseUp.callCount).to.equal(0);
        expect(type.props.onMouseEnter.callCount).to.equal(0);
        expect(type.props.onClick.callCount).to.equal(0);

        const types = testInstance.findAllByType(Typography);
        expect(types).to.have.length(2);
        expect(types[0].props.component).to.equal('span');
        expect(types[0].props.noWrap).not.to.equal(true);
        expect(types[0].props.component).to.equal('span');

        const cbs = testInstance.findAllByType(ListBoxCheckbox);
        expect(cbs).to.have.length(0);
      });
      it('should set locked state', async () => {
        const index = 0;
        const style = {};
        const data = {
          onMouseDown: sinon.spy(),
          onMouseUp: sinon.spy(),
          onMouseEnter: sinon.spy(),
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

        const testRenderer = await render(
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        );

        const testInstance = testRenderer.root;

        const type = testInstance.findByType(Lock);
        expect(type.props.size).to.equal('small');
      });
      it('should set selected', async () => {
        const index = 0;
        const style = {};
        const data = {
          onMouseDown: sinon.spy(),
          onMouseUp: sinon.spy(),
          onMouseEnter: sinon.spy(),
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
        const testRenderer = await render(
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        );
        const testInstance = testRenderer.root;
        const type = testInstance.findByType(Grid);
        expect(type.props.className).to.equal('selected');
      });
      it('should set alternative', async () => {
        const index = 0;
        const style = {};
        const data = {
          onMouseDown: sinon.spy(),
          onMouseUp: sinon.spy(),
          onMouseEnter: sinon.spy(),
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
        const testRenderer = await render(
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        );
        const testInstance = testRenderer.root;
        const type = testInstance.findByType(Grid);
        expect(type.props.className).to.equal('alternative');
      });
      it('should set excluded - qState X', async () => {
        const index = 0;
        const style = {};
        const data = {
          onMouseDown: sinon.spy(),
          onMouseUp: sinon.spy(),
          onMouseEnter: sinon.spy(),
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
        const testRenderer = await render(
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        );
        const testInstance = testRenderer.root;
        const type = testInstance.findByType(Grid);
        expect(type.props.className).to.equal('excluded');
      });
      it('should set excluded - qState XS', async () => {
        const index = 0;
        const style = {};
        const data = {
          onMouseDown: sinon.spy(),
          onMouseUp: sinon.spy(),
          onMouseEnter: sinon.spy(),
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
        const testRenderer = await render(
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        );
        const testInstance = testRenderer.root;
        const type = testInstance.findByType(Grid);
        expect(type.props.className).to.equal('excluded');
      });
      it('should set excluded - qState XL', async () => {
        const index = 0;
        const style = {};
        const data = {
          onMouseDown: sinon.spy(),
          onMouseUp: sinon.spy(),
          onMouseEnter: sinon.spy(),
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
        const testRenderer = await render(
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        );
        const testInstance = testRenderer.root;
        const type = testInstance.findByType(Grid);
        expect(type.props.className).to.equal('excluded');
      });
      it('should highlight ranges', async () => {
        const index = 0;
        const style = {};
        const data = {
          onMouseDown: sinon.spy(),
          onMouseUp: sinon.spy(),
          onMouseEnter: sinon.spy(),
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
        const testRenderer = await render(
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        );
        const testInstance = testRenderer.root;
        const types = testInstance.findAllByType(Typography);
        expect(types[0].props.children).to.equal('nebula.js');
        expect(types[0].props.className).to.equal('highlighted');
        expect(types[1].props.children).to.equal(' ftw');
      });
      it('should highlight ranges', async () => {
        const index = 0;
        const style = {};
        const data = {
          onMouseDown: sinon.spy(),
          onMouseUp: sinon.spy(),
          onMouseEnter: sinon.spy(),
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
        const testRenderer = await render(
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        );
        const testInstance = testRenderer.root;
        const types = testInstance.findAllByType(Typography);
        expect(types[0].props.children).to.equal('nebula.js ');
        expect(types[1].props.children).to.equal('ftw');
        expect(types[1].props.className).to.equal('highlighted');
      });
      it('should highlight ranges', async () => {
        const index = 0;
        const style = {};
        const data = {
          onMouseDown: sinon.spy(),
          onMouseUp: sinon.spy(),
          onMouseEnter: sinon.spy(),
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
        const testRenderer = await render(
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        );
        const testInstance = testRenderer.root;
        const types = testInstance.findAllByType(Typography);
        expect(types[0].props.children).to.equal('nebula.js ftw ');
        expect(types[1].props.children).to.equal('yeah');
        expect(types[1].props.className).to.equal('highlighted');
        expect(types[2].props.children).to.equal(' buddy');
      });
    });
  });
});
