import React, { forwardRef, useImperativeHandle } from 'react';
import { create, act } from 'react-test-renderer';

const TestHook = forwardRef(({ hook, hookProps = [] }, ref) => {
  const result = hook(...hookProps);
  useImperativeHandle(ref, () => ({
    result,
  }));
  return null;
});

describe('useAppSelections', () => {
  let sandbox;
  let renderer;
  let render;
  let ref;
  let useAppSelections;
  let modalObjectStore;
  let app;
  let navState;
  let currentSelectionsModel;
  let currentSelectionsLayout;
  let appSel;
  let appModal;
  let object;
  let beginSelections;
  let endSelections;

  before(() => {
    sandbox = sinon.createSandbox();
    navState = {
      canGoForward: true,
      canGoBack: true,
      canClear: true,
    };
    currentSelectionsModel = sandbox.stub();
    currentSelectionsLayout = sandbox.stub();
    app = {
      id: 'appSel',
      session: {},
      abortModal: sandbox.stub(),
      forward: sandbox.stub(),
      back: sandbox.stub(),
      clearAll: sandbox.stub(),
      getField: sandbox.stub(),
    };
    modalObjectStore = {
      get: sandbox.stub(),
      set: sandbox.spy(),
      clear: sandbox.spy(),
    };
    [{ default: useAppSelections }] = aw.mock(
      [
        [
          require.resolve('../useAppSelectionsNavigation'),
          () => () => [navState, currentSelectionsModel, currentSelectionsLayout],
        ],
        [
          require.resolve('../../stores/selections-store'),
          () => ({
            useAppSelectionsStore: () => [
              {
                get: () => appSel,
                set: (k, v) => {
                  appSel = v;
                },
                dispatch: async (b) => {
                  if (!b) return;
                  await act(async () => {
                    renderer.update(<TestHook ref={ref} hook={useAppSelections} hookProps={[app]} />);
                  });
                },
              },
            ],
            objectSelectionsStore: {
              get: () => ({
                emit: sandbox.stub(),
              }),
            },
            appModalStore: {
              set: (k, v) => {
                appModal = v;
              },
            },
            modalObjectStore,
          }),
        ],
      ],
      ['../useAppSelections']
    );
  });
  beforeEach(() => {
    beginSelections = sandbox.stub();
    endSelections = sandbox.stub();
    object = {
      beginSelections,
      endSelections,
    };
    ref = React.createRef();
    render = async () => {
      await act(async () => {
        renderer = create(<TestHook ref={ref} hook={useAppSelections} hookProps={[app]} />);
      });
    };
  });
  afterEach(() => {
    sandbox.restore();
    renderer.unmount();
  });

  it('should create app selections', async () => {
    await render();

    expect(ref.current.result[0]).to.equal(appSel);
  });

  it('should retry failed beginSelections for error code 6003', async () => {
    await render();
    const res = Promise.resolve();
    // eslint-disable-next-line prefer-promise-reject-errors
    beginSelections.onFirstCall().returns(Promise.reject({ code: 6003 }));
    beginSelections.onSecondCall().returns(res);
    await appModal.begin(object);
    await res;

    expect(beginSelections.callCount).to.equal(2);
  });

  it('should not retry failed beginSelections', async () => {
    await render();

    // eslint-disable-next-line prefer-promise-reject-errors
    beginSelections.onFirstCall().returns(Promise.reject({ code: 9999 }));
    await appModal.begin(object);
  });

  it('should is in modal', async () => {
    await render();

    modalObjectStore.get.returns(false);
    expect(ref.current.result[0].isInModal()).to.equal(false);
    modalObjectStore.get.returns(true);
    expect(ref.current.result[0].isInModal()).to.equal(true);
  });

  it('should is modal', async () => {
    await render();
    const obj = {};
    modalObjectStore.get.returns(obj);
    expect(ref.current.result[0].isModal(obj)).to.equal(true);
    expect(ref.current.result[0].isModal({})).to.equal(false);
    expect(ref.current.result[0].isModal()).to.equal(true);
  });

  it('can go forward', async () => {
    await render();

    const res = await ref.current.result[0].canGoForward();
    expect(res).to.equal(true);
  });

  it('can go back', async () => {
    await render();
    const res = await ref.current.result[0].canGoBack();
    expect(res).to.equal(true);
  });

  it('can clear', async () => {
    await render();

    const res = await ref.current.result[0].canClear();
    expect(res).to.equal(true);
  });

  it('returns current selections layout', async () => {
    await render();

    const res = await ref.current.result[0].layout();
    expect(res).to.equal(currentSelectionsLayout);
  });

  it('forward', async () => {
    await render();
    sandbox.stub(appModal, 'end').returns(Promise.resolve());
    await ref.current.result[0].forward();
    expect(app.forward.callCount).to.equal(1);
  });

  it('back', async () => {
    await render();
    sandbox.stub(appModal, 'end').returns(Promise.resolve());
    await ref.current.result[0].back();
    expect(app.back.callCount).to.equal(1);
  });

  it('clear', async () => {
    await render();
    sandbox.stub(appModal, 'end').returns(Promise.resolve());
    await ref.current.result[0].clear();
    expect(app.clearAll.callCount).to.equal(1);
  });

  it('clear field', async () => {
    await render();
    sandbox.stub(appModal, 'end').returns(Promise.resolve());
    const clear = sandbox.spy();
    app.getField.returns(Promise.resolve({ clear }));
    await ref.current.result[0].clearField();
    expect(app.getField.callCount).to.equal(1);
    expect(clear.callCount).to.equal(1);
  });
});
