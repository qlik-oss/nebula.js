import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@nebula.js/ui/theme';
import { Box } from '@mui/material';
import ListBoxRowColumn from '..';
import useTempKeyboard from '../../useTempKeyboard';
import * as screenReader from '../../ScreenReaders';

const getRow = (i) => screen.getAllByTestId('listbox.item')[i].firstChild;

describe('check keyboard navigation rendering with multiple rows in the in-built headless browser', () => {
  let style;
  let data;
  let theme;
  let actions;
  let containerRef;

  beforeEach(() => {
    jest.spyOn(screenReader, 'getValueLabel').mockReturnValue('ariaLabel');
    const mockUseState = jest.spyOn(React, 'useState');
    mockUseState.mockReturnValue([true, jest.fn()]);
    const keyboard = useTempKeyboard({ containerRef, enabled: false });

    actions = {
      select: jest.fn(),
      selectAll: jest.fn(),
      onCtrlF: jest.fn(),
      confirm: jest.fn(),
      cancel: jest.fn(),
    };
    theme = createTheme('dark');
    style = {};
    data = {
      onMouseDown: jest.fn(),
      onMouseUp: jest.fn(),
      onMouseEnter: jest.fn(),
      onClick: jest.fn(),
      keyboard,
      actions,
      isSingleSelect: false,
      checkboxes: false,
      frequencyMode: 'value',
      dataOffset: 0,
      focusListItems: {
        first: undefined,
        last: undefined,
      },
      layoutOptions: {
        layoutOrder: 'row',
      },
      isModal: jest.fn().mockReturnValue(false),
      pages: [
        {
          qArea: {
            qLeft: 0,
            qTop: 0,
            qWidth: 0,
            qHeight: 3,
          },
          qMatrix: [
            [
              {
                qState: 'A',
                qFrequency: '1',
                qText: 'A',
                qElemNumber: 0,
              },
            ],
            [
              {
                qState: 'A',
                qFrequency: '2',
                qText: 'B',
                qElemNumber: 1,
              },
            ],
            [
              {
                qState: 'A',
                qFrequency: '3',
                qText: 'C',
                qElemNumber: 2,
              },
            ],
          ],
        },
      ],
    };
  });

  it('focus should walk down and up the rows when pressing arrows keys (right, down, up, left)', async () => {
    render(
      <ThemeProvider theme={theme}>
        <Box ref={containerRef}>
          <ListBoxRowColumn index={0} style={style} data={data} />
          <ListBoxRowColumn index={1} style={style} data={data} autoFocus />
          <ListBoxRowColumn index={2} style={style} data={data} />
        </Box>
      </ThemeProvider>
    );

    const firstRowColumn = getRow(0);
    const middleRowColumn = getRow(1);
    const lastRowColumn = getRow(2);

    fireEvent.keyDown(firstRowColumn, { keyCode: 39 });
    await waitFor(() => {
      expect(document.activeElement).toBe(middleRowColumn);
    });

    fireEvent.keyDown(middleRowColumn, { keyCode: 40 });
    await waitFor(() => {
      expect(document.activeElement).toBe(lastRowColumn);
    });

    fireEvent.keyDown(lastRowColumn, { keyCode: 38 });
    await waitFor(() => {
      expect(document.activeElement).toBe(middleRowColumn);
    });

    fireEvent.keyDown(middleRowColumn, { keyCode: 37 });
    await waitFor(() => {
      expect(document.activeElement).toBe(firstRowColumn);
    });
  });

  it('focus should move from row to confirm button when tabbing', async () => {
    data.isModal.mockReturnValue(true);
    render(
      <ThemeProvider theme={theme}>
        <div className="actions-toolbar-default-actions">
          <button type="button" className="actions-toolbar-confirm" data-testid="confirm">
            Confirm
          </button>
        </div>
        <Box ref={containerRef}>
          <ListBoxRowColumn index={0} style={style} data={data} />
          <ListBoxRowColumn index={1} style={style} data={data} autoFocus />
          <ListBoxRowColumn index={2} style={style} data={data} />
        </Box>
      </ThemeProvider>
    );

    const middleRowColumn = getRow(1);
    const confirmButton = screen.getByTestId('confirm');

    fireEvent.keyDown(middleRowColumn, { keyCode: 9 });
    await waitFor(() => {
      expect(document.activeElement).toEqual(confirmButton);
      expect(middleRowColumn).toHaveClass('last-focused');
    });
  });

  it('should select all with CMD-A', async () => {
    render(
      <ThemeProvider theme={theme}>
        <Box ref={containerRef}>
          <ListBoxRowColumn index={1} style={style} data={data} autoFocus />
        </Box>
      </ThemeProvider>
    );

    const firstRowColumn = getRow(0);

    expect(actions.selectAll).toHaveBeenCalledTimes(0);
    fireEvent.keyDown(firstRowColumn, { keyCode: 65, metaKey: true });
    expect(actions.selectAll).toHaveBeenCalledTimes(1);
  });

  it('should activate search with CMD-F', async () => {
    render(
      <ThemeProvider theme={theme}>
        <Box ref={containerRef}>
          <ListBoxRowColumn index={1} style={style} data={data} autoFocus />
        </Box>
      </ThemeProvider>
    );

    const firstRowColumn = getRow(0);

    expect(actions.onCtrlF).toHaveBeenCalledTimes(0);
    fireEvent.keyDown(firstRowColumn, { keyCode: 70, metaKey: true });
    expect(actions.onCtrlF).toHaveBeenCalledTimes(1);
  });

  it('should activate search with CMD-F', async () => {
    render(
      <ThemeProvider theme={theme}>
        <Box ref={containerRef}>
          <ListBoxRowColumn index={1} style={style} data={data} autoFocus />
        </Box>
      </ThemeProvider>
    );

    const firstRowColumn = getRow(0);

    expect(actions.onCtrlF).toHaveBeenCalledTimes(0);
    fireEvent.keyDown(firstRowColumn, { keyCode: 70, metaKey: true });
    expect(actions.onCtrlF).toHaveBeenCalledTimes(1);
  });
});
