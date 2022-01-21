import React from 'react';
import { create, act } from 'react-test-renderer';

describe('<Listbox />', () => {
  let sandbox;

  let args;
  let layout;
  let selectValues;
  let selections;
  let renderer;
  let ListBox;
  let render;
  let pages;
  let FixedSizeList;

  before(() => {
    sandbox = sinon.createSandbox({ useFakeTimers: true });

    selectValues = sandbox.stub();

    layout = {
      qSelectionInfo: { qInSelections: false },
      qListObject: {
        qSize: { qcy: 2 },
        qDimensionInfo: { qLocked: false, qIsOneAndOnlyOne: false },
        qStateCounts: { qSelected: 2, qSelectedExcluded: 10, qLocked: 0, qLockedExcluded: 0 },
      },
    };

    FixedSizeList = sandbox.stub().callsFake((funcArgs) => {
      const { children } = funcArgs;
      const RowOrColumn = children;
      return <RowOrColumn index={funcArgs.itemCount} style={funcArgs.style} data={funcArgs.itemData} />;
    });

    [{ default: ListBox }] = aw.mock(
      [
        [require.resolve('react-window'), () => ({ FixedSizeList })],
        [require.resolve('../../../hooks/useLayout'), () => () => [layout]],
        [require.resolve('../listbox-selections'), () => ({ selectValues })],
        [
          require.resolve('react-window-infinite-loader'),
          () => (props) => {
            const func = props.children;
            return func({ onItemsRendered: {}, ref: {} });
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
    };
  });

  afterEach(() => {
    sandbox.reset();
  });

  after(() => {
    sandbox.restore();
  });

  describe('Check rendering with different options', () => {
    beforeEach(() => {
      render = async () => {
        await act(async () => {
          renderer = create(
            <ListBox
              selections={args.selections}
              direction={args.direction}
              height={args.height}
              width={args.width}
              listLayout={args.listLayout}
              update={args.update}
            />
          );
        });
      };
    });

    afterEach(() => {
      sandbox.reset();
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

      // onClick with valid numbers should call selectValues
      const { onClick } = Container.props.itemData;
      expect(selectValues).not.called;
      onClick({
        currentTarget: { getAttribute: () => 1 },
      });
      expect(selectValues).calledOnce.calledWithExactly({
        selections,
        elemNumbers: [1],
        isSingleSelect: false,
      });

      // Test on click with NaN values
      selectValues.reset();
      expect(selectValues).not.called;
      onClick({
        currentTarget: { getAttribute: () => NaN },
      });
      expect(selectValues).not.called;
    });
  });
});
