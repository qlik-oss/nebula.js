import React from 'react';
import useExistingModel from '../useExistingModel';
import render from '../../../../hooks/__tests__/test-hook';

describe('useExistingModel', () => {
  let useModelStoreMock;
  let app;
  let setMock;
  let getMock;
  let renderer;
  let doRender;
  let ref;
  let once;

  beforeEach(() => {
    jest.useFakeTimers();

    setMock = jest.fn();
    getMock = jest.fn();
    once = jest.fn();
    app = {
      getObject: jest.fn().mockResolvedValue({ id: 'generic-id', once }),
    };
    useModelStoreMock = jest.fn().mockReturnValue([
      {
        set: setMock,
        get: getMock,
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
    jest.restoreAllMocks();
    jest.resetAllMocks();
    renderer.unmount();
  });

  test('providing a qId should give a model fetched from the app', async () => {
    await doRender(useExistingModel, { app, qId: 'generic-id' });
    expect(getMock).toHaveBeenCalledWith('generic-id');
    expect(setMock).toHaveBeenCalledWith('generic-id', { id: 'generic-id', once });
    expect(ref.current.result).toEqual({ id: 'generic-id', once });
  });

  test('providing sessionModel should simply use that model', async () => {
    await doRender(useExistingModel, { options: { sessionModel: { id: 'session-model' } } });
    expect(ref.current.result).toEqual({ id: 'session-model' });
  });
});
