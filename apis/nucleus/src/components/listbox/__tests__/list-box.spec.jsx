import React from 'react';
import { create, act } from 'react-test-renderer';

describe('<Listbox />', () => {
  let sandbox;

  let args;
  let layout;
  let selections;
  let renderer;
  let ListBox;
  let render;
  let pages;
  let selectDisabled;
  let FixedSizeList;
  let fetchStart;
  let useCallbackStub;
  let setTimeoutStub;
  let useSelectionsInteractions;

  before(() => {
    sandbox = sinon.createSandbox({ useFakeTimers: true });

    setTimeoutStub = sandbox.stub();

    global.document = 'document';

    layout = {
      qSelectionInfo: { qInSelections: false },
      qListObject: {
        qSize: { qcy: 2 },
        qDimensionInfo: { qLocked: false, qIsOneAndOnlyOne: false },
        qStateCounts: { qSelected: 2, qSelectedExcluded: 10, qLocked: 0, qLockedExcluded: 0 },
      },
    };

    useSelectionsInteractions = sandbox.stub();

    fetchStart = sandbox.stub();
    useCallbackStub = sandbox.stub();

    FixedSizeList = sandbox.stub().callsFake((funcArgs) => {
      const { children } = funcArgs;
      const RowOrColumn = children;
      return <RowOrColumn index={funcArgs.itemCount} style={funcArgs.style} data={funcArgs.itemData} />;
    });

    [{ default: ListBox }] = aw.mock(
      [
        [require.resolve('react-window'), () => ({ FixedSizeList })],
        [require.resolve('../../../hooks/useLayout'), () => () => [layout]],
        [
          require.resolve('react'),
          () => ({
            ...React,
            useCallback: useCallbackStub,
          }),
        ],
        [require.resolve('../useSelectionsInteractions'), () => useSelectionsInteractions],
        [
          require.resolve('react-window-infinite-loader'),
          () => (props) => {
            const func = props.children;
            return func({ onItemsRendered: {} });
          },
        ],
        [
          require.resolve('../ListBoxRowColumn'),
          () =>
            function ({ checkboxes }) {
              return <div className={checkboxes ? 'a-value-column' : 'a-value-row'} />;
            },
        ],
      ],
      ['../ListBox']
    );
  });

  beforeEach(() => {
    pages = [{ qArea: { qTop: 1, qHeight: 100 } }];

    global.window = { setTimeout: setTimeoutStub };

    selectDisabled = () => false;

    useSelectionsInteractions.returns({
      instantPages: [],
      interactionEvents: {
        onMouseDown: () => {},
        onMouseUp: () => {},
        onMouseEnter: () => {},
      },
    });

    selections = { key: 'selections' };
    args = {
      model: {
        getListObjectData: sandbox.stub().resolves(pages),
      },
      selections,
      direction: 'ltr',
      height: 200,
      width: 100,
      listLayout: 'vertical',
      update: sandbox.stub(),
      checkboxes: false,
      selectDisabled,
      fetchStart,
    };
  });

  afterEach(() => {
    sandbox.reset();
  });

  after(() => {
    sandbox.restore();
  });

  describe('Check rendering with different options', () => {
    before(() => {
      render = async (overrides = {}) => {
        const mergedArgs = { ...args, ...overrides };
        await act(async () => {
          renderer = create(
            <ListBox
              selections={mergedArgs.selections}
              direction={mergedArgs.direction}
              height={mergedArgs.height}
              width={mergedArgs.width}
              listLayout={mergedArgs.listLayout}
              update={mergedArgs.update}
              checkboxes={mergedArgs.checkboxes}
              selectDisabled={mergedArgs.selectDisabled}
              fetchStart={mergedArgs.fetchStart}
            />
          );
        });
      };
    });

    afterEach(() => {
      sandbox.restore();
      renderer.unmount();
    });

    it('should render and call stuff', async () => {
      await render();

      // check rendering
      const fixedSizeLists = renderer.root.findAllByType(FixedSizeList);
      expect(fixedSizeLists.length).to.equal(1);

      const [Container] = fixedSizeLists;
      const rows = Container.findAllByProps({ className: 'a-value-row' });
      const columns = Container.findAllByProps({ className: 'a-value-column' });
      expect(rows.length).to.equal(1);
      expect(columns.length).to.equal(0);
      expect(useSelectionsInteractions.args[1][0]).to.containSubset({
        checkboxes: false,
        layout,
        selections,
        pages: [],
        doc: 'document',
      });
      expect(typeof useSelectionsInteractions.args[1][0].selectDisabled).to.equal('function');
      const { itemData } = FixedSizeList.args[FixedSizeList.callCount - 1][0];
      expect(itemData).to.containSubset({
        checkboxes: false,
        column: false,
        pages: [],
        isLocked: false,
      });

      expect(itemData.onMouseDown).to.be.a('function');
      expect(itemData.onMouseUp).to.be.a('function');
      expect(itemData.onMouseEnter).to.be.a('function');
      expect(itemData.onClick).to.equal(undefined);
    });

    it('should call useSelectionsInteractions', async () => {
      await render();
      expect(useSelectionsInteractions.args[useSelectionsInteractions.callCount - 1][0]).to.containSubset({
        checkboxes: false,
        layout,
        selections,
        pages: [],
        doc: 'document',
      });
    });

    it('should not call fetchStart unless fetching data', async () => {
      sandbox
        .stub(React, 'useRef')
        .onFirstCall()
        .returns({
          loaderRef: {
            current: {
              _listRef: { state: { isScrolling: false } },
            },
          },
        })
        .callsFake((inp) => ({ current: inp }));

      await render();
      expect(fetchStart).not.called;
      expect(setTimeoutStub).not.called;
      const loadMoreItems = useCallbackStub.args[1][0];
      expect(loadMoreItems).to.be.a('function');
    });

    it('should call with checkboxes true', async () => {
      args.checkboxes = true;
      await render();
      expect(useSelectionsInteractions.args[useSelectionsInteractions.callCount - 1][0]).to.containSubset({
        checkboxes: true,
        layout,
        selections,
        pages: [],
        doc: 'document',
      });
      const { itemData } = FixedSizeList.args[FixedSizeList.callCount - 1][0];
      expect(itemData).to.containSubset({
        checkboxes: true,
        column: false,
        pages: [],
      });
    });
    it('should use columns for horizontal layout', async () => {
      args.listLayout = 'horizontal';
      await render();
      const { itemData } = FixedSizeList.args[FixedSizeList.callCount - 1][0];
      expect(itemData).to.containSubset({
        checkboxes: false,
        column: true,
        pages: [],
      });
    });
    it('should set isLocked to true', async () => {
      layout.qListObject.qDimensionInfo.qLocked = true;
      await render();
      const { itemData } = FixedSizeList.args[FixedSizeList.callCount - 1][0];
      expect(itemData.isLocked).to.equal(true);
    });
  });
});
