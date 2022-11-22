import * as React from 'react';
import { create, act } from 'react-test-renderer';
import * as listboxSelections from '../listbox-selections';

import useSelectionsInteractions from '../useSelectionsInteractions';

const TestHook = React.forwardRef(({ hook, hookProps = [] }, ref) => {
  const result = hook(...hookProps);
  React.useImperativeHandle(ref, () => ({
    result,
  }));
  return null;
});

describe('use-listbox-interactions', () => {
  let layout;
  let selections;
  let pages;
  let selectDisabled;
  let ref;
  let render;
  let getUniques;
  let selectValues;
  let applySelectionsOnPages;
  let fillRange;
  let getSelectedValues;
  let getElemNumbersFromPages;

  beforeEach(() => {
    jest.spyOn(global.document, 'addEventListener').mockImplementation(jest.fn());
    jest.spyOn(global.document, 'removeEventListener').mockImplementation(jest.fn());

    jest.useFakeTimers();

    getUniques = jest.fn().mockImplementation((input) => input);
    selectValues = jest.fn().mockResolvedValue();
    applySelectionsOnPages = jest.fn().mockReturnValue([]);
    fillRange = jest.fn().mockImplementation((arr) => arr);
    getSelectedValues = jest.fn().mockReturnValue([]);
    getElemNumbersFromPages = jest.fn().mockReturnValue([]);

    jest.spyOn(listboxSelections, 'getUniques').mockImplementation(getUniques);
    jest.spyOn(listboxSelections, 'selectValues').mockImplementation(selectValues);
    jest.spyOn(listboxSelections, 'applySelectionsOnPages').mockImplementation(applySelectionsOnPages);
    jest.spyOn(listboxSelections, 'fillRange').mockImplementation(fillRange);
    jest.spyOn(listboxSelections, 'getSelectedValues').mockImplementation(getSelectedValues);
    jest.spyOn(listboxSelections, 'getElemNumbersFromPages').mockImplementation(getElemNumbersFromPages);

    layout = {
      qListObject: { qDimensionInfo: { qIsOneAndOnlyOne: false } },
    };
    selections = { key: 'selections' };
    pages = [];
    selectDisabled = () => false;

    ref = React.createRef();
    render = async (overrides = {}) => {
      await act(async () => {
        create(
          <TestHook
            ref={ref}
            hook={useSelectionsInteractions}
            hookProps={[{ layout, selections, pages, selectDisabled, doc: global.document, ...overrides }]}
          />
        );
      });
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('it should behave without range select', () => {
    describe('should return expected listeners', () => {
      test('With range', async () => {
        await render();
        const arg0 = ref.current.result;
        expect(Object.keys(arg0).sort()).toEqual(['instantPages', 'interactionEvents', 'select']);
        expect(arg0.instantPages).toEqual([]);
        expect(Object.keys(arg0.interactionEvents).sort()).toEqual(['onMouseDown', 'onMouseEnter', 'onMouseUp']);
      });
      test('With checkboxes', async () => {
        await render({ checkboxes: true });
        const arg0 = ref.current.result;
        expect(Object.keys(arg0).sort()).toEqual(['instantPages', 'interactionEvents', 'select']);
        expect(arg0.instantPages).toEqual([]);
        expect(Object.keys(arg0.interactionEvents).sort()).toEqual(['onClick']);
      });
    });

    test('Should manually pre-select and select values when calling the manual select method', async () => {
      await render();
      const args = ref.current.result;
      expect(listboxSelections.selectValues).not.toHaveBeenCalled();
      await act(() => {
        args.select([1]);
      });
      expect(listboxSelections.selectValues).toHaveBeenCalledTimes(1);
      expect(listboxSelections.selectValues.mock.lastCall[0]).toEqual({
        elemNumbers: [1],
        isSingleSelect: false,
        selections: { key: 'selections' },
      });
    });

    test('should select a value', async () => {
      await render();
      const arg0 = ref.current.result;

      expect(applySelectionsOnPages).not.toHaveBeenCalled();
      const [eventName, docMouseUpListener] = global.document.addEventListener.mock.lastCall;
      expect(eventName).toBe('mouseup');
      expect(global.document.removeEventListener).not.toHaveBeenCalled();

      expect(listboxSelections.selectValues).toHaveBeenCalledTimes(0);

      await act(() => {
        arg0.interactionEvents.onMouseDown({
          currentTarget: {
            getAttribute: jest.fn().mockReturnValue(23),
          },
        });
      });

      const arg1 = ref.current.result;

      expect(listboxSelections.selectValues).not.toHaveBeenCalled();
      expect(arg1.instantPages).toEqual([]);

      await act(() => {
        docMouseUpListener(); // trigger doc mouseup listener to set mouseDown => false
      });

      const arg2 = ref.current.result;

      expect(listboxSelections.selectValues).toHaveBeenCalledTimes(1);

      expect(listboxSelections.selectValues).toHaveBeenCalledWith({
        selections: { key: 'selections' },
        elemNumbers: [23],
        isSingleSelect: false,
      });
      expect(applySelectionsOnPages).toHaveBeenCalledTimes(1);
      expect(applySelectionsOnPages.mock.lastCall).toEqual([[], [23], false]);
      expect(arg2.instantPages).toEqual([]);
    });

    test('should unselect a value', async () => {
      getSelectedValues.mockReturnValue([24]); // mock element nbr 24 as already selected
      await render();
      const arg0 = ref.current.result;

      await act(() => {
        arg0.interactionEvents.onMouseDown({
          currentTarget: {
            getAttribute: jest.fn().mockReturnValue(24), // fake mousedown on element nbr 24
          },
        });
      });

      expect(applySelectionsOnPages).toHaveBeenCalledTimes(1);

      expect(applySelectionsOnPages.mock.lastCall).toEqual([[], [24], false]);
      expect(listboxSelections.selectValues).not.toHaveBeenCalled();
      const [, docMouseUpListener] = global.document.addEventListener.mock.lastCall;

      await act(() => {
        docMouseUpListener();
      });

      expect(listboxSelections.selectValues).toHaveBeenCalledTimes(1);
      expect(listboxSelections.selectValues).toHaveBeenCalledWith({
        selections: { key: 'selections' },
        elemNumbers: [24],
        isSingleSelect: false,
      });

      expect(applySelectionsOnPages).toHaveBeenCalledTimes(1);
    });
  });

  describe('it should behave with range select', () => {
    test('should return expected stuff', async () => {
      await render();
      const arg0 = ref.current.result;
      expect(Object.keys(arg0)).toEqual(['instantPages', 'interactionEvents', 'select']);
      expect(arg0.instantPages).toEqual([]);
      expect(Object.keys(arg0.interactionEvents).sort()).toEqual(['onMouseDown', 'onMouseEnter', 'onMouseUp']);
    });

    test('should select a range (in theory)', async () => {
      getElemNumbersFromPages.mockReturnValue([24, 25, 26, 27, 28, 29, 30, 31]);

      await render();

      expect(applySelectionsOnPages).toHaveBeenCalledTimes(0);

      // Simulate a typical select range scenario.
      await act(() => {
        ref.current.result.interactionEvents.onMouseDown({
          currentTarget: {
            getAttribute: jest.fn().mockReturnValue(24),
          },
        });
      });
      expect(applySelectionsOnPages).toHaveBeenCalledTimes(1);
      await act(() => {
        ref.current.result.interactionEvents.onMouseEnter({
          currentTarget: {
            getAttribute: jest.fn().mockReturnValue(25),
          },
        });
      });
      expect(applySelectionsOnPages).toHaveBeenCalledTimes(2);
      await act(() => {
        ref.current.result.interactionEvents.onMouseEnter({
          currentTarget: {
            getAttribute: jest.fn().mockReturnValue(28),
          },
        });
      });
      await act(() => {
        ref.current.result.interactionEvents.onMouseUp({
          currentTarget: {
            getAttribute: jest.fn().mockReturnValue(30),
          },
        });
      });
      await act(() => {
        const [, docMouseUpListener] = global.document.addEventListener.mock.lastCall;
        docMouseUpListener();
      });

      expect(applySelectionsOnPages).toHaveBeenCalledTimes(4);
      expect(listboxSelections.selectValues).toHaveBeenCalledTimes(1);
      expect(listboxSelections.selectValues).toHaveBeenCalledWith({
        selections: { key: 'selections' },
        elemNumbers: [24, 25, 28, 30], // without mocking fillRange this range would be filled
        isSingleSelect: false,
      });

      // Should pre-select "cumulative", once for each new value
      expect(applySelectionsOnPages.mock.calls[0]).toEqual([[], [24], false]);
      expect(applySelectionsOnPages.mock.calls[1]).toEqual([[], [24, 25], false]);
      expect(applySelectionsOnPages.mock.calls[2]).toEqual([[], [24, 25, 28], false]);
      expect(applySelectionsOnPages.mock.calls[3]).toEqual([[], [24, 25, 28, 30], false]);
    });
    // TODO: MUIv5 Should be enabled and fixed
    test('Should "toggle" checkboxes', async () => {
      await render({ checkboxes: true });
      const startCallCount = applySelectionsOnPages.mock.calls.length;
      await act(() => {
        ref.current.result.interactionEvents.onClick({
          currentTarget: {
            getAttribute: jest.fn().mockReturnValue(24),
          },
        });
      });

      expect(applySelectionsOnPages).toHaveBeenCalledTimes(startCallCount + 2);
      expect(applySelectionsOnPages.mock.calls[1]).toEqual([[], [24], false]);
      await act(() => {
        ref.current.result.interactionEvents.onClick({
          currentTarget: {
            getAttribute: jest.fn().mockReturnValue(24),
          },
        });
      });
      expect(applySelectionsOnPages.mock.calls[2]).toEqual([[], [], false]);
    });

    test('Ctrl or cmd button with click should result in single select behaviour', async () => {
      await render({ checkboxes: true });
      const preventDefault = jest.fn();
      const focus = jest.fn();
      await act(() => {
        ref.current.result.interactionEvents.onClick({
          currentTarget: {
            focus,
            getAttribute: jest.fn().mockReturnValue(24),
          },
          ctrlKey: true,
          preventDefault,
        });
      });
      expect(focus).toHaveBeenCalledTimes(1);
      expect(preventDefault).toHaveBeenCalledTimes(1);
    });

    test('Ctrl or cmd button with mousedown should result in single select behaviour', async () => {
      await render({ checkboxes: false });
      const preventDefault = jest.fn();
      const focus = jest.fn();
      await act(() => {
        ref.current.result.interactionEvents.onMouseDown({
          currentTarget: {
            focus,
            getAttribute: jest.fn().mockReturnValue(24),
          },
          ctrlKey: true,
          preventDefault,
        });
      });
      expect(focus).toHaveBeenCalledTimes(1);
      expect(preventDefault).toHaveBeenCalledTimes(1);
    });
  });
});
