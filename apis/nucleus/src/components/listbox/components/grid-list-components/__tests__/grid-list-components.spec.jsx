import React from 'react';
import * as RowColumn from '../../ListBoxRowColumn';
import * as getFrequencyAllowed from '../frequency-allowed';
import * as deriveRenderOptions from '../derive-render-options';
import * as styledComponents from '../styled-components';

import getListBoxComponents from '../grid-list-components';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useCallback: jest.fn(),
}));

describe('grid-list-components', () => {
  let StyledFixedSizeList;
  let StyledFixedSizeGrid;
  let selectDisabled;
  let select;
  let confirm;
  let cancel;
  let response;
  let getFrequencyAllowedMock;
  let RowColumnMock;
  let deriveRenderOptionsMock;
  let styledComponentsMock;
  let onItemsRendered;

  beforeAll(() => {
    getFrequencyAllowedMock = jest.spyOn(getFrequencyAllowed, 'default');
    RowColumnMock = jest.spyOn(RowColumn, 'default');
    deriveRenderOptionsMock = jest.spyOn(deriveRenderOptions, 'default');
    styledComponentsMock = jest.spyOn(styledComponents, 'default');

    selectDisabled = jest.fn();
    select = jest.fn();
    confirm = jest.fn();
    cancel = jest.fn();
    onItemsRendered = jest.fn();
  });

  beforeEach(() => {
    getFrequencyAllowedMock.mockReturnValue(true);
    RowColumnMock.mockReturnValue(<div />);
    deriveRenderOptionsMock.mockReturnValue('renderOptions');

    StyledFixedSizeList = jest.fn();
    StyledFixedSizeGrid = jest.fn();

    styledComponentsMock.mockReturnValue({
      StyledFixedSizeList,
      StyledFixedSizeGrid,
    });

    response = getListBoxComponents({
      layout: {
        qListObject: { qDimensionInfo: { qLocked: false }, frequencyEnabled: true },
        layoutOptions: {
          layoutOrder: 'column',
        },
      },
      width: 100,
      textAlign: 'right',
      checkboxes: false,
      local: { current: { listRef: undefined } },
      isVertical: true,
      pages: 'pages',
      selectDisabled,
      freqIsAllowed: true,
      interactionEvents: {
        heyHey: 'hey hey',
      },
      frequencyMode: 'N',
      histogram: false,
      isSingleSelect: false,
      select,
      selections: {
        confirm,
        cancel,
      },
      keyboard: 'keyboard',
      showGray: true,
      scrollState: {
        setScrollPos: jest.fn(),
      },
      direction: 'ltr',
      sizes: {
        listHeight: 300,
        listCount: 100,
        itemHeight: 100,
        rowCount: 200,
        columnCount: 2,
        columnWidth: 50,
        frequencyWidth: 100,
        overflowStyling: {
          overflowX: 'hidden',
        },
        scrollBarWidth: 10,
        itemPadding: 4,
      },
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should create a List component', () => {
    const { List } = response;
    // const opts = List.mock.calls[0][0];
    // expect(opts).toEqual({});
    const listInst = List({ onItemsRendered, ref: 'ref' });
    expect(listInst).toMatchSnapshot();
  });

  it('should create a Grid component', () => {
    const { Grid } = response;
    // const opts = List.mock.calls[0][0];
    // expect(opts).toEqual({});
    const gridInst = Grid({ onItemsRendered, ref: 'ref' });
    expect(gridInst).toMatchSnapshot();
  });

  it('List item data should include actions', () => {
    const { List } = response;
    const listInst = List({ onItemsRendered, ref: 'ref' });

    expect(select.mock.calls).toHaveLength(0);
    expect(confirm.mock.calls).toHaveLength(0);
    expect(cancel.mock.calls).toHaveLength(0);

    listInst.props.itemData.actions.select();
    listInst.props.itemData.actions.confirm();
    listInst.props.itemData.actions.cancel();

    expect(select.mock.calls).toHaveLength(1);
    expect(confirm.mock.calls).toHaveLength(1);
    expect(cancel.mock.calls).toHaveLength(1);
  });

  it('Grid item data should include actions', () => {
    const { Grid } = response;
    const gridInst = Grid({ onItemsRendered, ref: 'ref' });

    expect(select.mock.calls).toHaveLength(0);
    expect(confirm.mock.calls).toHaveLength(0);
    expect(cancel.mock.calls).toHaveLength(0);

    gridInst.props.itemData.actions.select();
    gridInst.props.itemData.actions.confirm();
    gridInst.props.itemData.actions.cancel();

    expect(select.mock.calls).toHaveLength(1);
    expect(confirm.mock.calls).toHaveLength(1);
    expect(cancel.mock.calls).toHaveLength(1);
  });
});
