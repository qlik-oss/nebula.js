import React from 'react';
import { act } from 'react-test-renderer';
import useExistingModel from '../useExistingModel';
import render from '../../../../hooks/__tests__/test-hook';

describe('useExistingModel', () => {
  let useModelStoreMock;
  let app;
  let setMock;
  let clearMock;
  let getMock;
  let renderer;
  let doRender;
  let ref;
  let once;

  beforeEach(() => {
    jest.useFakeTimers();

    setMock = jest.fn();
    clearMock = jest.fn();
    getMock = jest.fn();
    once = jest.fn();
    app = {
      getObject: jest.fn().mockResolvedValue({ id: 'generic-id', once, removeListener: jest.fn() }),
    };
    useModelStoreMock = jest.fn().mockReturnValue([
      {
        set: setMock,
        get: getMock,
        clear: clearMock,
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

  test('should clear the cached model on unmount so a recreated object with the same id is fetched anew', async () => {
    const model = { id: 'generic-id', once, removeListener: jest.fn() };
    app.getObject.mockResolvedValue(model);
    // the first two lookups (fetch, then 'is it cached') miss, the one on unmount finds our model
    getMock.mockReturnValueOnce(undefined).mockReturnValueOnce(undefined).mockReturnValue(model);
    await doRender(useExistingModel, { app, qId: 'generic-id' });
    expect(clearMock).not.toHaveBeenCalled();
    await act(async () => renderer.unmount());
    expect(model.removeListener).toHaveBeenCalledWith('closed', expect.any(Function));
    expect(clearMock).toHaveBeenCalledWith('generic-id');
  });

  test('should not clear a cache entry that holds another model on unmount', async () => {
    const model = { id: 'generic-id', once, removeListener: jest.fn() };
    app.getObject.mockResolvedValue(model);
    getMock.mockReturnValueOnce(undefined).mockReturnValueOnce(undefined).mockReturnValue({ id: 'generic-id' });
    await doRender(useExistingModel, { app, qId: 'generic-id' });
    await act(async () => renderer.unmount());
    expect(clearMock).not.toHaveBeenCalled();
  });
});
