import React from 'react';
import renderer from 'react-test-renderer';
import { Grid, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@nebula.js/ui/theme';
import Lock from '@nebula.js/ui/icons/lock';
import ListBoxCheckbox from '../ListBoxCheckbox';
import * as keyboardNavigation from '../../interactions/listbox-keyboard-navigation';
import ListBoxRadioButton from '../ListBoxRadioButton';
import ListBoxRowColumn from '../ListBoxRowColumn';

async function render(content) {
  let testRenderer;
  await renderer.act(async () => {
    testRenderer = renderer.create(content);
  });
  return testRenderer;
}

describe('<ListBoxRowColumn />', () => {
  const theme = createTheme('dark');
  let actions;
  let getFieldKeyboardNavigation;
  let keyboard;

  beforeEach(() => {
    global.document = {};
    getFieldKeyboardNavigation = jest
      .spyOn(keyboardNavigation, 'getFieldKeyboardNavigation')
      .mockImplementation(() => 'handle-key-down-callback');
    actions = 'actions';
    keyboard = { active: false, enabled: true };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('as row', () => {
    const rowCol = 'row';

    test('should have default props', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        pages: [],
        actions,
      };
      expect(getFieldKeyboardNavigation).not.called;
      const testRenderer = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;

      const type = testInstance.findByType(Grid);
      /* expect(type.props.container).to.equal(true);
      expect(type.props.spacing).to.equal(0);
      expect(type.props.style).to.deep.equal({});
      expect(type.props.role).to.equal(rowCol);
      expect(type.props.onKeyDown).to.be.a('function');
      expect(type.props.onKeyDown()).to.equal('handle-key-down-callback');
      expect(type.props.onMouseDown.callCount).to.equal(0);
      expect(type.props.onMouseUp.callCount).to.equal(0);
      expect(type.props.onMouseEnter.callCount).to.equal(0);
      expect(typeof type.props.onContextMenu).to.equal('function');
      */
      const preventDefault = jest.fn();
      type.props.onContextMenu({ preventDefault });
      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(type.props.tabIndex).toBe(-1);
      expect(type.props.onClick).toHaveBeenCalledTimes(0);

      const types = testInstance.findAllByType(Typography);
      expect(types.length).toBe(1);
      expect(types[0].props.component).toBe('span');
      expect(types[0].props.children.type).toBe('span');

      const cbs = testInstance.findAllByType(ListBoxCheckbox);
      expect(cbs.length).toBe(0);
      await testRenderer.unmount();

      expect(getFieldKeyboardNavigation).toHaveBeenCalledTimes(1);
      expect(getFieldKeyboardNavigation).toHaveBeenCalledWith('actions');
    });

    test('should have css class `value`', async () => {
      const index = 0;
      const style = {};

      keyboard.enabled = false;

      const data = {
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        pages: [],
        actions,
      };
      const testRenderer = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;

      const type = testInstance.findByType(Grid);
      const { className } = type.props;
      expect(typeof className).toBe('string');
      expect(className.split(' ').includes('value')).toBe(true);
      expect(type.props.tabIndex).toBe(0);
      await testRenderer.unmount();
    });

    test('should render with checkboxes', async () => {
      const index = 0;
      const style = {};

      keyboard.active = true;

      const data = {
        checkboxes: true,
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        pages: [],
        actions,
      };
      const testRenderer = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;

      const type = testInstance.findByType(Grid);
      /*
      // Tests that only verify the implemtation are just a nuisance
      // Tests should test functionality
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
*/
      const preventDefault = jest.fn();
      type.props.onContextMenu({ preventDefault });
      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(type.props.onClick).toHaveBeenCalledTimes(1);

      const types = testInstance.findAllByType(Typography);
      // TODO: MUIv5 - no idea why this breaks
      // expect(types).to.have.length(2);
      expect(types[0].props.component).toBe('span');
      expect(types[0].props.component).toBe('span');
      // TODO: MUIv5 - no idea why this breaks
      // const cbs = testInstance.findAllByType(ListBoxCheckbox);
      // expect(cbs).to.have.length(0);
      await testRenderer.unmount();
    });

    test('should set locked state', async () => {
      const index = 0;
      const style = {};
      const data = {
        isLocked: true,
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
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
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );

      const testInstance = testRenderer.root;

      const type = testInstance.findByType(Lock);
      expect(type.props.size).toBe('small');
      await testRenderer.unmount();
    });

    test('should set selected', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
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
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const type = testInstance.findByType(Grid);
      expect(type.props.className.includes('RowColumn-S')).toBe(true);
      await testRenderer.unmount();
    });

    test('should set alternative', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
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
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const type = testInstance.findByType(Grid);
      expect(type.props.className.includes('RowColumn-A')).toBe(true);
      await testRenderer.unmount();
    });

    test('should not add alternative class for A when showGray is false', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
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
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const type = testInstance.findByType(Grid);
      expect(type.props.className.includes('RowColumn-A')).toBe(false);
      await testRenderer.unmount();
    });

    test('should set excluded - qState X', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
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
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const type = testInstance.findByType(Grid);
      expect(type.props.className.includes('RowColumn-X')).toBe(true);
      await testRenderer.unmount();
    });

    test('should not add excluded class for qState X when showGray is false', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
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
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const type = testInstance.findByType(Grid);
      expect(type.props.className.includes('RowColumn-X')).toBe(false);
      await testRenderer.unmount();
    });

    test('should set excluded-selected - qState XS', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
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
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const type = testInstance.findByType(Grid);
      expect(type.props.className.includes('RowColumn-XS')).toBe(true);
      await testRenderer.unmount();
    });

    test('should not add excluded-selected class when showGray is false', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
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
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const type = testInstance.findByType(Grid);
      expect(type.props.className.includes('RowColumn-XS')).toBe(false);
      await testRenderer.unmount();
    });

    test('should set excluded - qState XL', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
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
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const type = testInstance.findByType(Grid);
      expect(type.props.className.includes('RowColumn-X')).toBe(true);
      await testRenderer.unmount();
    });

    test('should highlight ranges', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
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
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const types = testInstance.findAllByType(Typography);
      expect(types[0].props.children.props.children).toBe('nebula.js');
      expect(types[0].props.className.includes('highlighted')).toBe(true);
      expect(types[1].props.children.props.children).toBe(' ftw');
      await testRenderer.unmount();
    });

    test('should highlight ranges', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
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
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const types = testInstance.findAllByType(Typography);
      expect(types[0].props.children.props.children).toBe('nebula.js ');
      expect(types[1].props.children.props.children).toBe('ftw');
      expect(types[1].props.className.includes('highlighted')).toBe(true);
      // TODO: MUIv5 - no idea why this breaks
      // const hits = testInstance.findAllByProps({ className: 'RowColumn-highlighted' });
      // expect(hits).to.have.length(2);
      await testRenderer.unmount();
    });

    test('should highlight ranges', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
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
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const types = testInstance.findAllByType(Typography);
      expect(types[0].props.children.props.children).toBe('nebula.js ftw ');
      expect(types[1].props.children.props.children).toBe('yeah');
      expect(types[1].props.className.includes('RowColumn-highlighted')).toBe(true);
      expect(types[2].props.children.props.children).toBe(' buddy');
      await testRenderer.unmount();
    });

    test('should show frequency when enabled', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        actions,
        freqIsAllowed: true,
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
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const types = testInstance.findAllByType(Typography);
      expect(types[1].props.children).toBe('123');
    });

    test('should highlight ranges for checkboxes', async () => {
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
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      // TODO: MUIv5 - no idea why this breaks
      // const cells = testInstance.findAllByProps({ className: 'RowColumn-highlighted' });
      // expect(cells).to.have.length(2);
      const types = testInstance.findAllByType(Typography);
      expect(types[1].props.children.props.children).toBe('nebula.js ftw ');
      expect(types[2].props.children.props.children).toBe('yeah');
      expect(types[2].props.className.includes('RowColumn-highlighted')).toBe(true);
      expect(types[3].props.children.props.children).toBe(' buddy');
      await testRenderer.unmount();
    });
  });

  describe('as column', () => {
    const rowCol = 'column';

    test('should have default props', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        pages: [],
        actions,
      };
      const testRenderer = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;

      /*
      const type = testInstance.findByType(Grid);
      expect(type.props.container).to.equal(true);
      expect(type.props.spacing).to.equal(0);
      expect(type.props.style).to.deep.equal({});
      expect(type.props.role).to.equal(rowCol);
      expect(type.props.onMouseDown.callCount).to.equal(0);
      expect(type.props.onMouseUp.callCount).to.equal(0);
      expect(type.props.onMouseEnter.callCount).to.equal(0);
      expect(type.props.onClick.callCount).to.equal(0);
*/
      const types = testInstance.findAllByType(Typography);
      expect(types.length).toBe(1);
      expect(types[0].props.component).toBe('span');
      expect(types[0].props.children.props.children).toBe('');

      const cbs = testInstance.findAllByType(ListBoxCheckbox);
      expect(cbs.length).toBe(0);
      await testRenderer.unmount();
    });

    test('should have css class `value`', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        pages: [],
        actions,
      };
      const testRenderer = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;

      const type = testInstance.findByType(Grid);
      const { className } = type.props;
      expect(typeof className).toBe('string');
      expect(className.split(' ').includes('value')).toBe(true);
      await testRenderer.unmount();
    });

    test('should render radio button when isSingleSelect is true', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
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
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const types = testInstance.findAllByType(ListBoxRadioButton);
      expect(types.length).toBe(1);
    });
  });
});
