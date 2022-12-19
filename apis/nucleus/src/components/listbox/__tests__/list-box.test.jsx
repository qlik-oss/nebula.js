import React from 'react';
import { create, act } from 'react-test-renderer';
import * as reactWindowInfiniteLoaderModule from 'react-window-infinite-loader';
import * as useLayoutModule from '../../../hooks/useLayout';
import * as useSelectionsInteractionsModule from '../hooks/selections/useSelectionsInteractions';
import * as useTextWidth from '../hooks/useTextWidth';
import * as getListSizes from '../assets/get-list-sizes';
import * as getListBoxComponents from '../components/grid-list-components/grid-list-components';
import ListBox from '../ListBox';
import ListBoxDisclaimer from '../components/ListBoxDisclaimer';
import InstanceContext from '../../../contexts/InstanceContext';

jest.mock('react-window-infinite-loader', () => ({
  __esModule: true,
  ...jest.requireActual('react-window-infinite-loader'),
  default: jest.fn(),
}));

jest.mock('@mui/material/styles', () => ({
  __esModule: true,
  ...jest.requireActual('@mui/material/styles'),
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useCallback: jest.fn(),
}));

describe('<Listbox />', () => {
  let args;
  let layout;
  let selections;
  let renderer;
  let render;
  let pages;
  let selectDisabled;
  let FixedSizeList;
  let FixedSizeGrid;
  let fetchStart;
  let useCallbackMock;
  let setTimeoutStub;
  let useSelectionsInteractions;

  beforeEach(() => {
    jest.useFakeTimers();

    setTimeoutStub = jest.fn();

    layout = {
      qSelectionInfo: { qInSelections: false },
      qListObject: {
        qSize: { qcy: 2 },
        qDimensionInfo: { qLocked: false, qIsOneAndOnlyOne: false },
        qStateCounts: { qSelected: 2, qSelectedExcluded: 10, qLocked: 0, qLockedExcluded: 0 },
      },
    };

    useSelectionsInteractions = jest.fn().mockReturnValue({
      instantPages: [],
      interactionEvents: {
        onMouseDown: () => {},
        onMouseUp: () => {},
        onMouseEnter: () => {},
      },
    });

    fetchStart = jest.fn();
    useCallbackMock = jest.fn().mockReturnValue({
      with: () => () => {},
    });

    // eslint-disable-next-line react/jsx-props-no-spreading
    FixedSizeList = jest.fn().mockImplementation((props) => <div className="a-value-row" {...props} />);
    // eslint-disable-next-line react/jsx-props-no-spreading
    FixedSizeGrid = jest.fn().mockImplementation((props) => <div className="a-column-row" {...props} />);

    jest.spyOn(useLayoutModule, 'default').mockImplementation(() => [layout]);
    jest.spyOn(React, 'useCallback').mockImplementation(useCallbackMock);
    jest.spyOn(useSelectionsInteractionsModule, 'default').mockImplementation(useSelectionsInteractions);
    jest.spyOn(useTextWidth, 'default').mockImplementation(() => 50);
    jest.spyOn(getListBoxComponents, 'default').mockReturnValue({
      List: FixedSizeList,
      Grid: FixedSizeGrid,
    });

    const sizes = {
      columnCount: 3,
      columnWidth: 100,
      rowCount: 100,
      overflowStyling: 100,
      itemSize: 25,
      listHeight: 200,
      scrollBarWidth: 10,
      count: 200,
      listCount: 100,
    };
    jest.spyOn(getListSizes, 'default').mockImplementation(() => sizes);

    jest.spyOn(reactWindowInfiniteLoaderModule, 'default').mockImplementation((props) => {
      const Component = props.children;
      // eslint-disable-next-line react/jsx-props-no-spreading
      return Component({ ...props, onItemsRendered: jest.fn() });
    });

    pages = [{ qArea: { qTop: 1, qHeight: 100 } }];
    global.window = { setTimeout: setTimeoutStub };
    selectDisabled = () => false;
    selections = { key: 'selections' };

    args = {
      model: {
        getListObjectData: jest.fn().mockResolvedValue(pages),
        id: 1234,
      },
      frequencyMode: 'N',
      histogram: false,
      selections,
      postProcessPages: undefined,
      calculatePagesHeight: false,
      keyboard: undefined,
      direction: 'ltr',
      showGray: undefined,
      height: 200,
      width: 100,
      scrollState: undefined,
      listLayout: 'vertical',
      update: jest.fn(),
      selectDisabled,
      fetchStart,
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Check rendering with different options', () => {
    beforeAll(() => {
      render = async (overrides = {}) => {
        const mergedArgs = { ...args, ...overrides };
        await act(async () => {
          renderer = create(
            <InstanceContext.Provider value={{ translator: { get: (s) => s, language: () => 'sv' } }}>
              <ListBox
                model={mergedArgs.model}
                frequencyMode={mergedArgs.frequencyMode}
                histogram={mergedArgs.histogram}
                keyboard={mergedArgs.keyboard}
                showGray={mergedArgs.showGray}
                selections={mergedArgs.selections}
                direction={mergedArgs.direction}
                height={mergedArgs.height}
                width={mergedArgs.width}
                listLayout={mergedArgs.listLayout}
                update={mergedArgs.update}
                selectDisabled={mergedArgs.selectDisabled}
                fetchStart={mergedArgs.fetchStart}
              />
            </InstanceContext.Provider>
          );
        });
      };
    });

    afterEach(() => {
      renderer.unmount();
    });

    test('should render and call stuff', async () => {
      await render();

      // check rendering
      const Container = renderer.root;
      const rows = Container.findAllByProps({ className: 'a-value-row' });
      const columns = Container.findAllByProps({ className: 'a-value-column' });
      expect(rows).toHaveLength(1);
      expect(columns).toHaveLength(0);
      expect(useSelectionsInteractions.mock.lastCall[0]).toMatchObject({
        layout,
        selections,
        pages: [],
        doc: expect.any(Object),
      });

      expect(useSelectionsInteractions.mock.calls[1][0].selectDisabled instanceof Function).toBe(true);
      expect(FixedSizeList.mock.calls.length).toBeGreaterThan(0);
    });

    test('should call useSelectionsInteractions', async () => {
      await render();

      expect(useSelectionsInteractions.mock.lastCall[0]).toMatchObject({
        layout,
        selections,
        pages: [],
        doc: expect.any(Object),
      });
    });

    test('should not call fetchStart unless fetching data', async () => {
      jest
        .spyOn(React, 'useRef')
        .mockImplementationOnce(() => ({
          loaderRef: {
            current: {
              _listRef: { state: { isScrolling: false } },
            },
          },
        }))
        .mockImplementationOnce((inp) => ({ current: inp }));

      await render();
      expect(fetchStart).not.toHaveBeenCalled();
      expect(setTimeoutStub).not.toHaveBeenCalled();

      const loadMoreItems = useCallbackMock.mock.lastCall[0];
      expect(loadMoreItems instanceof Function).toBe(true);
    });

    test('should call with checkboxes true', async () => {
      args.checkboxes = true;
      await render();

      expect(useSelectionsInteractions.mock.lastCall[0]).toMatchObject({
        layout,
        selections,
        pages: [],
        doc: expect.any(Object),
      });

      expect(FixedSizeList.mock.calls.length).toBeGreaterThan(0);
    });

    test('should use columns for horizontal layout', async () => {
      args.listLayout = 'horizontal';
      await render();
      expect(FixedSizeGrid.mock.calls.length).toBeGreaterThan(0);
      expect(FixedSizeList.mock.calls).toHaveLength(0);
    });

    test('should set isLocked to true', async () => {
      layout.qListObject.qDimensionInfo.qLocked = true;
      await render();
      expect(FixedSizeList.mock.calls.length).toBeGreaterThan(0);
      expect(FixedSizeGrid.mock.calls).toHaveLength(0);
    });

    test('should render a listbox when list count is >0', async () => {
      layout.qListObject.qSize.qcy = 1;
      await render();
      const disclaimers = renderer.root.findAllByType(ListBoxDisclaimer);
      expect(disclaimers).toHaveLength(0);
      const listRows = renderer.root.findAllByProps({ className: 'a-value-row' });
      expect(listRows).toHaveLength(1);
    });

    test('should render a disclaimer when list count is 0 but should still render a list component', async () => {
      layout.qListObject.qSize.qcy = 0;
      await render();
      const disclaimers = renderer.root.findAllByType(ListBoxDisclaimer);
      expect(disclaimers).toHaveLength(1);
      const listRows = renderer.root.findAllByProps({ className: 'a-value-row' });
      expect(listRows).toHaveLength(1);
    });
  });
});
