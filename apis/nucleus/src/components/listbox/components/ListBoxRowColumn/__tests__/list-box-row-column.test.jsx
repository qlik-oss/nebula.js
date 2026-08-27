import React from 'react';
import renderer from 'react-test-renderer';
import { Grid, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@nebula.js/ui/theme';
import Lock from '@nebula.js/ui/icons/lock';
import * as rowsKeyboardNavigation from '../../../interactions/keyboard-navigation/keyboard-nav-rows';
import ListBoxCheckbox from '../components/ListBoxCheckbox';
import * as screenReaders from '../../screen-reader/value-label';
import ListBoxRadioButton from '../components/ListBoxRadioButton';
import Image from '../components/Image';
import ListBoxRowColumn from '..';

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
  let getRowsKeyboardNavigation;
  let keyboard;
  let defaultPages;
  let styles;

  beforeEach(() => {
    styles = {
      header: {},
      content: {},
      selections: {},
    };
    defaultPages = [
      {
        qArea: {
          qTop: 0,
          qHeight: 1,
        },
        qMatrix: [
          [
            {
              qState: 'A',
              qNum: 1.0,
              qText: '1.0',
            },
          ],
        ],
      },
    ];
    getRowsKeyboardNavigation = jest
      .spyOn(rowsKeyboardNavigation, 'default')
      .mockImplementation(() => 'handle-key-down-callback');
    actions = 'actions';
    keyboard = { innerTabStops: true };
    jest.spyOn(screenReaders, 'default').mockReturnValue('ariaLabel');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('as row', () => {
    const rowCol = 'row';

    test('should not render any row when there are no pages', async () => {
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
        dataOffset: 0,
        sizes: { itemPadding: 2 },
        translator: {
          get: jest.fn().mockImplementation((word) => word),
        },
        focusListItems: () => ({ first: false, last: false }),
      };
      expect(getRowsKeyboardNavigation).not.called;
      const testRenderer = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const grids = testInstance.findAllByType(Grid);
      expect(grids).toHaveLength(0);
    });

    test('should have default props', async () => {
      const index = 0;
      const style = {};
      const data = {
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        pages: defaultPages,
        actions,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
        styles,
        focusListItems: () => ({ first: false, last: false }),
      };
      expect(getRowsKeyboardNavigation).not.called;
      const testRenderer = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;

      const type = testInstance.findByType(Grid);
      const preventDefault = jest.fn();
      type.props.onContextMenu({ preventDefault });
      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(type.props.tabIndex).toBe(0);
      expect(type.props.onClick).toHaveBeenCalledTimes(0);

      const types = testInstance.findAllByType(Typography);
      expect(types).toHaveLength(1);
      expect(types[0].props.component).toBe('span');
      expect(types[0].props.children.type).toBe('span');

      const cbs = testInstance.findAllByType(ListBoxCheckbox);
      expect(cbs).toHaveLength(0);
      await testRenderer.unmount();

      expect(getRowsKeyboardNavigation.mock.calls.length).toBeGreaterThan(0);
      expect(getRowsKeyboardNavigation).toHaveBeenCalled();
    });

    test('should have css class `value`', async () => {
      const index = 0;
      const style = {};

      keyboard.innerTabStops = true;

      const data = {
        styles,
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        pages: defaultPages,
        actions,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
        focusListItems: () => ({ first: false, last: false }),
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

      keyboard.innerTabStops = true;

      const data = {
        styles,
        checkboxes: true,
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        pages: defaultPages,
        actions,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
        focusListItems: () => ({ first: false, last: false }),
      };
      const testRenderer = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;

      const type = testInstance.findByType(Grid);
      const preventDefault = jest.fn();
      type.props.onContextMenu({ preventDefault });
      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(type.props.onClick).toHaveBeenCalledTimes(0);

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
        styles,
        isLocked: true,
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        actions,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
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
        focusListItems: () => ({ first: false, last: false }),
      };

      const testRenderer = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} columnIndex={0} rowIndex={0} />
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
        styles,
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        actions,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
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
        focusListItems: () => ({ first: false, last: false }),
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
        styles,
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        actions,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
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
        focusListItems: () => ({ first: false, last: false }),
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
        styles,
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        actions,
        showGray: false,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
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
        focusListItems: () => ({ first: false, last: false }),
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
        styles,
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        actions,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
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
        focusListItems: () => ({ first: false, last: false }),
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
        styles,
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        actions,
        showGray: false,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
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
        focusListItems: () => ({ first: false, last: false }),
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
        styles,
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        actions,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
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
        focusListItems: () => ({ first: false, last: false }),
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
        styles,
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        actions,
        showGray: false,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
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
        focusListItems: () => ({ first: false, last: false }),
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
        styles,
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        actions,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
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
        focusListItems: () => ({ first: false, last: false }),
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
        styles,
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        actions,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
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
        focusListItems: () => ({ first: false, last: false }),
      };
      const testRenderer = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const types = testInstance.findAllByType(Typography);
      expect(types).toHaveLength(1);
      const spans = types[0].props.children.props.children;
      expect(spans).toHaveLength(2);
      expect(spans[0].props.children).toBe('nebula.js');
      expect(spans[0].props.className.includes('highlighted')).toBe(true);
      expect(spans[1].props.children).toBe(' ftw');
      await testRenderer.unmount();
    });

    test('should highlight ranges', async () => {
      const index = 0;
      const style = {};
      const data = {
        styles,
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        actions,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
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
        focusListItems: () => ({ first: false, last: false }),
      };
      const testRenderer = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const types = testInstance.findAllByType(Typography);
      expect(types).toHaveLength(1);
      const spans = types[0].props.children.props.children;
      expect(spans).toHaveLength(2);
      expect(spans[0].props.children).toBe('nebula.js ');
      expect(spans[1].props.children).toBe('ftw');
      expect(spans[1].props.className.includes('highlighted')).toBe(true);
      // TODO: MUIv5 - no idea why this breaks
      // const hits = testInstance.findAllByProps({ className: 'RowColumn-highlighted' });
      // expect(hits).to.have.length(2);
      await testRenderer.unmount();
    });

    test('should highlight ranges', async () => {
      const index = 0;
      const style = {};
      const data = {
        styles,
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        actions,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
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
        focusListItems: () => ({ first: false, last: false }),
      };
      const testRenderer = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const types = testInstance.findAllByType(Typography);
      expect(types).toHaveLength(1);
      const spans = types[0].props.children.props.children;
      expect(spans).toHaveLength(3);
      expect(spans[0].props.children).toBe('nebula.js ftw ');
      expect(spans[1].props.children).toBe('yeah');
      expect(spans[1].props.className.includes('RowColumn-highlighted')).toBe(true);
      expect(spans[2].props.children).toBe(' buddy');
      await testRenderer.unmount();
    });

    test('should show frequency when enabled', async () => {
      const index = 0;
      const style = {};
      const data = {
        styles,
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        actions,
        freqIsAllowed: true,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
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
        focusListItems: () => ({ first: false, last: false }),
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
        styles,
        keyboard,
        checkboxes: true,
        actions,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
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
        focusListItems: () => ({ first: false, last: false }),
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
      expect(types).toHaveLength(2);
      const spans = types[1].props.children.props.children;
      expect(spans).toHaveLength(3);
      expect(spans[0].props.children).toBe('nebula.js ftw ');
      expect(spans[1].props.children).toBe('yeah');
      expect(spans[1].props.className.includes('RowColumn-highlighted')).toBe(true);
      expect(spans[2].props.children).toBe(' buddy');
      await testRenderer.unmount();
    });
  });

  describe('as column', () => {
    const rowCol = 'column';

    test('should have default props', async () => {
      const index = 0;
      const style = {};
      const data = {
        styles,
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        pages: defaultPages,
        actions,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
        focusListItems: () => ({ first: false, last: false }),
      };
      const testRenderer = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const types = testInstance.findAllByType(Typography);
      expect(types).toHaveLength(1);
      expect(types[0].props.component).toBe('span');
      expect(types[0].props.children.props.children).toBe('1.0');

      const cbs = testInstance.findAllByType(ListBoxCheckbox);
      expect(cbs).toHaveLength(0);
      await testRenderer.unmount();
    });

    test('should have css class `value`', async () => {
      const index = 0;
      const style = {};
      const data = {
        styles,
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        pages: defaultPages,
        actions,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
        focusListItems: () => ({ first: false, last: false }),
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

    test('should get right text alignment', async () => {
      const index = 0;
      const style = {};
      const data = {
        styles,
        keyboard,
        textAlign: { align: 'right' },
        pages: defaultPages,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
        focusListItems: () => ({ first: false, last: false }),
      };
      const testRenderer = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const type = testInstance.findByType(Grid);
      expect(type.props.children[1].props.style.justifyContent).toEqual('right');
    });

    test('should get left text alignment', async () => {
      const index = 0;
      const style = {};
      const data = {
        styles,
        keyboard,
        textAlign: { align: 'left' },
        pages: defaultPages,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
        focusListItems: () => ({ first: false, last: false }),
      };
      const testRenderer = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const type = testInstance.findByType(Grid);
      expect(type.props.children[1].props.style.justifyContent).toEqual('left');
    });

    test('should get center text alignment', async () => {
      const index = 0;
      const style = {};
      const data = {
        styles,
        keyboard,
        textAlign: { align: 'center' },
        pages: defaultPages,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
        focusListItems: () => ({ first: false, last: false }),
      };
      const testRenderer = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const type = testInstance.findByType(Grid);
      expect(type.props.children[1].props.style.justifyContent).toEqual('center');
    });

    test('should get right text direction for non-numeric values', async () => {
      const index = 0;
      const style = {};
      // Just replace qNum with 'NaN' so that we can test alignment for non-numeric values.
      const nonNumericPages = defaultPages.map((p) => ({
        ...p,
        qMatrix: p.qMatrix.map(([mx]) => [{ ...mx, qNum: 'NaN' }]),
      }));
      const data = {
        styles,
        keyboard,
        textAlign: { auto: true },
        direction: 'rtl',
        pages: nonNumericPages,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
        focusListItems: () => ({ first: false, last: false }),
      };
      const testRenderer = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const type = testInstance.findByType(Grid);
      expect(type.props.children[1].props.style.justifyContent).toEqual('right');
    });

    test('should get left text direction for numeric values', async () => {
      const index = 0;
      const style = {};
      const data = {
        styles,
        keyboard,
        textAlign: { auto: true },
        direction: 'rtl',
        pages: defaultPages,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
        focusListItems: () => ({ first: false, last: false }),
      };
      const testRenderer = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const type = testInstance.findByType(Grid);
      expect(type.props.children[1].props.style.justifyContent).toEqual('left');
    });

    test('should get left text direction', async () => {
      const index = 0;
      const style = {};

      // Just replace qNum with 'NaN' so that we can test alignment for non-numeric values.
      const nonNumericPages = defaultPages.map((p) => ({
        ...p,
        qMatrix: p.qMatrix.map(([mx]) => [{ ...mx, qNum: 'NaN' }]),
      }));
      const data = {
        styles,
        keyboard,
        textAlign: { auto: true },
        direction: 'ltr',
        pages: nonNumericPages,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
        focusListItems: () => ({ first: false, last: false }),
      };
      const testRenderer = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const type = testInstance.findByType(Grid);
      expect(type.props.children[1].props.style.justifyContent).toEqual('left');
    });

    test('should align numeric values to the right', async () => {
      const index = 0;
      const style = {};

      const data = {
        styles,
        keyboard,
        textAlign: { auto: true },
        direction: 'ltr',
        pages: defaultPages, // these value(s) have a qNum so they are interpreted as numeric.
        dataOffset: 0,
        sizes: { itemPadding: 2 },
        focusListItems: () => ({ first: false, last: false }),
      };
      const testRenderer = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const type = testInstance.findByType(Grid);
      expect(type.props.children[1].props.style.justifyContent).toEqual('right');
    });

    test('should render radio button when isSingleSelect is true', async () => {
      const index = 0;
      const style = {};
      const data = {
        styles,
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        actions,
        isSingleSelect: true,
        checkboxes: true,
        frequencyMode: 'value',
        dataOffset: 0,
        sizes: { itemPadding: 2 },
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
        focusListItems: () => ({ first: false, last: false }),
      };
      const testRenderer = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={index} style={style} data={data} column={rowCol === 'column'} />
        </ThemeProvider>
      );
      const testInstance = testRenderer.root;
      const types = testInstance.findAllByType(ListBoxRadioButton);
      expect(types).toHaveLength(1);
    });
  });

  describe('image representation', () => {
    // Per-value expressions arrive as extra columns in the row: row = [dimCell, exprCell0, ...].
    // listExprIndex maps an expression's qLabel (e.g. 'imageUrl') to its column.
    const renderImageCell = async ({ representation, qText = 'field-value', exprValues = [], listExprIndex = {} }) => {
      const row = [{ qState: 'A', qText, qElemNumber: 0 }, ...exprValues.map((qv) => ({ qText: qv }))];
      const data = {
        styles,
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        actions,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
        representation,
        listExprIndex,
        pages: [
          {
            qArea: { qTop: 0, qHeight: 1 },
            qMatrix: [row],
          },
        ],
        focusListItems: () => ({ first: false, last: false }),
      };
      const testRenderer = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={0} style={{}} data={data} />
        </ThemeProvider>
      );
      return testRenderer;
    };

    test('label mode: uses the field value as src and the imageLabel expression as alt text', async () => {
      const testRenderer = await renderImageCell({
        representation: { type: 'image', imageSetting: 'label', imageSize: 'fitHeight' },
        qText: 'http://foo/bar.png',
        listExprIndex: { imageLabel: 1 },
        exprValues: ['a nice picture'],
      });
      const image = testRenderer.root.findByType(Image);
      expect(image.props.src).toBe('http://foo/bar.png');
      expect(image.props.label).toBe('a nice picture');
      await testRenderer.unmount();
    });

    test('label mode: falls back to the field value as alt text when imageLabel is empty', async () => {
      const testRenderer = await renderImageCell({
        representation: { type: 'image', imageSetting: 'label', imageSize: 'fitHeight' },
        qText: 'http://foo/bar.png',
      });
      const image = testRenderer.root.findByType(Image);
      expect(image.props.src).toBe('http://foo/bar.png');
      expect(image.props.label).toBe('http://foo/bar.png');
      await testRenderer.unmount();
    });

    test('label mode is the default when imageSetting is missing', async () => {
      const testRenderer = await renderImageCell({
        representation: { type: 'image', imageSize: 'fitHeight' },
        qText: 'http://foo/bar.png',
      });
      const image = testRenderer.root.findByType(Image);
      expect(image.props.src).toBe('http://foo/bar.png');
      await testRenderer.unmount();
    });

    test('url mode: uses the imageUrl expression column as src and the field value as alt text', async () => {
      const testRenderer = await renderImageCell({
        representation: { type: 'image', imageSetting: 'url', imageSize: 'fitHeight' },
        qText: 'A country name',
        listExprIndex: { imageUrl: 1 },
        exprValues: ['http://foo/from-url.png'],
      });
      const image = testRenderer.root.findByType(Image);
      expect(image.props.src).toBe('http://foo/from-url.png');
      expect(image.props.label).toBe('A country name');
      // With a resolved url the underlying <img> renders.
      expect(testRenderer.root.findAllByType('img')).toHaveLength(1);
      await testRenderer.unmount();
    });

    test('url mode: falls back to the field value as src when the expression column has no value', async () => {
      // If the expression column isn't present/resolved, url mode falls back to the field value
      // (qText) so images still render when the field value itself is the url.
      const testRenderer = await renderImageCell({
        representation: { type: 'image', imageSetting: 'url', imageSize: 'fitHeight' },
        qText: 'http://foo/field-value.png',
      });
      const image = testRenderer.root.findByType(Image);
      expect(image.props.src).toBe('http://foo/field-value.png');
      expect(image.props.label).toBe('http://foo/field-value.png');
      expect(testRenderer.root.findAllByType('img')).toHaveLength(1);
      await testRenderer.unmount();
    });

    test('renders row-major even when layoutOrder is column (fills every column)', async () => {
      const qMatrix = Array.from({ length: 12 }, (_, i) => [{ qState: 'A', qText: `m${i}`, qElemNumber: i }]);
      const data = {
        styles,
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        actions,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
        representation: { type: 'image', imageSetting: 'label', imageSize: 'fitHeight' },
        layoutOptions: { dataLayout: 'grid', layoutOrder: 'column' },
        columnCount: 3,
        rowCount: 10,
        pages: [{ qArea: { qTop: 0, qHeight: 12 }, qMatrix }],
        focusListItems: () => ({ first: false, last: false }),
      };
      const testRenderer = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn rowIndex={0} columnIndex={1} style={{}} data={data} />
        </ThemeProvider>
      );
      const image = testRenderer.root.findByType(Image);
      // row-major: cellIndex = rowIndex*columnCount + columnIndex = 0*3 + 1 = 1 -> 'm1'
      // (column-major would be columnIndex*rowCount + rowIndex = 1*10 + 0 = 10 -> 'm10', an unloaded far index)
      expect(image.props.src).toBe('m1');
      await testRenderer.unmount();
    });

    test('passes the dimension value as the title and the subtitle/cellBgColor expression columns to Image', async () => {
      const testRenderer = await renderImageCell({
        representation: { type: 'image', imageSetting: 'url', imageSize: 'alwaysFill' },
        qText: 'Amadeus',
        listExprIndex: { imageUrl: 1, subtitle: 2, cellBgColor: 3 },
        exprValues: ['http://foo/poster.png', 'Milos Forman', '#ff0000'],
      });
      const image = testRenderer.root.findByType(Image);
      expect(image.props.title).toBe('Amadeus');
      expect(image.props.subtitle).toBe('Milos Forman');
      expect(image.props.cellBgColor).toBe('#ff0000');
      await testRenderer.unmount();
    });

    test('uses the tooltip expression column as the cell title, falling back to the dimension value', async () => {
      const withTooltip = await renderImageCell({
        representation: { type: 'image', imageSetting: 'url', imageSize: 'alwaysFill' },
        qText: 'Amadeus',
        listExprIndex: { imageUrl: 1, tooltip: 2 },
        exprValues: ['http://foo/poster.png', 'A film by Milos Forman'],
      });
      expect(withTooltip.root.findAllByProps({ title: 'A film by Milos Forman' }).length).toBeGreaterThan(0);
      await withTooltip.unmount();

      const withoutTooltip = await renderImageCell({
        representation: { type: 'image', imageSetting: 'url', imageSize: 'alwaysFill' },
        qText: 'Amadeus',
        listExprIndex: { imageUrl: 1 },
        exprValues: ['http://foo/poster.png'],
      });
      expect(withoutTooltip.root.findAllByProps({ title: 'Amadeus' }).length).toBeGreaterThan(0);
      await withoutTooltip.unmount();
    });

    test('insets each image cell by the grid gap (centered in its cell stride)', async () => {
      const qMatrix = Array.from({ length: 6 }, (_, i) => [{ qState: 'A', qText: `m${i}`, qElemNumber: i }]);
      const data = {
        styles,
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        actions,
        dataOffset: 0,
        sizes: { itemPadding: 2, gridGap: 10 },
        representation: { type: 'image', imageSetting: 'label', imageSize: 'alwaysFill' },
        layoutOptions: { dataLayout: 'grid', layoutOrder: 'row' },
        columnCount: 3,
        rowCount: 2,
        pages: [{ qArea: { qTop: 0, qHeight: 6 }, qMatrix }],
        focusListItems: () => ({ first: false, last: false }),
      };
      const testRenderer = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn
            rowIndex={0}
            columnIndex={0}
            style={{ left: 0, top: 0, width: 90, height: 120 }}
            data={data}
          />
        </ThemeProvider>
      );
      const root = testRenderer.root.findByProps({ 'data-testid': 'listbox.item' });
      // width/height reduced by the gap, position offset by half the gap.
      expect(root.props.style.width).toBe(80);
      expect(root.props.style.height).toBe(110);
      expect(root.props.style.left).toBe(5);
      expect(root.props.style.top).toBe(5);
      // No tick/lock column reserving 24px on image cells (posters fill the card).
      const iconCols = testRenderer.root.findAll(
        (n) => typeof n.props.className === 'string' && n.props.className.includes('RowColumn-icon')
      );
      expect(iconCols).toHaveLength(0);
      await testRenderer.unmount();
    });

    test.each([
      ['S', true, 1, '#f0f0f0'],
      ['A', false, 0.4, '#e0e0e0'],
      ['X', false, 0.3, '#f0f0f0'],
      ['O', false, 1, '#f0f0f0'],
    ])(
      'qState %s → selected=%s, opacity=%s, placeholder=%s on the Image',
      async (qState, selected, opacity, placeholderBackground) => {
        const row = [{ qState, qText: 'Amadeus', qElemNumber: 0 }];
        const data = {
          styles,
          onMouseDown: jest.fn(),
          onMouseUp: jest.fn(),
          onMouseEnter: jest.fn(),
          onClick: jest.fn(),
          keyboard,
          actions,
          dataOffset: 0,
          sizes: { itemPadding: 2 },
          representation: { type: 'image', imageSetting: 'label', imageSize: 'alwaysFill' },
          listExprIndex: {},
          pages: [{ qArea: { qTop: 0, qHeight: 1 }, qMatrix: [row] }],
          focusListItems: () => ({ first: false, last: false }),
        };
        const testRenderer = await render(
          <ThemeProvider theme={theme}>
            <ListBoxRowColumn index={0} style={{}} data={data} />
          </ThemeProvider>
        );
        const image = testRenderer.root.findByType(Image);
        expect(image.props.selected).toBe(selected);
        expect(image.props.opacity).toBe(opacity);
        expect(image.props.placeholderBackground).toBe(placeholderBackground);
        await testRenderer.unmount();
      }
    );

    test('caches the url expression so an excluded value keeps its image after selection', async () => {
      const exprCache = {};
      const dataFor = (urlValue) => ({
        styles,
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        actions,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
        representation: { type: 'image', imageSetting: 'url', imageSize: 'alwaysFill' },
        listExprIndex: { imageUrl: 1 },
        exprCache,
        pages: [
          {
            qArea: { qTop: 0, qHeight: 1 },
            qMatrix: [[{ qState: 'O', qText: 'Amadeus', qElemNumber: 0 }, { qText: urlValue }]],
          },
        ],
        focusListItems: () => ({ first: false, last: false }),
      });

      // First render: value is possible, the url resolves and is cached.
      const first = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={0} style={{}} data={dataFor('http://foo/poster.png')} />
        </ThemeProvider>
      );
      expect(first.root.findByType(Image).props.src).toBe('http://foo/poster.png');
      await first.unmount();

      // After selection the value is excluded and the engine returns an empty url; the cache fills in.
      const second = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={0} style={{}} data={dataFor('')} />
        </ThemeProvider>
      );
      expect(second.root.findByType(Image).props.src).toBe('http://foo/poster.png');
      await second.unmount();
    });

    test('per-value cache is keyed by qElemNumber so values with duplicate labels do not collide', async () => {
      const exprCache = {};
      const dataFor = (qElemNumber, urlValue) => ({
        styles,
        onMouseDown: jest.fn(),
        onMouseUp: jest.fn(),
        onMouseEnter: jest.fn(),
        onClick: jest.fn(),
        keyboard,
        actions,
        dataOffset: 0,
        sizes: { itemPadding: 2 },
        representation: { type: 'image', imageSetting: 'url', imageSize: 'alwaysFill' },
        listExprIndex: { imageUrl: 1 },
        exprCache,
        pages: [
          {
            qArea: { qTop: 0, qHeight: 1 },
            // Two distinct values share the same display text ('Amadeus').
            qMatrix: [[{ qState: 'O', qText: 'Amadeus', qElemNumber }, { qText: urlValue }]],
          },
        ],
        focusListItems: () => ({ first: false, last: false }),
      });

      // Value #0 resolves and caches its own url.
      const a = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={0} style={{}} data={dataFor(0, 'http://foo/a.png')} />
        </ThemeProvider>
      );
      expect(a.root.findByType(Image).props.src).toBe('http://foo/a.png');
      await a.unmount();

      // A different value with the SAME label caches its own (different) url.
      const b = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={0} style={{}} data={dataFor(1, 'http://foo/b.png')} />
        </ThemeProvider>
      );
      expect(b.root.findByType(Image).props.src).toBe('http://foo/b.png');
      await b.unmount();

      // Value #0 is now excluded (empty url) — it must recover ITS OWN cached url, not value #1's.
      const aExcluded = await render(
        <ThemeProvider theme={theme}>
          <ListBoxRowColumn index={0} style={{}} data={dataFor(0, '')} />
        </ThemeProvider>
      );
      expect(aExcluded.root.findByType(Image).props.src).toBe('http://foo/a.png');
      await aExcluded.unmount();
    });

    test('non-image representation does not render an Image', async () => {
      const testRenderer = await renderImageCell({
        representation: { type: 'text' },
        qText: 'plain text',
      });
      expect(testRenderer.root.findAllByType(Image)).toHaveLength(0);
      await testRenderer.unmount();
    });
  });
});
