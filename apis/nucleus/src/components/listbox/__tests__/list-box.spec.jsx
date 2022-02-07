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
        [require.resolve('../ListBoxRow'), () => () => <div className="a-value-row" />],
        [require.resolve('../ListBoxColumn'), () => () => <div className="a-value-column" />],
      ],
      ['../ListBox']
    );
  });

  beforeEach(() => {
    pages = [{ qArea: { qTop: 1, qHeight: 100 } }];

    useSelectionsInteractions.returns({
      instantPages: [],
      interactionEvents: { onMouseDown: () => {} },
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
      expect(useSelectionsInteractions.args[1][0]).to.deep.equal({
        layout,
        selections,
        pages: [],
        rangeSelect: false,
        doc: 'document',
      });
    });

    it('should call useSelectionsInteractions with rangeSelect true', async () => {
      args.rangeSelect = true;
      await render();
      expect(useSelectionsInteractions.args[useSelectionsInteractions.callCount - 1][0]).to.deep.equal({
        layout,
        selections,
        pages: [],
        rangeSelect: true,
        doc: 'document',
      });
    });
  });
});
