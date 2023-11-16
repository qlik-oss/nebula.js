/* eslint no-import-assign: 0 */
import React, { forwardRef, useImperativeHandle } from 'react';
import { create, act } from 'react-test-renderer';

import useAppSelections from '../useAppSelections';
import initSelectionStores from '../../stores/new-selections-store';
import * as useAppSelectionsNavigationModule from '../useAppSelectionsNavigation';

const TestHook = forwardRef(({ hook, hookProps = [] }, ref) => {
  const result = hook(...hookProps);
  useImperativeHandle(ref, () => ({
    result,
  }));
  return null;
});

describe('useAppSelections', () => {
  let renderer;
  let render;
  let ref;
  let modalObjectStore;
  let app;
  let navState;
  let currentSelectionsModel;
  let currentSelectionsLayout;
  let appSel;
  let appModal;
  let model;
  let objectSelections;
  let beginSelections;
  let endSelections;
  const selectionStoreModule = initSelectionStores('appId');

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

    ref = React.createRef();
    render = async () => {
      await act(async () => {
        renderer = create(<TestHook ref={ref} hook={useAppSelections} hookProps={[app]} />);
      });
    };
  });

  beforeEach(() => {
    navState = {
      canGoForward: true,
      canGoBack: true,
      canClear: true,
    };
    currentSelectionsModel = jest.fn();
    currentSelectionsLayout = jest.fn();
    modalObjectStore = {
      get: jest.fn(),
      set: jest.fn(),
      clear: jest.fn(),
    };

    jest
      .spyOn(useAppSelectionsNavigationModule, 'default')
      .mockImplementation(() => [navState, currentSelectionsModel, currentSelectionsLayout]);

    jest.spyOn(selectionStoreModule, 'useAppSelectionsStore').mockImplementation(() => [
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
    ]);
    selectionStoreModule.appModalStore = {
      set: (k, v) => {
        appModal = v;
      },
    };
    selectionStoreModule.modalObjectStore = modalObjectStore;

    beginSelections = jest.fn();
    endSelections = jest.fn();
    model = {
      beginSelections,
      endSelections,
    };
    objectSelections = {
      emit: jest.fn(),
    };
  });

  afterEach(() => {
    renderer.unmount();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  test('should create app selections', async () => {
    await render();
    expect(ref.current.result[0]).toEqual(appSel);
  });

  test('should retry failed beginSelections for error code 6003', async () => {
    await render();
    const res = Promise.resolve();
    // eslint-disable-next-line prefer-promise-reject-errors
    beginSelections.mockResolvedValueOnce(Promise.reject({ code: 6003 })).mockResolvedValueOnce(res);
    await appModal.begin({ model, objectSelections });
    await res;

    expect(beginSelections).toHaveBeenCalledTimes(2);
  });

  test('should not retry failed beginSelections', async () => {
    await render();

    // eslint-disable-next-line prefer-promise-reject-errors
    beginSelections.mockResolvedValueOnce(Promise.reject({ code: 9999 }));
    await appModal.begin({ model, objectSelections });

    expect(beginSelections).toHaveBeenCalledTimes(1);
  });

  test('should is in modal', async () => {
    await render();

    modalObjectStore.get.mockReturnValue(false);
    expect(ref.current.result[0].isInModal()).toBe(false);
    modalObjectStore.get.mockReturnValue(true);
    expect(ref.current.result[0].isInModal()).toBe(true);
  });

  test('should is modal', async () => {
    await render();
    const obj = {};
    modalObjectStore.get.mockReturnValue(obj);
    expect(ref.current.result[0].isModal(obj)).toBe(false);
    expect(ref.current.result[0].isModal({})).toBe(false);
    expect(ref.current.result[0].isModal()).toBe(true);
  });

  test('forward', async () => {
    await render();
    jest.spyOn(appModal, 'end').mockResolvedValue(Promise.resolve());
    await ref.current.result[0].forward();
    expect(app.forward).toHaveBeenCalledTimes(1);
  });

  test('back', async () => {
    await render();
    jest.spyOn(appModal, 'end').mockResolvedValue(Promise.resolve());
    await ref.current.result[0].back();
    expect(app.back).toHaveBeenCalledTimes(1);
  });

  test('clear', async () => {
    await render();
    jest.spyOn(appModal, 'end').mockResolvedValue(Promise.resolve());
    await ref.current.result[0].clear();
    expect(app.clearAll).toHaveBeenCalledTimes(1);
  });

  test('clear field', async () => {
    await render();
    jest.spyOn(appModal, 'end').mockResolvedValue(Promise.resolve());
    const clear = jest.fn();
    app.getField.mockResolvedValue(Promise.resolve({ clear }));
    await ref.current.result[0].clearField();
    expect(app.getField).toHaveBeenCalledTimes(1);
    expect(clear).toHaveBeenCalledTimes(1);
  });
});
