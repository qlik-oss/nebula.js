import React from 'react';
import { create, act } from 'react-test-renderer';
import * as reactWindowInfiniteLoaderModule from 'react-window-infinite-loader';
import * as styledModule from '@mui/material/styles';
import * as reactWindowModule from 'react-window';

import * as useLayoutModule from '../../../hooks/useLayout';
import * as useSelectionsInteractionsModule from '../hooks/selections/useSelectionsInteractions';
import * as ListBoxRowColumnModule from '../components/ListBoxRowColumn';
import ListBox from '../ListBox';
import InstanceContext from '../../../contexts/InstanceContext';

jest.mock('react-window-infinite-loader', () => ({
  __esModule: true,
  ...jest.requireActual('react-window-infinite-loader'),
  default: jest.fn(),
}));

jest.mock('react-window', () => ({
  __esModule: true,
  ...jest.requireActual('react-window'),
  FixedSizeList: jest.fn(),
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
  let fetchStart;
  let useCallbackMock;
  let setTimeoutStub;
  let useSelectionsInteractions;
  let infiniteProps;

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
    useCallbackMock = jest.fn();

    FixedSizeList = jest.fn().mockImplementation((funcArgs) => {
      const { children } = funcArgs;
      const RowOrColumn = children;
      return <RowOrColumn index={funcArgs.itemCount} style={funcArgs.style} data={funcArgs.itemData} />;
    });

    jest.spyOn(reactWindowModule, 'FixedSizeList').mockImplementation(FixedSizeList);
    jest.spyOn(useLayoutModule, 'default').mockImplementation(() => [layout]);
    jest.spyOn(React, 'useCallback').mockImplementation(useCallbackMock);
    jest.spyOn(useSelectionsInteractionsModule, 'default').mockImplementation(useSelectionsInteractions);

    jest.spyOn(reactWindowInfiniteLoaderModule, 'default').mockImplementation((props) => {
      const func = props.children;
      infiniteProps = props;
      return func({ onItemsRendered: jest.fn() });
    });
    jest
      .spyOn(ListBoxRowColumnModule, 'default')
      .mockImplementation(({ checkboxes }) => <div className={checkboxes ? 'a-value-column' : 'a-value-row'} />);
    jest.spyOn(styledModule, 'styled').mockImplementation((el) => () => el);

    pages = [{ qArea: { qTop: 1, qHeight: 100 } }];

    global.window = { setTimeout: setTimeoutStub };

    selectDisabled = () => false;

    selections = { key: 'selections' };
    args = {
      model: {
        getListObjectData: jest.fn().mockResolvedValue(pages),
      },
      selections,
      direction: 'ltr',
      height: 200,
      width: 100,
      listLayout: 'vertical',
      update: jest.fn(),
      checkboxes: false,
      selectDisabled,
      fetchStart,
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
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
      expect(rows.length).toBe(1);
      expect(columns.length).toBe(0);
      expect(useSelectionsInteractions.mock.lastCall[0]).toMatchObject({
        layout,
        selections,
        pages: [],
        doc: expect.any(Object),
      });

      expect(useSelectionsInteractions.mock.calls[1][0].selectDisabled instanceof Function).toBe(true);
      const { itemData } = FixedSizeList.mock.lastCall[0];
      expect(itemData).toMatchObject({
        column: false,
        pages: [],
        isLocked: false,
      });

      expect(itemData.onMouseDown instanceof Function).toBe(true);
      expect(itemData.onMouseUp instanceof Function).toBe(true);
      expect(itemData.onMouseEnter instanceof Function).toBe(true);
      expect(itemData.onClick).toBe(undefined);
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

      const { itemData } = FixedSizeList.mock.lastCall[0];
      expect(itemData).toMatchObject({
        column: false,
        pages: [],
      });
    });

    test('should use columns for horizontal layout', async () => {
      args.listLayout = 'horizontal';
      await render();
      const { itemData } = FixedSizeList.mock.lastCall[0];
      expect(itemData).toMatchObject({
        column: true,
        pages: [],
      });
    });

    test('should set isLocked to true', async () => {
      layout.qListObject.qDimensionInfo.qLocked = true;
      await render();
      const { itemData } = FixedSizeList.mock.lastCall[0];
      expect(itemData.isLocked).toBe(true);
    });

    // Skip for now: InfiniteLoader won't render when !listCount (ListBoxDisclaimer renders instead) - update the test later
    test.skip('should prevent InfiniteLoader to get itemCount == 0', async () => {
      layout.qListObject.qSize.qcy = 0;
      await render();
      expect(infiniteProps.itemCount).toBe(1);
    });
  });
});
