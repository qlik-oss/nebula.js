/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable no-import-assign */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import DrillDownIcon from '@nebula.js/ui/icons/drill-down';
import { createTheme, ThemeProvider } from '@nebula.js/ui/theme';
import Lock from '@nebula.js/ui/icons/lock';
import { unlock } from '@nebula.js/ui/icons/unlock';
import ListBoxHeader from '../ListBoxHeader';
import * as InstanceContextModule from '../../../../contexts/InstanceContext';
import * as ActionsToolbarModule from '../../../ActionsToolbar';
import * as HeaderComponents from '../ListBoxHeader/ListBoxHeaderComponents';
import * as hasSelectionsModule from '../../assets/has-selections';

const { StyledGridHeader, UnlockButton } = HeaderComponents;

const selections = {
  canClear: () => true,
  canConfirm: () => true,
  canCancel: () => true,
};
const styles = { content: {}, header: { color: 'red' }, selections: {}, search: {}, background: {} };
let rendererInst;

const translator = { get: jest.fn().mockImplementation((v) => v) };
const theme = createTheme('dark');

const model = {
  lock: jest.fn().mockImplementation(() => Promise.resolve()),
  unlock: jest.fn().mockImplementation(() => Promise.resolve()),
  selectListObjectAll: jest.fn(),
  selectListObjectPossible: jest.fn(),
  selectListObjectAlternative: jest.fn(),
  selectListObjectExcluded: jest.fn(),
};

function getDefaultProps() {
  const containerRef = React.createRef();
  const defaultProps = {
    layout: { title: 'The title', qListObject: { qDimensionInfo: { qLocked: false } } },
    translator,
    styles,
    isRtl: false,
    showLock: true,
    selectDisabled: () => false,
    showSearchIcon: 'toggle',
    isDrillDown: false,
    constraints: { active: false },
    onShowSearch: () => {},
    classes: { listBoxHeader: 'listBoxHeader' },
    containerRect: { width: 200 },
    isPopover: false,
    showToolbar: true,
    showDetachedToolbarOnly: false,
    containerRef,
    model,
    selectionState: {
      clearItemStates: jest.fn(),
    },
    isDirectQuery: false,
    selections,
    keyboard: { enabled: true },
    autoConfirm: false,
  };
  return defaultProps;
}

const InstanceContext = React.createContext();

let component;

const render = async (overrideProps = {}) => {
  const defaultProps = getDefaultProps();
  const mergedProps = { ...defaultProps, ...overrideProps };
  component = (
    <ThemeProvider theme={theme}>
      <InstanceContext.Provider value={{ translator }}>
        <ListBoxHeader {...mergedProps} />
      </InstanceContext.Provider>
    </ThemeProvider>
  );
  await act(() => {
    rendererInst = renderer.create(component);
  });
  return rendererInst;
};

let ActionsToolbar;

// Mock the useRef module
jest.mock('react', () => ({
  ...jest.requireActual('react'), // Use the actual implementation of React
  useRef: jest.fn(),
  useCallback: (func) => func,
}));

let HeaderTitle;
let hasSelections;

function HeaderTitleMock() {
  return <div />;
}

describe('<ListBoxHeader />', () => {
  beforeEach(() => {
    hasSelections = jest.spyOn(hasSelectionsModule, 'default').mockReturnValue(true);
    HeaderComponents.HeaderTitle = HeaderTitleMock;
    HeaderTitle = HeaderComponents.HeaderTitle;
    InstanceContextModule.default = InstanceContext;
    const ActionsToolbarElement = <div id="test-actions-toolbar" />;
    ActionsToolbar = jest.spyOn(ActionsToolbarModule, 'default').mockImplementation(() => ActionsToolbarElement);
    jest.spyOn(React, 'useRef').mockReturnValue({ current: { clientWidth: 100, scrollWidth: 100, offsetWidth: 100 } });
  });

  afterEach(() => {
    jest.resetAllMocks();
    rendererInst.unmount();
    jest.restoreAllMocks();
  });

  test('should render the header with title and attached actions toolbar', async () => {
    const testRenderer = await render();
    const testInstance = testRenderer.root;

    // Find by type.
    const titles = testInstance.findAllByType(HeaderTitle);
    const drillDowns = testInstance.findAllByType(DrillDownIcon);
    const actionsToolbars = testInstance.findAllByType(ActionsToolbar);
    const locks = testInstance.findAllByType(Lock);
    const unlocks = testInstance.findAllByType(unlock);

    // Check existence.
    expect(titles).toHaveLength(1);
    expect(drillDowns).toHaveLength(0);
    expect(actionsToolbars).toHaveLength(1);
    expect(locks).toHaveLength(0);
    expect(unlocks).toHaveLength(0);

    // Dig in to Title.
    const titleProps = titles[0].props;
    expect(titleProps.title).toEqual('The title');
    expect(titleProps.children).toEqual('The title');
    expect(titleProps.styles.header.color).toEqual('red');
  });

  test('should render a detached toolbar when told to do so', async () => {
    const testRenderer = await render({ showDetachedToolbarOnly: true });
    const testInstance = testRenderer.root;

    const titles = testInstance.findAllByType(HeaderTitle);
    const actionsToolbars = testInstance.findAllByType(ActionsToolbar);
    const styledGridHeaders = testInstance.findAllByType(StyledGridHeader);

    // Check existence.
    expect(titles).toHaveLength(0);
    expect(actionsToolbars).toHaveLength(1);
    expect(styledGridHeaders).toHaveLength(0);

    // Dig in to const actionsToolbar props
    expect(actionsToolbars[0].props.isDetached).toEqual(true);
  });

  test('should render a detached toolbar when space is limited', async () => {
    const containerRect = { width: 20 };
    const testRenderer = await render({ showDetachedToolbarOnly: false, containerRect });
    const testInstance = testRenderer.root;

    const titles = testInstance.findAllByType(HeaderTitle);
    const actionsToolbars = testInstance.findAllByType(ActionsToolbar);
    const styledGridHeaders = testInstance.findAllByType(StyledGridHeader);

    // Check existence.
    expect(titles).toHaveLength(1);
    expect(actionsToolbars).toHaveLength(1);
    expect(styledGridHeaders).toHaveLength(1);

    // Verify it is detached.
    expect(actionsToolbars[0].props.isDetached).toEqual(true);
  });

  test('trigger toggle search field when pressing search icon in toggle mode', async () => {
    const onShowSearch = jest.fn();
    const testRenderer = await render({ search: 'toggle', onShowSearch });
    const testInstance = testRenderer.root;

    const searchButton = testInstance.findByProps({ 'data-testid': 'search-toggle-btn' });

    // Check existence.
    expect(searchButton).toBeTruthy();
    expect(onShowSearch).toHaveBeenCalledTimes(0);

    // Trigger toggle search and verify it was called.
    await act(() => {
      searchButton.props.onClick();
    });
    expect(onShowSearch).toHaveBeenCalledTimes(1);
  });

  test('There should be a lock button inside the actions toolbar', async () => {
    hasSelections.mockReturnValue(true);
    const testRenderer = await render({ showSearchIcon: false, showLock: true, isPopover: true });
    const testInstance = testRenderer.root;

    const [actionsToolbar] = testInstance.findAllByType(ActionsToolbar);
    const unlockCoverButtons = testInstance.findAllByType(UnlockButton);

    // Check existence.
    const btns = actionsToolbar.props.extraItems;
    expect(btns).toHaveLength(1);
    expect(btns[0].key).toEqual('lock');
    expect(btns[0].enabled()).toEqual(true);

    // Ensure unlock is not visible
    expect(unlockCoverButtons).toHaveLength(0);
  });

  test('There should be an unlock cover button on top of the actions toolbar', async () => {
    const layout = { title: 'The title', qListObject: { qDimensionInfo: { qLocked: true } } };
    hasSelections.mockReturnValue(false);
    const testRenderer = await render({
      layout,
      showSearchIcon: false,
      showLock: true,
      isPopover: true,
    });
    const testInstance = testRenderer.root;
    const unlockCoverButtons = testInstance.findAllByType(UnlockButton);

    // Ensure unlock is visible
    expect(unlockCoverButtons).toHaveLength(1);
  });
});
