import getValueLabel from '../value-label';

describe('value label', () => {
  let translator;

  beforeEach(() => {
    translator = {
      get: jest.fn().mockImplementation((v, ...arr) => `${v} ${arr.join(' ')}`),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should state A and 1 of 10 was selected', () => {
    const s = getValueLabel({
      translator,
      label: 'A',
      qState: 'S',
      isSelected: false,
      currentIndex: 0,
      maxIndex: 9,
      showSearch: false,
    });
    expect(s).toEqual('A Object.Listbox.Selected . CurrentSelections.Of 1,10');
  });

  it('should not be surprised by peculiar states…', () => {
    const s = getValueLabel({
      translator,
      label: 'C',
      qState: 'O',
      isSelected: false,
      currentIndex: 0,
      maxIndex: 9,
      showSearch: false,
    });
    expect(s).toEqual('C Object.Listbox.Optional . CurrentSelections.Of 1,10');
  });

  it('…including locked state', () => {
    const s = getValueLabel({
      translator,
      label: 'C',
      qState: 'L',
      isSelected: false,
      currentIndex: 0,
      maxIndex: 9,
      showSearch: false,
    });
    expect(s).toEqual('C Object.Listbox.Locked . CurrentSelections.Of 1,10');
  });

  it('should add info about selections menu', () => {
    const s = getValueLabel({
      translator,
      label: 'B',
      qState: 'XS',
      isSelected: true,
      currentIndex: 1,
      maxIndex: 9,
      showSearch: true,
    });
    expect(s).toEqual(
      'B Object.Listbox.SelectedExcluded . CurrentSelections.Of 2,10. Listbox.ScreenReader.SearchThenSelectionsMenu.WithAccSelMenu'
    );
  });
});
