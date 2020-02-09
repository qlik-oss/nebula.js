import React, { forwardRef, useImperativeHandle } from 'react';
import { create, act } from 'react-test-renderer';

const TestHook = forwardRef(({ hook, hookProps = [] }, ref) => {
  const result = hook(...hookProps);
  useImperativeHandle(ref, () => ({
    result,
  }));
  return null;
});

describe('useAppSelectionsNavigation', () => {
  let sandbox;
  let renderer;
  let render;
  let ref;
  let useAppSelectionsNavigation;
  let currentSelectionsModel;
  let currentSelectionsLayout;
  let appLayout;
  before(() => {
    sandbox = sinon.createSandbox();
    currentSelectionsModel = {
      applyPatches: sandbox.stub(),
    };
    currentSelectionsLayout = {
      alternateStates: [],
    };
    appLayout = {
      qStateNames: [],
    };

    [{ default: useAppSelectionsNavigation }] = aw.mock(
      [
        [require.resolve('../useCurrentSelectionsModel'), () => () => [currentSelectionsModel]],
        [
          require.resolve('../useLayout'),
          () => ({
            __esModule: true,
            default: () => [currentSelectionsLayout],
            useAppLayout: () => [appLayout],
          }),
        ],
      ],
      ['../useAppSelectionsNavigation']
    );
  });
  beforeEach(() => {
    ref = React.createRef();
    render = async (rendererOptions = null) => {
      await act(async () => {
        renderer = create(<TestHook ref={ref} hook={useAppSelectionsNavigation} />, rendererOptions);
      });
    };
  });
  afterEach(() => {
    sandbox.restore();
    renderer.unmount();
  });

  it('should patch alternate states', async () => {
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
    expect(currentSelectionsModel.applyPatches).to.have.been.calledWithExactly(
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

  it('should set default navigation states', async () => {
    currentSelectionsLayout.qSelectionObject = {
      qBackCount: 2,
      qForwardCount: 5,
      qSelections: [{ qLocked: false }],
    };
    await render();
    expect(ref.current.result[0]).to.deep.equal({ canGoBack: true, canGoForward: true, canClear: true });
  });
});
