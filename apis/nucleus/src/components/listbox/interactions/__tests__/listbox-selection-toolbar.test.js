import createListboxSelectionToolbar from '../listbox-selection-toolbar';

describe('getScrollIndex', () => {
  let layout;
  let model;
  let translator;
  let selectionState;
  let isDirectQuery;

  afterEach(() => {
    jest.resetAllMocks();
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    isDirectQuery = false;
    layout = {
      qListObject: {
        qDimensionInfo: {
          qStateCounts: {
            qOption: 2,
            qAlternative: 2,
            qExcluded: 2,
            qDeselected: 2,
          },
          qIsOneAndOnlyOne: false,
        },
      },
    };
    model = {
      selectListObjectAll: jest.fn(),
      selectListObjectPossible: jest.fn(),
      selectListObjectAlternative: jest.fn(),
      selectListObjectExcluded: jest.fn(),
    };
    translator = {
      get: jest.fn((t) => t),
    };
    selectionState = {
      clearItemStates: jest.fn(),
    };
  });

  const create = (overrides = {}) =>
    createListboxSelectionToolbar({
      layout,
      model,
      translator,
      selectionState,
      isDirectQuery,
      ...overrides,
    });

  it('should create all actions', () => {
    const actions = create();
    expect(actions).toHaveLength(4);

    const [all, possible, alternative, excluded] = actions;

    expect(all).toMatchObject({ key: 'selectAll', label: 'Selection.SelectAll', type: 'menu-icon-button' });
    expect(possible).toMatchObject({
      key: 'selectPossible',
      label: 'Selection.SelectPossible',
      type: 'menu-icon-button',
    });
    expect(alternative).toMatchObject({
      key: 'selectAlternative',
      label: 'Selection.SelectAlternative',
      type: 'menu-icon-button',
    });
    expect(excluded).toMatchObject({
      key: 'selectExcluded',
      label: 'Selection.SelectExcluded',
      type: 'menu-icon-button',
    });

    expect(all.enabled()).toEqual(true);
    expect(possible.enabled()).toEqual(true);
    expect(alternative.enabled()).toEqual(true);
    expect(excluded.enabled()).toEqual(true);
  });

  it('should not create any actions if single select', () => {
    layout.qListObject.qDimensionInfo.qIsOneAndOnlyOne = true;
    const actions = create({ layout });
    expect(actions).toEqual([]);
  });

  it('should only create two actions in direct query mode', () => {
    const actions = create({ isDirectQuery: true });
    expect(actions).toHaveLength(2);

    const [all, possible] = actions;

    expect(all).toMatchObject({ key: 'selectAll', label: 'Selection.SelectAll', type: 'menu-icon-button' });
    expect(possible).toMatchObject({
      key: 'selectPossible',
      label: 'Selection.SelectPossible',
      type: 'menu-icon-button',
    });
  });

  describe('test each action', () => {
    let all;
    let possible;
    let alternative;
    let excluded;

    beforeEach(() => {
      const actions = create();
      [all, possible, alternative, excluded] = actions;

      expect(selectionState.clearItemStates).not.toHaveBeenCalled();
    });

    afterEach(() => {
      expect(selectionState.clearItemStates).toHaveBeenCalledTimes(1);
    });

    it('select all', () => {
      all.action();
      expect(model.selectListObjectAll).toHaveBeenCalledTimes(1);
      expect(model.selectListObjectAll).toBeCalledWith('/qListObjectDef');
    });
    it('select possible', () => {
      possible.action();
      expect(model.selectListObjectPossible).toHaveBeenCalledTimes(1);
      expect(model.selectListObjectPossible).toBeCalledWith('/qListObjectDef');
    });
    it('select alternative', () => {
      alternative.action();
      expect(model.selectListObjectAlternative).toHaveBeenCalledTimes(1);
      expect(model.selectListObjectAlternative).toBeCalledWith('/qListObjectDef');
    });
    it('select excluded', () => {
      excluded.action();
      expect(model.selectListObjectExcluded).toHaveBeenCalledTimes(1);
      expect(model.selectListObjectExcluded).toBeCalledWith('/qListObjectDef');
    });
  });
});
