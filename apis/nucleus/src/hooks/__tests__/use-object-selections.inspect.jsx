/* eslint no-import-assign: 0 */
import React, { forwardRef, useImperativeHandle } from 'react';
import { create, act } from 'react-test-renderer';

import useObjectSelections from '../useObjectSelections';
import * as useAppSelectionsModule from '../useAppSelections';
import * as useLayoutModule from '../useLayout';
import * as selectionStoreModule from '../../stores/selections-store';

const TestHook = forwardRef(({ hook, hookProps = [] }, ref) => {
  const result = hook(...hookProps);
  useImperativeHandle(ref, () => ({
    result,
  }));
  return null;
});

describe.skip('useObjectSelections', () => {
  let renderer;
  let render;
  let ref;
  let modalObjectStore;
  let app;
  let appSel;
  let appModal;
  let object;
  let objectSel;
  let layout;

  beforeAll(() => {
    app = {
      id: 'appSel',
      session: {},
      abortModal: jest.fn(),
      forward: jest.fn(),
      back: jest.fn(),
      clearAll: jest.fn(),
      getField: jest.fn(),
    };
    appModal = {
      begin: jest.fn(),
      end: jest.fn(),
      _isMock: true,
    };
    appSel = {
      isModal: jest.fn(),
    };
    layout = {};
    modalObjectStore = {
      set: jest.fn(),
      get: jest.fn(),
    };
    object = {
      beginSelections: jest.fn(),
      endSelections: jest.fn(),
      resetMadeSelections: jest.fn(),
      clearSelections: jest.fn(),
      select: jest.fn(),
    };

    jest.spyOn(useAppSelectionsModule, 'default').mockImplementation(() => [appSel]);
    jest.spyOn(useLayoutModule, 'default').mockImplementation(() => [layout]);
    jest.spyOn(selectionStoreModule, 'useAppSelectionsStore').mockImplementation(() => [
      {
        get: () => appSel,
        set: (k, v) => {
          appSel = v;
        },
      },
    ]);
    jest.spyOn(selectionStoreModule, 'useObjectSelectionsStore').mockImplementation(() => [
      {
        get: () => objectSel,
        set: (k, v) => {
          objectSel = v;
        },
        dispatch: async (b) => {
          if (!b) return;
          await act(async () => {
            renderer.update(<TestHook ref={ref} hook={useObjectSelections} hookProps={[app, object]} />);
          });
        },
      },
    ]);
    jest.spyOn(selectionStoreModule, 'useAppModalStore').mockImplementation(() => [{ get: () => appModal }]);
    selectionStoreModule.modalObjectStore = modalObjectStore;

    ref = React.createRef();
    render = async () => {
      await act(async () => {
        renderer = create(<TestHook ref={ref} hook={useObjectSelections} hookProps={[app, object]} />);
      });
      objectSel.setLayout(layout);
    };
  });

  afterEach(() => {
    renderer.unmount();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  test('should create object selections', async () => {
    await render();
    expect(ref.current.result[0]).toEqual(objectSel);
  });

  test('should begin', async () => {
    await render();
    await ref.current.result[0].begin(['/foo']);
    expect(appModal.begin).toHaveBeenCalledTimes(1);
    expect(appModal.begin).toHaveBeenCalledWith(object, ['/foo'], true);
  });

  test('should clear', async () => {
    await render();
    ref.current.result[0].clear();
    expect(object.resetMadeSelections).toHaveBeenCalledWith();

    ref.current.result[0].setLayout({ qListObject: {} });
    await ref.current.result[0].clear();
    expect(object.clearSelections).toHaveBeenCalledWith('/qListObjectDef');
  });

  test('should confirm', async () => {
    await render();
    await ref.current.result[0].confirm();
    expect(appModal.end).toHaveBeenCalledWith(true);
  });

  test('should cancel', async () => {
    await render();
    await ref.current.result[0].cancel();
    expect(appModal.end).toHaveBeenCalledWith(false);
  });

  test('should select', async () => {
    await render();

    appSel.isModal.mockReturnValue(true);
    object.select.mockReturnValue(true);
    const res = await ref.current.result[0].select({ method: 'select', params: [] });
    expect(res).toBe(true);
  });

  test('should return false on non successful select', async () => {
    await render();

    appSel.isModal.mockReturnValue(true);
    object.select.mockReturnValue(false);
    const res = await ref.current.result[0].select({ method: 'select', params: [] });
    expect(res).toBe(false);
  });

  test('should not emit cleared on non successful select', async () => {
    await render();
    const cleared = jest.fn();
    objectSel.on('cleared', cleared);

    appSel.isModal.mockReturnValue(true);
    object.select.mockReturnValue(false);
    await objectSel.select({ method: 'select', params: [] });
    expect(cleared).not.toHaveBeenCalled();
  });

  test('should call resetMadeSelections on non successful select', async () => {
    await render();

    appSel.isModal.mockReturnValue(true);
    object.select.mockReturnValue(false);
    await objectSel.select({ method: 'select', params: [] });
    expect(object.resetMadeSelections).toHaveBeenCalledWith();
  });

  test('should not be possible to clear after select has be called with resetMadeSelections', async () => {
    await render();
    appSel.isModal.mockReturnValue(true);
    object.select.mockReturnValue(true);
    await objectSel.select({ method: 'resetMadeSelections', params: [] });

    expect(objectSel.canClear()).toBe(false);
  });

  test('can clear', async () => {
    await render();
    layout = {
      qListObject: {
        qDimensionInfo: {
          qLocked: false,
        },
      },
    };
    objectSel.setLayout(layout);
    expect(ref.current.result[0].canClear()).toBe(true);

    layout = {};
    objectSel.setLayout(layout);
    appSel.isModal.mockReturnValue(true);
    object.select.mockReturnValue(true);
    await objectSel.select({ method: 'select', params: [] });
    expect(ref.current.result[0].canClear()).toBe(true);
  });

  test('can confirm', async () => {
    await render();
    layout = {
      qListObject: {
        qDimensionInfo: {
          qLocked: false,
        },
      },
    };
    objectSel.setLayout(layout);
    expect(ref.current.result[0].canConfirm()).toBe(true);

    layout = {};
    objectSel.setLayout(layout);
    appSel.isModal.mockReturnValue(true);
    object.select.mockReturnValue(true);
    await objectSel.select({ method: 'select', params: [] });
    expect(ref.current.result[0].canConfirm()).toBe(true);
  });

  test('can cancel', async () => {
    await render();
    layout = {
      qListObject: {
        qDimensionInfo: {
          qLocked: false,
        },
      },
    };
    objectSel.setLayout(layout);
    expect(ref.current.result[0].canCancel()).toBe(true);

    layout = {};
    objectSel.setLayout(layout);
    expect(ref.current.result[0].canCancel()).toBe(true);
  });

  test('return modal state', async () => {
    await render();

    appSel.isModal.mockReturnValue(true);
    expect(ref.current.result[0].isModal()).toBe(true);
  });

  test('begin modal state', async () => {
    await render();

    ref.current.result[0].goModal(['/bar']);
    expect(appModal.begin).toHaveBeenCalledWith(object, ['/bar'], false);
  });

  test('end modal state', async () => {
    await render();

    ref.current.result[0].noModal(true);
    expect(appModal.end).toHaveBeenCalledWith(true);
  });
});
