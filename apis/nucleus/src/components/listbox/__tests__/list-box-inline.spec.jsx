import React from 'react';
import { IconButton, Grid, Typography } from '@material-ui/core';

describe('<ListboxInline />', () => {
  let sandbox;
  const app = {};
  const fieldIdentifier = { qLibraryId: 'qLibraryId' };
  const stateName = '$';
  const options = {
    title: 'title',
    direction: 'vertical',
    listLayout: 'vertical',
    search: true,
    toolbar: true,
    properties: {},
  };

  let ListBoxInline;
  let useState;
  let useEffect;
  let useCallback;
  let useContext;
  let useRef;
  let sessionModel;
  let selections;
  let ActionsToolbar;
  let ListBoxSearch;
  let createListboxSelectionToolbar;
  let useTheme;
  let theme;
  let layout;

  before(() => {
    sandbox = sinon.createSandbox({ useFakeTimers: true });

    useState = sandbox.stub(React, 'useState');
    useEffect = sandbox.stub(React, 'useEffect');
    useCallback = sandbox.stub(React, 'useCallback');
    useContext = sandbox.stub(React, 'useContext');
    useRef = sandbox.stub(React, 'useRef');

    sessionModel = {
      lock: sandbox.stub(),
      unlock: sandbox.stub(),
    };

    selections = {
      key: 'selections',
      isModal: () => false,
      isActive: () => 'isActive',
      on: sandbox.stub().callsFake((event, func) => (eventTriggered) => {
        if (event === eventTriggered) func();
      }),
    };
    ActionsToolbar = sandbox.stub();
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

    [{ ListBoxInline }] = aw.mock(
      [
        [
          require.resolve('@material-ui/core'),
          () => ({
            IconButton,
            Grid,
            Typography,
          }),
        ],
        [require.resolve('react-virtualized-auto-sizer'), () => (props) => props.children],
        [require.resolve('@nebula.js/ui/icons/unlock'), () => () => 'unlock'],
        [require.resolve('@nebula.js/ui/icons/lock'), () => () => 'lock'],
        [require.resolve('@nebula.js/ui/theme'), () => ({ makeStyles: () => () => ({ icon: 'icon' }), useTheme })],
        [require.resolve('../../../contexts/InstanceContext'), () => 'context'],
        [require.resolve('../../../hooks/useObjectSelections'), () => () => [selections]],
        [require.resolve('../../../hooks/useSessionModel'), () => () => [sessionModel]],
        [require.resolve('../../../hooks/useLayout'), () => () => [layout]],
        [require.resolve('../../ActionsToolbar'), () => ActionsToolbar],
        [require.resolve('../ListBoxSearch'), () => ListBoxSearch],
        [require.resolve('../listbox-selection-toolbar'), () => createListboxSelectionToolbar],
      ],
      ['../ListBoxInline']
    );
  });

  beforeEach(() => {
    theme.spacing.returns('padding');
    useState.callsFake((startValue) => [startValue, () => {}]);
    useContext.returns({ translator: 'translator' });
    useRef.returns({ current: 'current' });
    useTheme.returns(theme);
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
      .callsFake((effectFunc, watchArr) => {
        expect(watchArr[0].key).to.equal('selections');
        effectFunc();
      });

    useCallback
      .onCall(0)
      .callsFake((effectFunc, watchArr) => {
        expect(watchArr).to.deep.equal([sessionModel]);
        return effectFunc;
      })
      .onCall(1)
      .callsFake((effectFunc, watchArr) => {
        expect(watchArr).to.deep.equal([sessionModel]);
        return effectFunc;
      });
  });

  afterEach(() => {
    sandbox.reset();
  });

  after(() => {
    sandbox.restore();
  });

  it('should call expected stuff', () => {
    const response = ListBoxInline({ app, fieldIdentifier, stateName, options });

    expect(response).to.be.an('object');
    expect(useEffect).calledTwice;
    expect(useState).calledOnce.calledWith(false);
    expect(useCallback).calledTwice;
    expect(theme.spacing).calledOnce;
    expect(sessionModel.lock).not.called;
    expect(sessionModel.unlock).not.called;
    expect(selections.on).calledTwice;
  });
});
