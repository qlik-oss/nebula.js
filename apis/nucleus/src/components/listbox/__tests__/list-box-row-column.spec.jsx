import React from 'react';
import renderer from 'react-test-renderer';
import { Grid, Typography } from '@material-ui/core';
import Lock from '@nebula.js/ui/icons/lock';
import ListBoxCheckbox from '../ListBoxCheckbox';
import * as keyboardNavigation from '../listbox-keyboard-navigation';
import ListBoxRadioButton from '../ListBoxRadioButton';

const [{ default: ListBoxRowColumn }] = aw.mock(
  [
    [
      require.resolve('@nebula.js/ui/theme'),
      () => ({
        makeStyles: () => () => ({
          S: 'selected',
          A: 'alternative',
          X: 'excluded',
          XS: 'excluded-selected',
          highlighted: 'highlighted',
          cell: 'cell',
        }),
      }),
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
  let sandbox;
  let actions;
  let getFieldKeyboardNavigation;
  let keyboard;

  before(() => {
    global.document = {};
    sandbox = sinon.createSandbox();
    getFieldKeyboardNavigation = sandbox.stub(keyboardNavigation, 'getFieldKeyboardNavigation');
    actions = 'actions';
  });

  beforeEach(() => {
    getFieldKeyboardNavigation.returns(() => 'handle-key-down-callback');
    keyboard = { active: false, enabled: true };
  });

  afterEach(() => {
    sandbox.reset();
  });

  after(() => {
    sandbox.restore();
  });

  describe('as row', () => {
    const rowCol = 'row';

    it('should have default props', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: sandbox.spy(),
        onMouseUp: sandbox.spy(),
        onMouseEnter: sandbox.spy(),
        onClick: sandbox.spy(),
        keyboard,
        pages: [],
        actions,
      };
      expect(getFieldKeyboardNavigation).not.called;
      const testRenderer = await render(
        <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
      );
      const testInstance = testRenderer.root;

      const type = testInstance.findByType(Grid);
      expect(type.props.container).to.equal(true);
      expect(type.props.spacing).to.equal(0);
      expect(type.props.style).to.deep.equal({});
      expect(type.props.role).to.equal(rowCol);
      expect(type.props.onKeyDown).to.be.a('function');
      expect(type.props.onKeyDown()).to.equal('handle-key-down-callback');
      expect(type.props.onMouseDown.callCount).to.equal(0);
      expect(type.props.onMouseUp.callCount).to.equal(0);
      expect(type.props.onMouseEnter.callCount).to.equal(0);
      expect(typeof type.props.onContextMenu).to.equal('function');
      const preventDefault = sandbox.stub();
      type.props.onContextMenu({ preventDefault });
      expect(preventDefault.callCount).to.equal(1);
      expect(type.props.tabIndex).to.equal(-1);
      expect(type.props.onClick.callCount).to.equal(0);

      const types = testInstance.findAllByType(Typography);
      expect(types).to.have.length(1);
      expect(types[0].props.component).to.equal('span');
      expect(types[0].props.children.type).to.equal('span');

      const cbs = testInstance.findAllByType(ListBoxCheckbox);
      expect(cbs).to.have.length(0);
      await testRenderer.unmount();

      expect(getFieldKeyboardNavigation).calledOnce.calledWith('actions');
    });

    it('should have css class `value`', async () => {
      const index = 0;
      const style = {};

      keyboard.enabled = false;

      const data = {
        onMouseDown: sandbox.spy(),
        onMouseUp: sandbox.spy(),
        onMouseEnter: sandbox.spy(),
        onClick: sandbox.spy(),
        keyboard,
        pages: [],
        actions,
      };
      const testRenderer = await render(
        <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
      );
      const testInstance = testRenderer.root;

      const type = testInstance.findByType(Grid);
      const { className } = type.props;
      expect(className).to.be.a('string');
      expect(className.split(' ')).to.include('value');
      expect(type.props.tabIndex).to.equal(0);
      await testRenderer.unmount();
    });

    it('should render with checkboxes', async () => {
      const index = 0;
      const style = {};

      keyboard.active = true;

      const data = {
        checkboxes: true,
        onMouseDown: sandbox.spy(),
        onMouseUp: sandbox.spy(),
        onMouseEnter: sandbox.spy(),
        onClick: sandbox.spy(),
        keyboard,
        pages: [],
        actions,
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
      expect(type.props.onMouseDown.callCount).to.equal(0);
      expect(type.props.onMouseUp.callCount).to.equal(0);
      expect(type.props.onMouseEnter.callCount).to.equal(0);
      expect(type.props.onKeyDown()).to.equal('handle-key-down-callback');
      expect(type.props.onClick.callCount).to.equal(0);
      expect(type.props.tabIndex).to.equal(0);

      const preventDefault = sandbox.stub();
      type.props.onContextMenu({ preventDefault });
      expect(preventDefault.callCount).to.equal(1);
      expect(type.props.onClick.callCount).to.equal(1);

      const types = testInstance.findAllByType(Typography);
      expect(types).to.have.length(2);
      expect(types[0].props.component).to.equal('span');
      expect(types[0].props.component).to.equal('span');

      const cbs = testInstance.findAllByType(ListBoxCheckbox);
      expect(cbs).to.have.length(0);
      await testRenderer.unmount();
    });

    it('should set locked state', async () => {
      const index = 0;
      const style = {};
      const data = {
        isLocked: true,
        onMouseDown: sandbox.spy(),
        onMouseUp: sandbox.spy(),
        onMouseEnter: sandbox.spy(),
        onClick: sandbox.spy(),
        keyboard,
        actions,
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
      await testRenderer.unmount();
    });

    it('should set selected', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: sandbox.spy(),
        onMouseUp: sandbox.spy(),
        onMouseEnter: sandbox.spy(),
        onClick: sandbox.spy(),
        keyboard,
        actions,
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
      expect(type.props.className).to.include('selected');
      await testRenderer.unmount();
    });

    it('should set alternative', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: sandbox.spy(),
        onMouseUp: sandbox.spy(),
        onMouseEnter: sandbox.spy(),
        onClick: sandbox.spy(),
        keyboard,
        actions,
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
      expect(type.props.className).to.include('alternative');
      await testRenderer.unmount();
    });

    it('should not add alternative class for A when showGray is false', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: sandbox.spy(),
        onMouseUp: sandbox.spy(),
        onMouseEnter: sandbox.spy(),
        onClick: sandbox.spy(),
        keyboard,
        actions,
        showGray: false,
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
      expect(type.props.className).not.to.include('alternative');
      await testRenderer.unmount();
    });

    it('should set excluded - qState X', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: sandbox.spy(),
        onMouseUp: sandbox.spy(),
        onMouseEnter: sandbox.spy(),
        onClick: sandbox.spy(),
        keyboard,
        actions,
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
      expect(type.props.className).to.include('excluded');
      await testRenderer.unmount();
    });

    it('should not add excluded class for qState X when showGray is false', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: sandbox.spy(),
        onMouseUp: sandbox.spy(),
        onMouseEnter: sandbox.spy(),
        onClick: sandbox.spy(),
        keyboard,
        actions,
        showGray: false,
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
      expect(type.props.className).not.to.include('excluded');
      await testRenderer.unmount();
    });

    it('should set excluded-selected - qState XS', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: sandbox.spy(),
        onMouseUp: sandbox.spy(),
        onMouseEnter: sandbox.spy(),
        onClick: sandbox.spy(),
        keyboard,
        actions,
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
      expect(type.props.className).to.include('excluded-selected');
      await testRenderer.unmount();
    });

    it('should not add excluded-selected class when showGray is false', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: sandbox.spy(),
        onMouseUp: sandbox.spy(),
        onMouseEnter: sandbox.spy(),
        onClick: sandbox.spy(),
        keyboard,
        actions,
        showGray: false,
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
      expect(type.props.className).not.to.include('excluded-selected');
      await testRenderer.unmount();
    });

    it('should set excluded - qState XL', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: sandbox.spy(),
        onMouseUp: sandbox.spy(),
        onMouseEnter: sandbox.spy(),
        onClick: sandbox.spy(),
        keyboard,
        actions,
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
      expect(type.props.className).to.include('excluded');
      await testRenderer.unmount();
    });

    it('should highlight ranges', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: sandbox.spy(),
        onMouseUp: sandbox.spy(),
        onMouseEnter: sandbox.spy(),
        onClick: sandbox.spy(),
        keyboard,
        actions,
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
      expect(types[0].props.children.props.children).to.equal('nebula.js');
      expect(types[0].props.className).to.include('highlighted');
      expect(types[1].props.children.props.children).to.equal(' ftw');
      await testRenderer.unmount();
    });

    it('should highlight ranges', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: sandbox.spy(),
        onMouseUp: sandbox.spy(),
        onMouseEnter: sandbox.spy(),
        onClick: sandbox.spy(),
        keyboard,
        actions,
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
      expect(types[0].props.children.props.children).to.equal('nebula.js ');
      expect(types[1].props.children.props.children).to.equal('ftw');
      expect(types[1].props.className).to.include('highlighted');
      const hits = testInstance.findAllByProps({ className: 'highlighted' });
      expect(hits).to.have.length(2);
      await testRenderer.unmount();
    });

    it('should highlight ranges', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: sandbox.spy(),
        onMouseUp: sandbox.spy(),
        onMouseEnter: sandbox.spy(),
        onClick: sandbox.spy(),
        keyboard,
        actions,
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
      expect(types[0].props.children.props.children).to.equal('nebula.js ftw ');
      expect(types[1].props.children.props.children).to.equal('yeah');
      expect(types[1].props.className).to.include('highlighted');
      expect(types[2].props.children.props.children).to.equal(' buddy');
      await testRenderer.unmount();
    });

    it('should show frequency when enabled', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: sandbox.spy(),
        onMouseUp: sandbox.spy(),
        onMouseEnter: sandbox.spy(),
        onClick: sandbox.spy(),
        keyboard,
        actions,
        frequencyMode: 'value',
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
                  qState: 'S',
                  qFrequency: '123',
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
      expect(types[1].props.children).to.equal('123');
    });

    it('should highlight ranges for checkboxes', async () => {
      const index = 0;
      const style = {};
      const data = {
        keyboard,
        checkboxes: true,
        actions,
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
      const cells = testInstance.findAllByProps({ className: 'highlighted' });
      expect(cells).to.have.length(2);
      const types = testInstance.findAllByType(Typography);
      expect(types[1].props.children.props.children).to.equal('nebula.js ftw ');
      expect(types[2].props.children.props.children).to.equal('yeah');
      expect(types[2].props.className).to.include('highlighted');
      expect(types[3].props.children.props.children).to.equal(' buddy');
      await testRenderer.unmount();
    });
  });

  describe('as column', () => {
    const rowCol = 'column';

    it('should have default props', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: sandbox.spy(),
        onMouseUp: sandbox.spy(),
        onMouseEnter: sandbox.spy(),
        onClick: sandbox.spy(),
        keyboard,
        pages: [],
        actions,
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
      expect(type.props.onMouseDown.callCount).to.equal(0);
      expect(type.props.onMouseUp.callCount).to.equal(0);
      expect(type.props.onMouseEnter.callCount).to.equal(0);
      expect(type.props.onClick.callCount).to.equal(0);

      const types = testInstance.findAllByType(Typography);
      expect(types).to.have.length(1);
      expect(types[0].props.component).to.equal('span');
      expect(types[0].props.children.props.children).to.equal('');

      const cbs = testInstance.findAllByType(ListBoxCheckbox);
      expect(cbs).to.have.length(0);
      await testRenderer.unmount();
    });

    it('should have css class `value`', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: sandbox.spy(),
        onMouseUp: sandbox.spy(),
        onMouseEnter: sandbox.spy(),
        onClick: sandbox.spy(),
        keyboard,
        pages: [],
        actions,
      };
      const testRenderer = await render(
        <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
      );
      const testInstance = testRenderer.root;

      const type = testInstance.findByType(Grid);
      const { className } = type.props;
      expect(className).to.be.a('string');
      expect(className.split(' ')).to.include('value');
      await testRenderer.unmount();
    });

    it('should render radio button when isSingleSelect is true', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: sandbox.spy(),
        onMouseUp: sandbox.spy(),
        onMouseEnter: sandbox.spy(),
        onClick: sandbox.spy(),
        keyboard,
        actions,
        isSingleSelect: true,
        checkboxes: true,
        frequencyMode: 'value',
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
                  qState: 'S',
                  qFrequency: '123',
                  qText: 'nebula',
                  qElemNumber: 0,
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
      const types = testInstance.findAllByType(ListBoxRadioButton);
      expect(types).to.have.length(1);
    });
  });
});
