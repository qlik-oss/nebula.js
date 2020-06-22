import React, { forwardRef, useImperativeHandle } from 'react';
import { create, act } from 'react-test-renderer';

const TestHook = forwardRef(({ hook, hookProps = [] }, ref) => {
  const result = hook(...hookProps);
  useImperativeHandle(ref, () => ({
    result,
  }));
  return null;
});

describe('useObjectSelections', () => {
  let sandbox;
  let renderer;
  let render;
  let ref;
  let useObjectSelections;
  let modalObjectStore;
  let app;
  let appSel;
  let appModal;
  let object;
  let objectSel;
  let layout;

  before(() => {
    sandbox = sinon.createSandbox();
    app = {
      id: 'appSel',
      session: {},
      abortModal: sandbox.stub(),
      forward: sandbox.stub(),
      back: sandbox.stub(),
      clearAll: sandbox.stub(),
      getField: sandbox.stub(),
    };
    appModal = {
      begin: sandbox.stub(),
      end: sandbox.stub(),
    };
    appSel = {
      isModal: sandbox.stub(),
    };
    layout = {};
    modalObjectStore = {
      set: sandbox.spy(),
      get: sandbox.stub(),
    };
    object = {
      beginSelections: sandbox.stub(),
      endSelections: sandbox.stub(),
      resetMadeSelections: sandbox.stub(),
      clearSelections: sandbox.stub(),
      select: sandbox.stub(),
    };
    [{ default: useObjectSelections }] = aw.mock(
      [
        [require.resolve('../useAppSelections'), () => () => [appSel]],
        [require.resolve('../useLayout'), () => () => [layout]],
        [
          require.resolve('../../stores/selections-store'),
          () => ({
            useAppSelectionsStore: () => [
              {
                get: () => appSel,
                set: (k, v) => {
                  appSel = v;
                },
              },
            ],
            useObjectSelectionsStore: () => [
              {
                get: () => objectSel,
                set: (k, v) => {
                  objectSel = v;
                },
              },
            ],
            useAppModalStore: () => [
              {
                get: () => appModal,
              },
            ],
            modalObjectStore,
          }),
        ],
      ],
      ['../useObjectSelections']
    );
  });
  beforeEach(() => {
    ref = React.createRef();
    render = async () => {
      await act(async () => {
        renderer = create(<TestHook ref={ref} hook={useObjectSelections} hookProps={[app, object]} />);
      });
      objectSel.setLayout(layout);
    };
  });
  afterEach(() => {
    sandbox.reset();
    renderer.unmount();
  });
  after(() => {
    sandbox.restore();
  });

  it('should create object selections', async () => {
    await render();
    await render();
    expect(ref.current.result[0]).to.equal(objectSel);
  });

  it('should begin', async () => {
    await render();
    await render();
    await ref.current.result[0].begin(['/foo']);
    expect(appModal.begin).to.have.been.calledWithExactly(object, ['/foo'], true);
  });

  it('should clear', async () => {
    await render();
    await render();
    ref.current.result[0].clear();
    expect(object.resetMadeSelections).to.have.been.calledWithExactly();

    ref.current.result[0].setLayout({ qListObject: {} });
    await ref.current.result[0].clear();
    expect(object.clearSelections).to.have.been.calledWithExactly('/qListObjectDef');
  });

  it('should confirm', async () => {
    await render();
    await render();
    await ref.current.result[0].confirm();
    expect(appModal.end).to.have.been.calledWithExactly(true);
  });

  it('should cancel', async () => {
    await render();
    await render();
    await ref.current.result[0].cancel();
    expect(appModal.end).to.have.been.calledWithExactly(false);
  });

  it('should select', async () => {
    await render();
    await render();

    appSel.isModal.returns(true);
    object.select.returns(true);
    const res = await ref.current.result[0].select({ method: 'select', params: [] });
    expect(res).to.equal(true);
  });

  it('should clear on non successful select', async () => {
    await render();
    await render();

    appSel.isModal.returns(true);
    object.select.returns(false);
    const res = await ref.current.result[0].select({ method: 'select', params: [] });
    expect(res).to.equal(false);
  });

  it('can clear', async () => {
    await render();
    await render();
    layout = {
      qListObject: {
        qDimensionInfo: {
          qLocked: false,
        },
      },
    };
    objectSel.setLayout(layout);
    expect(ref.current.result[0].canClear()).to.equal(true);

    layout = {
      qSelectionInfo: {
        qMadeSelections: true,
      },
    };
    objectSel.setLayout(layout);
    expect(ref.current.result[0].canClear()).to.equal(true);
  });

  it('can confirm', async () => {
    await render();
    await render();
    layout = {
      qListObject: {
        qDimensionInfo: {
          qLocked: false,
        },
      },
    };
    objectSel.setLayout(layout);
    expect(ref.current.result[0].canConfirm()).to.equal(true);

    layout = {
      qSelectionInfo: {
        qMadeSelections: true,
      },
    };
    objectSel.setLayout(layout);
    expect(ref.current.result[0].canConfirm()).to.equal(true);
  });

  it('can cancel', async () => {
    await render();
    await render();
    layout = {
      qListObject: {
        qDimensionInfo: {
          qLocked: false,
        },
      },
    };
    objectSel.setLayout(layout);
    expect(ref.current.result[0].canCancel()).to.equal(true);

    layout = {};
    objectSel.setLayout(layout);
    expect(ref.current.result[0].canCancel()).to.equal(true);
  });

  it('return modal state', async () => {
    await render();
    await render();

    appSel.isModal.returns(true);
    expect(ref.current.result[0].isModal()).to.equal(true);
  });

  it('begin modal state', async () => {
    await render();
    await render();

    ref.current.result[0].goModal(['/bar']);
    expect(appModal.begin).to.have.been.calledWithExactly(object, ['/bar'], false);
  });

  it('end modal state', async () => {
    await render();
    await render();

    ref.current.result[0].noModal(true);
    expect(appModal.end).to.have.been.calledWithExactly(true);
  });
});
