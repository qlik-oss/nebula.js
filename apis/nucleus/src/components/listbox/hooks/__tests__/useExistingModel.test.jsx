import React from 'react';
import { act, create } from 'react-test-renderer';
import useExistingModel from '../useExistingModel';
import render from '../../../../hooks/__tests__/test-hook';
import initializeStores from '../../../../stores/new-model-store';
import InstanceContext from '../../../../contexts/InstanceContext';

describe('useExistingModel', () => {
  let useModelStoreMock;
  let app;
  let setMock;
  let removeMock;
  let getMock;
  let renderer;
  let doRender;
  let ref;
  let once;

  beforeEach(() => {
    jest.useFakeTimers();

    let cached;
    setMock = jest.fn((id, m) => {
      cached = m;
    });
    removeMock = jest.fn();
    getMock = jest.fn(() => cached);
    once = jest.fn();
    app = {
      getObject: jest.fn().mockResolvedValue({ id: 'generic-id', once, removeListener: jest.fn() }),
    };
    useModelStoreMock = jest.fn().mockReturnValue([
      {
        set: setMock,
        get: getMock,
        remove: removeMock,
      },
    ]);

    const setupContextMock = (context) => {
      jest.spyOn(context.modelStore, 'useModelStore').mockImplementation(useModelStoreMock);
    };

    ref = React.createRef();
    doRender = async (hook, ...hookProps) => {
      renderer = await render(ref, hook, hookProps, setupContextMock);
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
    renderer.unmount();
    jest.restoreAllMocks();
  });

  test('providing a qId should give a model fetched from the app', async () => {
    await doRender(useExistingModel, { app, qId: 'generic-id' });
    expect(getMock).toHaveBeenCalledWith('generic-id');
    expect(setMock).toHaveBeenCalledWith('generic-id', expect.objectContaining({ id: 'generic-id', once }));
    expect(ref.current.result).toEqual(expect.objectContaining({ id: 'generic-id', once }));
    expect(once).toHaveBeenCalled();
    expect(once.mock.calls[0][0]).toEqual('closed');
  });

  test('providing sessionModel should simply use that model', async () => {
    const sessionModel = { id: 'session-model', once, removeListener: jest.fn() };
    await doRender(useExistingModel, { options: { sessionModel } });
    expect(ref.current.result?.id).toEqual('session-model');
    expect(once).toHaveBeenCalled();
    expect(once.mock.calls[0][0]).toEqual('closed');
  });

  test('should remove the cached model on unmount so a recreated object with the same id is fetched anew', async () => {
    const model = { id: 'generic-id', once, removeListener: jest.fn() };
    app.getObject.mockResolvedValue(model);
    // the first two lookups (fetch, then 'is it cached') miss, the one on unmount finds our model
    getMock.mockReturnValueOnce(undefined).mockReturnValueOnce(undefined).mockReturnValue(model);
    await doRender(useExistingModel, { app, qId: 'generic-id' });
    expect(removeMock).not.toHaveBeenCalled();
    await act(async () => renderer.unmount());
    expect(model.removeListener).toHaveBeenCalledWith('closed', expect.any(Function));
    expect(removeMock).toHaveBeenCalledWith('generic-id');
  });

  test('should not remove a cache entry that holds another model on unmount', async () => {
    const model = { id: 'generic-id', once, removeListener: jest.fn() };
    app.getObject.mockResolvedValue(model);
    getMock.mockReturnValueOnce(undefined).mockReturnValueOnce(undefined).mockReturnValue({ id: 'generic-id' });
    await doRender(useExistingModel, { app, qId: 'generic-id' });
    await act(async () => renderer.unmount());
    expect(removeMock).not.toHaveBeenCalled();
  });

  describe('with the real model stores', () => {
    const createModel = (id) => {
      const listeners = {};
      return {
        id,
        on: jest.fn((evt, fn) => {
          (listeners[evt] = listeners[evt] || []).push(fn);
        }),
        once: jest.fn((evt, fn) => {
          (listeners[evt] = listeners[evt] || []).push(fn);
        }),
        removeListener: jest.fn((evt, fn) => {
          listeners[evt] = (listeners[evt] || []).filter((f) => f !== fn);
        }),
        emit: (evt) => [...(listeners[evt] || [])].forEach((fn) => fn()),
      };
    };

    test('should attach listeners to a model recreated with the same id after remount', async () => {
      const stores = initializeStores('app-id');
      const oldModel = createModel('generic-id');
      const newModel = createModel('generic-id');
      app.getObject.mockResolvedValueOnce(oldModel).mockResolvedValueOnce(newModel);
      useModelStoreMock.mockReturnValue([stores.modelStore]);

      await doRender(useExistingModel, { app, qId: 'generic-id' });
      expect(oldModel.on).toHaveBeenCalledWith('changed', expect.any(Function));
      // the hook's own 'closed' handler is the last one registered (the store middleware registers its own first)
      const lateOnClosed = oldModel.once.mock.calls.filter(([evt]) => evt === 'closed').at(-1)[1];
      await act(async () => renderer.unmount());
      expect(oldModel.removeListener).toHaveBeenCalledWith('changed', expect.any(Function));
      expect(stores.modelStore.get('generic-id')).toBeNull();

      await doRender(useExistingModel, { app, qId: 'generic-id' });
      expect(newModel.on).toHaveBeenCalledWith('changed', expect.any(Function));

      // a late 'closed' from the old model must not wipe state of the new one
      stores.rpcResultStore.set('generic-id', { some: 'result' });
      lateOnClosed();
      expect(stores.rpcResultStore.get('generic-id')).toEqual({ some: 'result' });
      expect(stores.modelStore.get('generic-id')).toBe(newModel);
    });

    test('should keep a model working for a second consumer when the first one unmounts', async () => {
      const stores = initializeStores('app-id');
      const model = createModel('generic-id');
      app.getObject.mockResolvedValue(model);
      const context = { modelStore: stores };
      function Consumer() {
        useExistingModel({ app, qId: 'generic-id' });
        return null;
      }
      const mount = async () => {
        let r;
        await act(async () => {
          r = create(
            <InstanceContext.Provider value={context}>
              <Consumer />
            </InstanceContext.Provider>
          );
        });
        return r;
      };
      const first = await mount();
      const second = await mount();

      await act(async () => first.unmount());

      expect(model.removeListener).not.toHaveBeenCalledWith('changed', expect.any(Function));
      expect(stores.modelStore.get('generic-id')).toBe(model);
      model.emit('changed');
      expect(stores.modelChangedStore.get('generic-id')).toEqual({});

      await act(async () => second.unmount());

      expect(model.removeListener).toHaveBeenCalledWith('changed', expect.any(Function));
      expect(stores.modelStore.get('generic-id')).toBeNull();
    });

    test('should not remove a model that was cached by someone else, e.g. a visualization', async () => {
      const stores = initializeStores('app-id');
      const model = createModel('generic-id');
      stores.modelStore.set('generic-id', model);
      app.getObject.mockResolvedValue(model);
      useModelStoreMock.mockReturnValue([stores.modelStore]);

      await doRender(useExistingModel, { app, qId: 'generic-id' });
      await act(async () => renderer.unmount());

      expect(model.removeListener).not.toHaveBeenCalledWith('changed', expect.any(Function));
      expect(stores.modelStore.get('generic-id')).toBe(model);
      model.emit('changed');
      expect(stores.modelChangedStore.get('generic-id')).toEqual({});
    });

    test('should drop a model cached by someone else from the cache when it closes', async () => {
      const stores = initializeStores('app-id');
      const model = createModel('generic-id');
      stores.modelStore.set('generic-id', model);
      app.getObject.mockResolvedValue(model);
      useModelStoreMock.mockReturnValue([stores.modelStore]);

      await doRender(useExistingModel, { app, qId: 'generic-id' });
      model.emit('closed');

      expect(stores.modelStore.get('generic-id')).toBeNull();
    });

    test('should release the cache entry of each model store independently for a shared session model', async () => {
      const storesA = initializeStores('app-id');
      const storesB = initializeStores('app-id');
      const sessionModel = createModel('session-id');
      const mount = async (stores) => {
        let r;
        function Consumer() {
          useExistingModel({ app, options: { sessionModel } });
          return null;
        }
        await act(async () => {
          r = create(
            <InstanceContext.Provider value={{ modelStore: stores }}>
              <Consumer />
            </InstanceContext.Provider>
          );
        });
        return r;
      };
      const a = await mount(storesA);
      const b = await mount(storesB);

      await act(async () => a.unmount());
      expect(storesA.modelStore.get('session-id')).toBeNull();
      expect(storesB.modelStore.get('session-id')).toBe(sessionModel);

      await act(async () => b.unmount());
      expect(storesB.modelStore.get('session-id')).toBeNull();
    });
  });
});
