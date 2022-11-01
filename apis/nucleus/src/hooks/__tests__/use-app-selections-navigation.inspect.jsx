import React, { forwardRef, useImperativeHandle } from 'react';
import { create, act } from 'react-test-renderer';

import * as useLayoutModule from '../useLayout';
import * as useCurrentSelectionsModelModule from '../useCurrentSelectionsModel';
import useAppSelectionsNavigation from '../useAppSelectionsNavigation';

const TestHook = forwardRef(({ hook, hookProps = [] }, ref) => {
  const result = hook(...hookProps);
  useImperativeHandle(ref, () => ({
    result,
  }));
  return null;
});

describe('useAppSelectionsNavigation', () => {
  let renderer;
  let render;
  let ref;
  let currentSelectionsModel;
  let currentSelectionsLayout;
  let appLayout;

  beforeEach(() => {
    currentSelectionsModel = {
      applyPatches: jest.fn(),
    };
    currentSelectionsLayout = {
      alternateStates: [],
    };
    appLayout = {
      qStateNames: [],
    };

    jest.spyOn(useCurrentSelectionsModelModule, 'default').mockImplementation(() => [currentSelectionsModel]);
    jest.spyOn(useLayoutModule, 'default').mockImplementation(() => [currentSelectionsLayout]);
    jest.spyOn(useLayoutModule, 'useAppLayout').mockImplementation(() => [appLayout]);

    ref = React.createRef();
    render = async (rendererOptions = null) => {
      await act(async () => {
        renderer = create(<TestHook ref={ref} hook={useAppSelectionsNavigation} />, rendererOptions);
      });
    };
  });
  afterEach(() => {
    renderer.unmount();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should patch alternate states', async () => {
    appLayout.qStateNames = ['foo'];
    const states = [
      {
        stateName: 'foo',
        qSelectionObjectDef: {
          qStateName: 'foo',
        },
      },
    ];
    await render();
    expect(currentSelectionsModel.applyPatches).toHaveBeenCalledWith(
      [
        {
          qOp: 'replace',
          qPath: '/alternateStates',
          qValue: JSON.stringify(states),
        },
      ],
      true
    );
  });

  test('should set default navigation states', async () => {
    currentSelectionsLayout.qSelectionObject = {
      qBackCount: 2,
      qForwardCount: 5,
      qSelections: [{ qLocked: false }],
    };
    await render();
    expect(ref.current.result[0]).toEqual({ canGoBack: true, canGoForward: true, canClear: true });
  });
});
