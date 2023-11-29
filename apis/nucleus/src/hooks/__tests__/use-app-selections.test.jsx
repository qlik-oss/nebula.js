/* eslint no-import-assign: 0 */
import React, { forwardRef, useImperativeHandle } from 'react';
import { create, act } from 'react-test-renderer';

import useAppSelections from '../useAppSelections';
import InstanceContext from '../../contexts/InstanceContext';
import * as initSelectionStoresModule from '../../stores/new-selections-store';

const TestHook = forwardRef(({ hook, hookProps = [] }, ref) => {
  const result = hook(...hookProps);
  const result2 = hook(...hookProps);
  useImperativeHandle(ref, () => ({
    result,
    result2,
  }));
  return null;
});

let appId = 0;

describe('useAppSelections', () => {
  let doRender;
  let renderer;
  let app;
  let ref;
  let modalObjectStore;
  let appSel;
  let appModal;
  let model;
  let objectSelections;
  let beginSelections;
  let endSelections;
  let selectionStoreModule;
  let moduleSpy;

  beforeEach(() => {
    appModal = undefined;
    appSel = undefined;
    app = {
      id: `${appId++}`,
      session: {},
      abortModal: jest.fn(),
      forward: jest.fn(),
      back: jest.fn(),
      clearAll: jest.fn(),
      getField: jest.fn(),
    };
    modalObjectStore = {
      get: jest.fn(),
      set: jest.fn(),
      clear: jest.fn(),
    };
    beginSelections = jest.fn();
    endSelections = jest.fn();
    model = {
      beginSelections,
      endSelections,
    };
    objectSelections = {
      emit: jest.fn(),
    };

    selectionStoreModule = initSelectionStoresModule.default('appId');

    selectionStoreModule.appModalStore = {
      set: (k, v) => {
        appModal = v;
      },
    };
    selectionStoreModule.modalObjectStore = modalObjectStore;

    const context = {
      selectionStore: selectionStoreModule,
    };

    ref = React.createRef();

    moduleSpy = jest.spyOn(selectionStoreModule, 'useAppSelectionsStore').mockImplementation(() => [
      {
        get: () => appSel,
        set: (k, v) => {
          appSel = v;
        },
        dispatch: async (b) => {
          if (!b) return;
          await renderer.update(
            <InstanceContext.Provider value={context}>
              <TestHook ref={ref} hook={useAppSelections} hookProps={[app]} />
            </InstanceContext.Provider>
          );
        },
      },
    ]);

    doRender = async () => {
      await act(async () => {
        renderer = create(
          <InstanceContext.Provider value={context}>
            <TestHook ref={ref} hook={useAppSelections} hookProps={[app]} />
          </InstanceContext.Provider>
        );
      });
    };
  });

  afterEach(() => {
    renderer.unmount();
    moduleSpy.mockRestore();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  test('should create app selections', async () => {
    await doRender();
    expect(ref.current.result[0]).toEqual(appSel);
  });

  test('should retry failed beginSelections for error code 6003', async () => {
    await doRender();
    const res = Promise.resolve();
    // eslint-disable-next-line prefer-promise-reject-errors
    beginSelections.mockResolvedValueOnce(Promise.reject({ code: 6003 })).mockResolvedValueOnce(res);
    await appModal.begin({ model, objectSelections });
    await res;

    expect(beginSelections).toHaveBeenCalledTimes(2);
  });

  test('should not retry failed beginSelections', async () => {
    await doRender();

    // eslint-disable-next-line prefer-promise-reject-errors
    beginSelections.mockResolvedValueOnce(Promise.reject({ code: 9999 }));
    await appModal.begin({ model, objectSelections });

    expect(beginSelections).toHaveBeenCalledTimes(1);
  });

  test('should is in modal', async () => {
    await doRender();

    modalObjectStore.get.mockReturnValue(false);
    expect(ref.current.result[0].isInModal()).toBe(false);
    modalObjectStore.get.mockReturnValue(true);
    expect(ref.current.result[0].isInModal()).toBe(true);
  });

  test('should is modal', async () => {
    await doRender();
    const obj = {};
    modalObjectStore.get.mockReturnValue(obj);
    expect(ref.current.result[0].isModal(obj)).toBe(false);
    expect(ref.current.result[0].isModal({})).toBe(false);
    expect(ref.current.result[0].isModal()).toBe(true);
  });

  test('forward', async () => {
    await doRender();
    jest.spyOn(appModal, 'end').mockResolvedValue(Promise.resolve());
    await ref.current.result[0].forward();
    expect(app.forward).toHaveBeenCalledTimes(1);
  });

  test('back', async () => {
    await doRender();
    jest.spyOn(appModal, 'end').mockResolvedValue(Promise.resolve());
    await ref.current.result[0].back();
    expect(app.back).toHaveBeenCalledTimes(1);
  });

  test('clear', async () => {
    await doRender();
    jest.spyOn(appModal, 'end').mockResolvedValue(Promise.resolve());
    await ref.current.result[0].clear();
    expect(app.clearAll).toHaveBeenCalledTimes(1);
  });

  test('clear field', async () => {
    await doRender();
    jest.spyOn(appModal, 'end').mockResolvedValue(Promise.resolve());
    const clear = jest.fn();
    app.getField.mockResolvedValue(Promise.resolve({ clear }));
    await ref.current.result[0].clearField();
    expect(app.getField).toHaveBeenCalledTimes(1);
    expect(clear).toHaveBeenCalledTimes(1);
  });
});
