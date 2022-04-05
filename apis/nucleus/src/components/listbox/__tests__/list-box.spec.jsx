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
  let useSelectionsInteractions;

  before(() => {
    sandbox = sinon.createSandbox({ useFakeTimers: true });

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

    FixedSizeList = sandbox.stub().callsFake((funcArgs) => {
      const { children } = funcArgs;
      const RowOrColumn = children;
      return <RowOrColumn index={funcArgs.itemCount} style={funcArgs.style} data={funcArgs.itemData} />;
    });

    [{ default: ListBox }] = aw.mock(
      [
        [require.resolve('react-window'), () => ({ FixedSizeList })],
        [require.resolve('../../../hooks/useLayout'), () => () => [layout]],
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
      rangeSelect: false,
      checkboxes: false,
      scrollTimeout: undefined,
      selectDisabled,
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
      render = async () => {
        await act(async () => {
          renderer = create(
            <ListBox
              selections={args.selections}
              direction={args.direction}
              height={args.height}
              width={args.width}
              rangeSelect={args.rangeSelect}
              listLayout={args.listLayout}
              update={args.update}
              checkboxes={args.checkboxes}
              scrollTimeout={args.scrollTimeout}
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
      args.rangeSelect = false;
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
        rangeSelect: false,
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

    it('should call useSelectionsInteractions with rangeSelect true', async () => {
      args.rangeSelect = true;
      await render();
      expect(useSelectionsInteractions.args[useSelectionsInteractions.callCount - 1][0]).to.containSubset({
        checkboxes: false,
        layout,
        selections,
        pages: [],
        rangeSelect: true,
        doc: 'document',
      });
    });

    it('should call with checkboxes true', async () => {
      args.checkboxes = true;
      await render();
      expect(useSelectionsInteractions.args[useSelectionsInteractions.callCount - 1][0]).to.containSubset({
        checkboxes: true,
        layout,
        selections,
        pages: [],
        rangeSelect: false,
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
