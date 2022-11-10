/* eslint-disable react/jsx-no-constructed-context-values */
import React from 'react';
import { create, act } from 'react-test-renderer';
import { IconButton, Grid, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@nebula.js/ui/theme';

describe('<ListboxInline />', () => {
  let sandbox;

  const app = { key: 'app' };
  const fieldIdentifier = { qLibraryId: 'qLibraryId' };
  const stateName = '$';

  let options;
  let ListBoxInline;
  let useState;
  let useEffect;
  let useCallback;
  let useRef;
  let model;
  let ActionsToolbar;
  let ListBoxSearch;
  let createListboxSelectionToolbar;
  let layout;
  let selections;
  let renderer;
  let render;
  let getListboxInlineKeyboardNavigation;

  const InstanceContext = React.createContext();

  before(() => {
    sandbox = sinon.createSandbox({ useFakeTimers: true });

    useState = sandbox.stub(React, 'useState');
    useEffect = sandbox.stub(React, 'useEffect');
    useCallback = sandbox.stub(React, 'useCallback');
    useRef = sandbox.stub(React, 'useRef');

    model = {
      key: 'model',
      lock: sandbox.stub(),
      unlock: sandbox.stub(),
    };

    ActionsToolbar = sandbox.stub();
    getListboxInlineKeyboardNavigation = sandbox.stub().returns('keyboard-navigation');
    ListBoxSearch = sandbox.stub();
    createListboxSelectionToolbar = sandbox.stub();
    layout = {
      title: 'title',
      qListObject: {
        qDimensionInfo: {
          qFallbackTitle: 'qFallbackTitle',
          qLocked: false,
          qStateCounts: { qSelected: 2, qSelectedExcluded: 10, qLocked: 0, qLockedExcluded: 0 },
        },
      },
    };

    [{ default: ListBoxInline }] = aw.mock(
      [
        [
          require.resolve('@mui/material'),
          () => ({
            IconButton,
            Grid,
            Typography,
          }),
        ],
        [
          require.resolve('react-virtualized-auto-sizer'),
          () =>
            function () {
              return <div data-testid="virtualized-auto-sizer" />;
            },
        ],
        [require.resolve('@nebula.js/ui/icons/unlock'), () => () => 'unlock'],
        [require.resolve('@nebula.js/ui/icons/lock'), () => () => 'lock'],
        [require.resolve('../../../contexts/InstanceContext'), () => InstanceContext],
        [require.resolve('../../../hooks/useLayout'), () => () => [layout]],
        [require.resolve('../../ActionsToolbar'), () => ActionsToolbar],
        [require.resolve('../ListBox'), () => <div className="theListBox" />],
        [require.resolve('../components/ListBoxSearch'), () => ListBoxSearch],
        [
          require.resolve('../interactions/listbox-keyboard-navigation'),
          () => ({
            getListboxInlineKeyboardNavigation,
          }),
        ],
        [require.resolve('../interactions/listbox-selection-toolbar'), () => createListboxSelectionToolbar],
      ],
      ['../ListBoxInline']
    );
  });

  beforeEach(() => {
    selections = {
      key: 'selections',
      isModal: sandbox.stub().returns(false),
      isActive: () => 'isActive',
      on: sandbox.stub().callsFake((event, func) => (eventTriggered) => {
        if (event === eventTriggered) func();
      }),
      off: sandbox.stub(),
    };

    options = {
      title: 'title',
      direction: 'vertical',
      listLayout: 'vertical',
      search: true,
      focusSearch: false,
      toolbar: true,
      element: 'element',
      properties: {},
      model,
      selections,
      update: undefined,
      fetchStart: 'fetchStart',
    };

    useState.callsFake((startValue) => [startValue, () => {}]);
    useRef.returns({ current: 'current' });
    createListboxSelectionToolbar.returns('actions');

    ActionsToolbar.returns('ActionsToolbar');
    ListBoxSearch.returns('ListBoxSearch');

    useEffect
      .onCall(0)
      .callsFake((effectFunc, watchArr) => {
        expect(watchArr[0].key).to.equal('selections');
        effectFunc();
      })
      .onCall(1)
      .callsFake((effectFunc) => {
        effectFunc();
      });

    useCallback
      .onCall(0)
      .callsFake((effectFunc, watchArr) => {
        expect(watchArr[0].key).to.equal('model');
        return effectFunc;
      })
      .onCall(1)
      .callsFake((effectFunc, watchArr) => {
        expect(watchArr[0].key).to.equal('model');
        return effectFunc;
      });
  });

  afterEach(() => {
    sandbox.reset();
    renderer.unmount();
  });

  after(() => {
    sandbox.restore();
  });

  describe('Check rendering with different options', () => {
    beforeEach(() => {
      const theme = createTheme('dark');

      render = async () => {
        await act(async () => {
          renderer = create(
            <ThemeProvider theme={theme}>
              <InstanceContext.Provider value={{ translator: { get: (s) => s, language: () => 'sv' } }}>
                <ListBoxInline app={app} fieldIdentifier={fieldIdentifier} stateName={stateName} options={options} />
              </InstanceContext.Provider>
            </ThemeProvider>
          );
        });
      };
    });

    it('should render with everything included', async () => {
      await render();
      const actionToolbars = renderer.root.findAllByType(ActionsToolbar);
      expect(actionToolbars.length).to.equal(1);

      const typographs = renderer.root.findAllByType(Typography);
      expect(typographs.length).to.equal(1);

      const autoSizers = renderer.root.findAllByProps({ 'data-testid': 'virtualized-auto-sizer' });
      expect(autoSizers.length).to.equal(1);

      const listBoxSearches = renderer.root.findAllByType(ListBoxSearch);
      expect(listBoxSearches).to.have.length(1);
      const showSearchButtons = renderer.root.findAllByType(IconButton);
      expect(showSearchButtons).to.have.length(1);
      expect(getListboxInlineKeyboardNavigation).calledOnce;
      // TODO: MUIv5
      // expect(renderer.toJSON().props.onKeyDown).to.equal('keyboard-navigation');

      expect(selections.on).calledTwice;
      expect(selections.on.args[0][0]).to.equal('deactivated');
      expect(selections.on.args[1][0]).to.equal('activated');
      expect(selections.off).not.called;
    });

    it('should render without toolbar', async () => {
      options.toolbar = false;
      await render();
      const actionToolbars = renderer.root.findAllByType(ActionsToolbar);
      expect(actionToolbars.length).to.equal(0);

      const typographs = renderer.root.findAllByType(Typography);
      expect(typographs.length).to.equal(0);

      const listBoxSearches = renderer.root.findAllByType(ListBoxSearch);
      expect(listBoxSearches.length, 'search is not part of toolbar').to.equal(1);
    });

    it('should render without toolbar', async () => {
      options.search = 'toggle';
      await render();
      expect(ListBoxSearch).to.have.been.calledWith(sinon.match({ visible: false }));
      expect(selections.on).calledTwice;
      expect(selections.isModal).calledOnce;
      expect(selections.on.args[0][0]).to.equal('deactivated');
      expect(selections.on.args[1][0]).to.equal('activated');
    });

    it('should render without search and show search button', async () => {
      options.search = false;
      await render();
      const actionToolbars = renderer.root.findAllByType(ActionsToolbar);
      expect(actionToolbars.length).to.equal(1);

      const typographs = renderer.root.findAllByType(Typography);
      expect(typographs.length).to.equal(1);

      expect(ListBoxSearch).to.have.been.calledWith(sinon.match({ visible: false }));
    });
  });
});
