import React from 'react';
import getScreenReaderAssertiveText from '../assertive-screen-reader';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
}));

const getLayout = ({ qSelected = 0, qSelectedExcluded = 0, qLocked = 0, qLockedExcluded = 0 } = {}) => {
  const layout = {
    qListObject: {
      qDimensionInfo: {
        qStateCounts: {
          qSelected,
          qSelectedExcluded,
          qLocked,
          qLockedExcluded,
        },
      },
    },
  };
  return layout;
};

describe('getScreenReaderAssertiveText', () => {
  beforeEach(() => {
    const translator = {
      get: jest.fn().mockImplementation((v) => v),
    };
    jest.spyOn(React, 'useContext').mockReturnValue({ translator });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should state "zero" selected', () => {
    const text = getScreenReaderAssertiveText({
      layout: getLayout({ qSelected: 0, qSelectedExcluded: 0 }),
      searchInputText: '',
      listCount: 0,
    });
    expect(text).toEqual('ScreenReader.ZeroSelected');
  });

  it('should state "one" selected', () => {
    const text = getScreenReaderAssertiveText({
      layout: getLayout({ qSelected: 0, qSelectedExcluded: 1 }),
      searchInputText: '',
      listCount: 0,
    });
    expect(text).toEqual('ScreenReader.OneSelected');
  });

  it('should state "many" selected', () => {
    const text = getScreenReaderAssertiveText({
      layout: getLayout({ qSelected: 1, qSelectedExcluded: 1 }),
      searchInputText: '',
      listCount: 0,
    });
    expect(text).toEqual('ScreenReader.ManySelected');
  });

  it('should state "many" selected and "no search matches"', () => {
    const text = getScreenReaderAssertiveText({
      layout: getLayout({ qSelected: 1, qSelectedExcluded: 1 }),
      searchInputText: 'hey hey',
      listCount: 0,
    });
    expect(text).toEqual('Listbox.NoMatchesForYourTerms. ScreenReader.ManySelected');
  });

  it('should state "many" selected and "one search match"', () => {
    const text = getScreenReaderAssertiveText({
      layout: getLayout({ qSelected: 1, qSelectedExcluded: 1 }),
      searchInputText: 'hey hey',
      listCount: 1,
    });
    expect(text).toEqual('ScreenReader.OneSearchResult. ScreenReader.ManySelected');
  });

  it('should state "many" selected and "many search matches"', () => {
    const text = getScreenReaderAssertiveText({
      layout: getLayout({ qSelected: 1, qSelectedExcluded: 1 }),
      searchInputText: 'hey hey',
      listCount: 2,
    });
    expect(text).toEqual('ScreenReader.ManySearchResults. ScreenReader.ManySelected');
  });
});
