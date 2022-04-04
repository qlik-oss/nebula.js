/* eslint-disable react/jsx-no-constructed-context-values */
import React from 'react';
import { create, act } from 'react-test-renderer';
import { IconButton, Grid, Typography } from '@material-ui/core';

describe('<ListboxInline />', () => {
  let sandbox;

  const app = { key: 'app' };
  const fieldIdentifier = { qLibraryId: 'qLibraryId' };
  const stateName = '$';
  let customSelectionsKey;
  let customSessionModelKey;

  let options;
  let ListBoxInline;
  let useState;
  let useEffect;
  let useCallback;
  let useRef;
  let sessionModel;
  let ActionsToolbar;
  let ListBoxSearch;
  let createListboxSelectionToolbar;
  let useTheme;
  let theme;
  let layout;
  let useSessionModel;
  let useObjectSelections;
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
    useSessionModel = sandbox.stub();
    useObjectSelections = sandbox.stub();

    sessionModel = {
      key: 'session-model',
      lock: sandbox.stub(),
      unlock: sandbox.stub(),
    };

    ActionsToolbar = sandbox.stub();
    getListboxInlineKeyboardNavigation = sandbox.stub().returns('keyboard-navigation');
    ListBoxSearch = sandbox.stub();
    createListboxSelectionToolbar = sandbox.stub();
    useTheme = sandbox.stub();
    theme = {
      spacing: sandbox.stub(),
      palette: { divider: 'red' },
    };
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
          require.resolve('@material-ui/core'),
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
        [require.resolve('@nebula.js/ui/theme'), () => ({ makeStyles: () => () => ({ icon: 'icon' }), useTheme })],
        [require.resolve('../../../contexts/InstanceContext'), () => InstanceContext],
        [require.resolve('../../../hooks/useObjectSelections'), () => useObjectSelections],
        [require.resolve('../../../hooks/useSessionModel'), () => useSessionModel],
        [require.resolve('../../../hooks/useLayout'), () => () => [layout]],
        [require.resolve('../../ActionsToolbar'), () => ActionsToolbar],
        [require.resolve('../ListBox'), () => <div className="TheListBox" />],
        [require.resolve('../ListBoxSearch'), () => ListBoxSearch],
        [
          require.resolve('../listbox-keyboard-navigation'),
          () => ({
            getListboxInlineKeyboardNavigation,
          }),
        ],
        [require.resolve('../listbox-selection-toolbar'), () => createListboxSelectionToolbar],
      ],
      ['../ListBoxInline']
    );
  });

  beforeEach(() => {
    selections = {
      key: 'selections',
      isModal: () => false,
      isActive: () => 'isActive',
      on: sandbox.stub().callsFake((event, func) => (eventTriggered) => {
        if (event === eventTriggered) func();
      }),
      off: sandbox.stub(),
    };
    useSessionModel.returns([sessionModel]);
    useObjectSelections.returns([selections]);

    options = {
      title: 'title',
      direction: 'vertical',
      listLayout: 'vertical',
      search: true,
      focusSearch: false,
      toolbar: true,
      properties: {},
      sessionModel: undefined,
      selectionsApi: undefined,
      update: undefined,
    };

    theme.spacing.returns('padding');
    useState.callsFake((startValue) => [startValue, () => {}]);
    useRef.returns({ current: 'current' });
    useTheme.returns(theme);
    createListboxSelectionToolbar.returns('actions');

    ActionsToolbar.returns('ActionsToolbar');
    ListBoxSearch.returns('ListBoxSearch');

    useEffect
      .onCall(0)
      .callsFake((effectFunc, watchArr) => {
        expect(watchArr[0].key).to.equal(customSelectionsKey || 'selections');
        effectFunc();
      })
      .onCall(1)
      .callsFake((effectFunc, watchArr) => {
        expect(watchArr[0].key).to.equal(customSelectionsKey || 'selections');
        effectFunc();
      });

    useCallback
      .onCall(0)
      .callsFake((effectFunc, watchArr) => {
        expect(watchArr[0].key).to.equal(customSessionModelKey || 'session-model');
        return effectFunc;
      })
      .onCall(1)
      .callsFake((effectFunc, watchArr) => {
        expect(watchArr[0].key).to.equal(customSessionModelKey || 'session-model');
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
      render = async () => {
        await act(async () => {
          renderer = create(
            <InstanceContext.Provider value={{ translator: { get: (s) => s, language: () => 'sv' } }}>
              <ListBoxInline app={app} fieldIdentifier={fieldIdentifier} stateName={stateName} options={options} />
            </InstanceContext.Provider>
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

      expect(useSessionModel).calledOnce;
      expect(useSessionModel.args[0][1], 'app should not be null as when using a custom sessionModel').to.deep.equal({
        key: 'app',
      });
      expect(useObjectSelections).calledOnce;

      const listBoxSearches = renderer.root.findAllByType(ListBoxSearch);
      expect(listBoxSearches).to.have.length(1);
      const showSearchButtons = renderer.root.findAllByType(IconButton);
      expect(showSearchButtons).to.have.length(1);
      expect(getListboxInlineKeyboardNavigation).calledOnce;
      expect(renderer.toJSON().props.onKeyDown).to.equal('keyboard-navigation');

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
      const listBoxSearches = renderer.root.findAllByType(ListBoxSearch);
      expect(listBoxSearches.length, 'search should be hidden initially').to.equal(0);
    });

    it('should render without search and show search button', async () => {
      options.search = false;
      await render();
      const actionToolbars = renderer.root.findAllByType(ActionsToolbar);
      expect(actionToolbars.length).to.equal(1);

      const typographs = renderer.root.findAllByType(Typography);
      expect(typographs.length).to.equal(1);

      const listBoxSearches = renderer.root.findAllByType(ListBoxSearch);
      expect(listBoxSearches.length).to.equal(0);
    });

    it('should use provided frequencyMode', async () => {
      options.frequencyMode = 'value';
      await render();
      expect(
        useSessionModel.args[0][0].qListObjectDef.qFrequencyMode,
        'app should use provided frequencyMode'
      ).to.equal('V');
    });

    it('should default to none if provided frequencyMode is invalid', async () => {
      options.frequencyMode = 'invalid value';
      await render();
      expect(
        useSessionModel.args[0][0].qListObjectDef.qFrequencyMode,
        'app should default to none frequencyMode'
      ).to.equal('N');
    });

    it('should get frequency value if histogram is enabled', async () => {
      options.frequencyMode = 'none';
      options.histogram = true;
      await render();
      expect(useSessionModel.args[0][0].qListObjectDef.qFrequencyMode, 'app should use freuency value').to.equal('V');
    });

    it('should use a custom selectionsApi and sessionModel', async () => {
      const isModal = sandbox.stub();
      const on = sandbox.stub();
      const isActive = sandbox.stub();
      customSelectionsKey = 'custom-selections';
      customSessionModelKey = 'custom-session-model';
      options.selectionsApi = {
        key: 'custom-selections',
        isModal,
        on,
        isActive,
      };
      options.sessionModel = {
        key: 'custom-session-model',
        lock: sandbox.stub(),
        unlock: sandbox.stub(),
      };
      await render();

      const actionToolbars = renderer.root.findAllByType(ActionsToolbar);
      expect(actionToolbars.length).to.equal(1);

      expect(isModal).calledOnce;
      expect(selections.on, 'should not use default selections api').not.called;
      expect(on, 'should use custom selections api').calledTwice;
      expect(isActive).calledOnce;
      expect(useSessionModel).calledOnce;
      expect(useSessionModel.args[0][1], 'app should be null to prevent unncessary rendering').to.equal(null);
      expect(useObjectSelections).calledOnce;
      const [, ourSessionModel] = useObjectSelections.args[0];
      expect(ourSessionModel.key, 'should use custom session model').to.equal('custom-session-model');
    });
  });
});
