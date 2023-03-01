/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable no-import-assign */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { OutlinedInput } from '@mui/material';
import { createTheme, ThemeProvider } from '@nebula.js/ui/theme';
import * as InstanceContextModule from '../../../../contexts/InstanceContext';
import * as useDataStore from '../../hooks/useDataStore';

import ListBoxSearch from '../ListBoxSearch';

const InstanceContext = React.createContext();
const theme = createTheme('dark');

const create = (comp) => renderer.create(<ThemeProvider theme={theme}>{comp}</ThemeProvider>);

let selections = {};

const keyboard = { enabled: false, active: true };

const testRender = (model) =>
  create(
    <InstanceContext.Provider value={{ translator: { get: () => 'Search' } }}>
      <ListBoxSearch selections={selections} model={model} keyboard={keyboard} wildCardSearch />
    </InstanceContext.Provider>
  );

let model;
let keyEventDefaults;
let store;

describe('<ListBoxSearch />', () => {
  beforeEach(() => {
    InstanceContextModule.default = InstanceContext;

    store = { getStoreValue: jest.fn() };
    store.getStoreValue.mockImplementation((key) => {
      switch (key) {
        case 'listCount':
          return 321;
        default:
          return 'no data';
      }
    });

    jest.spyOn(useDataStore, 'default').mockImplementation(() => store);

    keyboard.enabled = false;
    keyboard.active = true;

    model = {
      searchListObjectFor: jest.fn().mockResolvedValue(true),
      acceptListObjectSearch: jest.fn(),
      abortListObjectSearch: jest.fn().mockResolvedValue(),
    };
    keyEventDefaults = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    };
    selections = {
      on: jest.fn(),
      removeListener: jest.fn(),
      isModal: jest.fn().mockReturnValue(false),
      begin: jest.fn().mockResolvedValue(),
      cancel: jest.fn().mockResolvedValue(),
      isActive: jest.fn().mockReturnValue(true),
      goModal: jest.fn().mockReturnValue(),
    };
  });

  afterEach(() => {
    // sinon.reset();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  test('should have default props', () => {
    const testRenderer = testRender(model);
    const testInstance = testRenderer.root;
    const types = testInstance.findAllByType(OutlinedInput);
    expect(types).toHaveLength(1);
    expect(types[0].props.fullWidth).toBe(true);
    expect(types[0].props.autoFocus).toBe(undefined);
    expect(types[0].props.placeholder).toBe('Search');
    expect(types[0].props.value).toBe('');
    expect(types[0].props.onChange instanceof Function).toBe(true);
    expect(types[0].props.onKeyDown instanceof Function).toBe(true);
    expect(types[0].props.inputProps.tabIndex).toBe(0);
  });

  test('should have css class `search`', () => {
    keyboard.enabled = true;
    keyboard.active = false;

    const testRenderer = testRender(model);
    const testInstance = testRenderer.root;
    const [input] = testInstance.findAllByType(OutlinedInput);
    const { className, inputProps } = input.props;
    expect(inputProps.tabIndex).toBe(-1);
    expect(typeof className).toBe('string');
    expect(className.split(' ').includes('search')).toBe(true);
  });

  test('should update `OutlinedInput` and search `onChange`', () => {
    const testRenderer = testRender(model);
    const testInstance = testRenderer.root;
    let type = testInstance.findByType(OutlinedInput);
    type.props.onChange({ target: { value: 'foo' } });
    testRenderer.update(
      <ThemeProvider theme={theme}>
        <InstanceContext.Provider value={{ translator: { get: () => 'Search' } }}>
          <ListBoxSearch selections={selections} model={model} keyboard={keyboard} />
        </InstanceContext.Provider>
      </ThemeProvider>
    );
    expect(model.searchListObjectFor).toHaveBeenCalledWith('/qListObjectDef', 'foo');
    type = testInstance.findByType(OutlinedInput);
    expect(type.props.value).toBe('foo');
  });

  test('should reset `OutlinedInput` and `acceptListObjectSearch` on `Enter`', async () => {
    const testRenderer = create(
      <InstanceContext.Provider value={{ translator: { get: () => 'Search' } }}>
        <ListBoxSearch selections={selections} model={model} keyboard={keyboard} />
      </InstanceContext.Provider>
    );
    const testInstance = testRenderer.root;
    const type = testInstance.findByType(OutlinedInput);

    await act(async () => {
      await type.props.onChange({ target: { value: 'foo' } });
    });
    expect(type.props.value).toBe('foo');

    await act(async () => {
      await type.props.onKeyDown({ ...keyEventDefaults, key: 'Enter' });
    });
    expect(model.acceptListObjectSearch).toHaveBeenCalledWith('/qListObjectDef', true);
    expect(type.props.value).toBe('');
  });

  test('should not accept search result if no hits', async () => {
    store.getStoreValue.mockReturnValue(0);
    const testRenderer = create(
      <InstanceContext.Provider value={{ translator: { get: () => 'Search' } }}>
        <ListBoxSearch selections={selections} model={model} keyboard={keyboard} />
      </InstanceContext.Provider>
    );
    const testInstance = testRenderer.root;
    const type = testInstance.findByType(OutlinedInput);

    await act(async () => {
      await type.props.onChange({ target: { value: 'no matches generated by this string' } });
    });
    expect(type.props.value).toBe('no matches generated by this string');

    await act(async () => {
      await type.props.onKeyDown({ ...keyEventDefaults, key: 'Enter' });
    });
    expect(model.acceptListObjectSearch.mock.calls).toHaveLength(0);
    expect(type.props.value).toBe('no matches generated by this string');
  });

  test('should call `cancel` on `Escape`', async () => {
    const testRenderer = testRender(model);
    const testInstance = testRenderer.root;
    const type = testInstance.findByType(OutlinedInput);
    await type.props.onChange({ target: { value: 'foo' } });
    expect(type.props.value).toBe('foo');
    await type.props.onKeyDown({ ...keyEventDefaults, key: 'Escape' });
    expect(selections.isActive).toHaveBeenCalledTimes(1);
    expect(selections.cancel).toHaveBeenCalledTimes(1);
    expect(model.abortListObjectSearch).not.toHaveBeenCalled();
    expect(type.props.value).toBe('foo'); // text is not reset in the test since "deactivated" is not triggered on cancel
  });

  test('should abort after performing a search and then removing the text', async () => {
    const testRenderer = testRender(model);
    const testInstance = testRenderer.root;
    const type = testInstance.findByType(OutlinedInput);
    await act(async () => {
      await type.props.onChange({ target: { value: 'foo' } });
    });
    expect(type.props.value).toBe('foo');
    expect(model.abortListObjectSearch).not.toHaveBeenCalled();
    selections.isModal.mockReturnValue(true); // so that abort will not be skipped
    await act(async () => {
      await type.props.onChange({ target: { value: '' } });
    });
    expect(type.props.value).toBe('');
    expect(model.abortListObjectSearch).toHaveBeenCalledTimes(1);
  });

  test('should not render if visible is false', () => {
    const testRenderer = create(
      <InstanceContext.Provider value={{ translator: { get: () => 'Search' } }}>
        <ListBoxSearch selections={selections} model={model} keyboard={keyboard} visible={false} />
      </InstanceContext.Provider>
    );
    const testInstance = testRenderer.root;
    const inputBoxes = testInstance.findAllByType(OutlinedInput);
    expect(inputBoxes).toHaveLength(0);
  });

  test('should not render if searchEnabled false', () => {
    const testRenderer = create(
      <InstanceContext.Provider value={{ translator: { get: () => 'Search' } }}>
        <ListBoxSearch selections={selections} model={model} keyboard={keyboard} searchEnabled={false} />
      </InstanceContext.Provider>
    );
    const testInstance = testRenderer.root;
    const inputBoxes = testInstance.findAllByType(OutlinedInput);
    expect(inputBoxes).toHaveLength(0);
  });

  test('should show wildcard on focus', async () => {
    const testRenderer = testRender(model);
    const testInstance = testRenderer.root;
    const type = testInstance.findByType(OutlinedInput);
    await act(async () => {
      await type.props.onFocus();
    });
    expect(type.props.value).toBe('**');
  });

  test('should not show wildcard on focus if wildCardSearch is false', async () => {
    const testRenderer = create(
      <InstanceContext.Provider value={{ translator: { get: () => 'Search' } }}>
        <ListBoxSearch selections={selections} model={model} keyboard={keyboard} wildCardSearch={false} />
      </InstanceContext.Provider>
    );
    const testInstance = testRenderer.root;
    const type = testInstance.findByType(OutlinedInput);
    await act(async () => {
      await type.props.onFocus();
    });
    expect(type.props.value).toBe('');
  });
});
