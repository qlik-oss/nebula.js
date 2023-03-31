import * as React from 'react';
import { create, act } from 'react-test-renderer';
import * as listboxSelections from '../listbox-selections';

import useSelectionsInteractions from '../useSelectionsInteractions';
import createSelectionState from '../selectionState';

const createPageWithSingle = (qElemNumber, qState = 'O') => [{ qMatrix: [[{ qElemNumber, qState }]] }];
const createPageWithRange = (...items) => [{ qMatrix: items.map((item) => [item]) }];

const TestHook = React.forwardRef(({ hook, hookProps = [] }, ref) => {
  const result = hook(...hookProps);
  React.useImperativeHandle(ref, () => ({
    result,
  }));
  return null;
});

describe('use-listbox-interactions', () => {
  let selections;
  let ref;
  let render;
  let selectValues;
  let selectionState;
  let setPages;
  let layout;
  let updateSelectionState;
  let loaderRef;

  beforeEach(() => {
    jest.spyOn(global.document, 'addEventListener').mockImplementation(jest.fn());
    jest.spyOn(global.document, 'removeEventListener').mockImplementation(jest.fn());

    jest.useFakeTimers();

    selectValues = jest.fn().mockResolvedValue();

    jest.spyOn(listboxSelections, 'selectValues').mockImplementation(selectValues);

    selections = {
      on: jest.fn(),
      removeEventListener: jest.fn(),
      key: 'selections',
    };
    layout = { qListObject: { qDimensionInfo: { qIsOneAndOnlyOne: false, qApprMaxGlyphCount: 3 }, qSize: { qcy: 3 } } };
    setPages = jest.fn();
    selectionState = createSelectionState(setPages);
    selectionState.update({
      setPages,
      pages: [],
      isSingleSelect: false,
      layout,
      selectDisabled: () => false,
    });
    updateSelectionState = (override) => {
      selectionState.update({
        setPages,
        pages: [],
        isSingleSelect: false,
        layout,
        selectDisabled: () => false,
        ...override,
      });
    };

    selections = {
      key: 'selections',
      on: jest.fn(),
      removeEventListener: jest.fn(),
    };

    ref = React.createRef();
    loaderRef = {
      current: null,
    };
    render = async (overrides = {}) => {
      await act(async () => {
        create(
          <TestHook
            ref={ref}
            hook={useSelectionsInteractions}
            hookProps={[{ selectionState, selections, doc: global.document, loaderRef, ...overrides }]}
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
        expect(Object.keys(arg0).sort()).toEqual(['interactionEvents', 'select']);
        expect(Object.keys(arg0.interactionEvents).sort()).toEqual([
          'onMouseDown',
          'onMouseEnter',
          'onMouseUp',
          'onTouchEnd',
          'onTouchStart',
        ]);
      });
      test('With checkboxes', async () => {
        await render({ checkboxes: true });
        const arg0 = ref.current.result;
        expect(Object.keys(arg0).sort()).toEqual(['interactionEvents', 'select']);
        expect(Object.keys(arg0.interactionEvents).sort()).toEqual(['onChange']);
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
        toggle: true,
        selections,
      });
    });

    test('should select a value', async () => {
      await render();
      const arg0 = ref.current.result;

      updateSelectionState({
        pages: createPageWithSingle(23, 'O'),
      });

      const [eventName, docMouseUpListener] = global.document.addEventListener.mock.lastCall;
      expect(eventName).toBe('mouseup');
      expect(global.document.removeEventListener).not.toHaveBeenCalled();

      expect(listboxSelections.selectValues).toHaveBeenCalledTimes(0);

      const callCount = setPages.mock.calls.length;

      await act(() => {
        arg0.interactionEvents.onMouseDown({
          button: 0,
          currentTarget: {
            getAttribute: jest.fn().mockReturnValue(23),
          },
        });
      });

      expect(listboxSelections.selectValues).not.toHaveBeenCalled();
      expect(setPages).toHaveBeenCalledTimes(callCount + 1);
      expect(setPages).toHaveBeenLastCalledWith(createPageWithSingle(23, 'S'));

      await act(() => {
        docMouseUpListener({ button: 0 }); // trigger doc mouseup listener to set mouseDown => false
      });

      expect(listboxSelections.selectValues).toHaveBeenCalledTimes(1);

      expect(listboxSelections.selectValues).toHaveBeenCalledWith({
        selections,
        elemNumbers: [23],
        toggle: true,
        isSingleSelect: false,
      });
      // no update of pages on mouse up
      expect(setPages).toHaveBeenCalledTimes(callCount + 1);
    });

    test('should unselect a value', async () => {
      updateSelectionState({
        pages: createPageWithSingle(24, 'S'),
      });

      await render();
      const arg0 = ref.current.result;
      const callCount = setPages.mock.calls.length;

      await act(() => {
        arg0.interactionEvents.onMouseDown({
          button: 0,
          currentTarget: {
            getAttribute: jest.fn().mockReturnValue(24), // fake mousedown on element nbr 24
          },
        });
      });

      expect(setPages).toHaveBeenCalledTimes(callCount + 1);
      expect(setPages).toHaveBeenLastCalledWith(createPageWithSingle(24, 'A'));

      expect(listboxSelections.selectValues).not.toHaveBeenCalled();
      const [, docMouseUpListener] = global.document.addEventListener.mock.lastCall;

      await act(() => {
        docMouseUpListener({ button: 0 });
      });

      expect(listboxSelections.selectValues).toHaveBeenCalledTimes(1);
      expect(listboxSelections.selectValues).toHaveBeenCalledWith({
        selections,
        elemNumbers: [24],
        isSingleSelect: false,
        toggle: true,
      });

      expect(setPages).toHaveBeenCalledTimes(callCount + 1);
    });
  });

  describe('it should behave with range select', () => {
    test('should return expected stuff', async () => {
      await render();
      const arg0 = ref.current.result;
      expect(Object.keys(arg0)).toEqual(['interactionEvents', 'select']);
      expect(Object.keys(arg0.interactionEvents).sort()).toEqual([
        'onMouseDown',
        'onMouseEnter',
        'onMouseUp',
        'onTouchEnd',
        'onTouchStart',
      ]);
    });

    test('should select a range (in theory)', async () => {
      const createPage = (s24, s25, s26, s27, s28, s29, s30, s31) =>
        createPageWithRange(
          { qElemNumber: 24, qState: s24 },
          { qElemNumber: 25, qState: s25 },
          { qElemNumber: 26, qState: s26 },
          { qElemNumber: 27, qState: s27 },
          { qElemNumber: 28, qState: s28 },
          { qElemNumber: 29, qState: s29 },
          { qElemNumber: 30, qState: s30 },
          { qElemNumber: 31, qState: s31 }
        );

      updateSelectionState({
        pages: createPage('O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'),
      });

      await render();

      const callCount = setPages.mock.calls.length;

      // Simulate a typical select range scenario.
      await act(() => {
        ref.current.result.interactionEvents.onMouseDown({
          button: 0,
          currentTarget: {
            getAttribute: jest.fn().mockReturnValue(24),
          },
        });
      });
      expect(setPages).toHaveBeenCalledTimes(callCount + 1);
      expect(setPages).toHaveBeenLastCalledWith(createPage('S', 'O', 'O', 'O', 'O', 'O', 'O', 'O'));
      await act(() => {
        ref.current.result.interactionEvents.onMouseEnter({
          currentTarget: {
            getAttribute: jest.fn().mockReturnValue(25),
          },
        });
      });
      expect(setPages).toHaveBeenCalledTimes(callCount + 2);
      expect(setPages).toHaveBeenLastCalledWith(createPage('S', 'S', 'O', 'O', 'O', 'O', 'O', 'O'));
      await act(() => {
        ref.current.result.interactionEvents.onMouseEnter({
          currentTarget: {
            getAttribute: jest.fn().mockReturnValue(28),
          },
        });
      });
      expect(setPages).toHaveBeenCalledTimes(callCount + 3);
      expect(setPages).toHaveBeenLastCalledWith(createPage('S', 'S', 'S', 'S', 'S', 'O', 'O', 'O'));
      await act(() => {
        ref.current.result.interactionEvents.onMouseUp({
          button: 0,
          currentTarget: {
            getAttribute: jest.fn().mockReturnValue(30),
          },
        });
      });
      expect(setPages).toHaveBeenCalledTimes(callCount + 4);
      expect(setPages).toHaveBeenLastCalledWith(createPage('S', 'S', 'S', 'S', 'S', 'S', 'S', 'O'));
      await act(() => {
        const [, docMouseUpListener] = global.document.addEventListener.mock.lastCall;
        docMouseUpListener({ button: 0 });
      });

      expect(setPages).toHaveBeenCalledTimes(callCount + 4);
      expect(listboxSelections.selectValues).toHaveBeenCalledTimes(1);
      expect(listboxSelections.selectValues).toHaveBeenCalledWith({
        selections,
        elemNumbers: [24, 25, 26, 27, 28, 29, 30],
        isSingleSelect: false,
        toggle: true,
      });
    });

    test('Should handle range select on two finger tap', async () => {
      const createPage = (s24, s25, s26, s27, s28, s29, s30, s31) =>
        createPageWithRange(
          { qElemNumber: 24, qState: s24 },
          { qElemNumber: 25, qState: s25 },
          { qElemNumber: 26, qState: s26 },
          { qElemNumber: 27, qState: s27 },
          { qElemNumber: 28, qState: s28 },
          { qElemNumber: 29, qState: s29 },
          { qElemNumber: 30, qState: s30 },
          { qElemNumber: 31, qState: s31 }
        );

      updateSelectionState({
        pages: createPage('O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'),
      });

      await render();

      await act(() => {
        const touchOne = {
          target: {
            closest: () => ({ getAttribute: jest.fn().mockReturnValue('24') }),
          },
        };
        const touchTwo = {
          target: {
            closest: () => ({ getAttribute: jest.fn().mockReturnValue('29') }),
          },
        };

        ref.current.result.interactionEvents.onTouchStart({
          touches: [touchOne, touchTwo],
        });
        ref.current.result.interactionEvents.onTouchEnd();
      });
      // Touch range too small
      expect(listboxSelections.selectValues).not.toHaveBeenCalled();

      await act(() => {
        const touchOne = {
          target: {
            closest: () => ({ getAttribute: jest.fn().mockReturnValue('24') }),
          },
        };
        const touchTwo = {
          target: {
            closest: () => ({ getAttribute: jest.fn().mockReturnValue('30') }),
          },
        };

        ref.current.result.interactionEvents.onTouchStart({
          touches: [touchOne, touchTwo],
        });
        ref.current.result.interactionEvents.onTouchEnd();
      });
      expect(listboxSelections.selectValues).toHaveBeenCalledWith({
        selections,
        elemNumbers: [24, 25, 26, 27, 28, 29, 30],
        isSingleSelect: false,
        toggle: true,
      });
    });

    test('Should "toggle" checkboxes', async () => {
      updateSelectionState({
        pages: createPageWithSingle(24, 'O'),
      });
      await render({ checkboxes: true });
      const startCallCount = setPages.mock.calls.length;
      await act(() => {
        ref.current.result.interactionEvents.onChange({
          nativeEvent: {},
          target: {
            getAttribute: jest.fn().mockReturnValue(24),
          },
        });
      });

      expect(setPages).toHaveBeenCalledTimes(startCallCount + 1);
      expect(setPages).toHaveBeenLastCalledWith(createPageWithSingle(24, 'S'));

      await act(() => {
        ref.current.result.interactionEvents.onChange({
          nativeEvent: {},
          target: {
            getAttribute: jest.fn().mockReturnValue(24),
          },
        });
      });
      expect(setPages).toHaveBeenCalledTimes(startCallCount + 2);
      expect(setPages).toHaveBeenLastCalledWith(createPageWithSingle(24, 'O'));
    });

    // test('Ctrl or cmd button with click should result in single select behaviour', async () => {
    //   await render({ checkboxes: true });
    //   const preventDefault = jest.fn();
    //   const focus = jest.fn();
    //   await act(() => {
    //     ref.current.result.interactionEvents.onChange({
    //       target: {
    //         focus,
    //         getAttribute: jest.fn().mockReturnValue(24),
    //       },
    //       nativeEvent: {
    //         ctrlKey: true,
    //       },
    //       preventDefault,
    //     });
    //   });
    //   expect(focus).toHaveBeenCalledTimes(1);
    //   expect(preventDefault).toHaveBeenCalledTimes(1);
    // });

    test('Ctrl or cmd button with mousedown should result in single select behaviour', async () => {
      await render({ checkboxes: false });
      const preventDefault = jest.fn();
      const focus = jest.fn();
      await act(() => {
        ref.current.result.interactionEvents.onMouseDown({
          button: 0,
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
