import React, { forwardRef, useImperativeHandle } from 'react';
import { create, act } from 'react-test-renderer';
import useExistingModel from '../useExistingModel';
import initializeStores from '../../../../stores/new-model-store';

const TestHook = forwardRef(({ hook, hookProps }, ref) => {
  const result = hook(...hookProps);
  useImperativeHandle(ref, () => ({
    result,
  }));
  return null;
});

describe('useExistingModel', () => {
  let useModelStoreMock;
  let app;
  let setMock;
  let getMock;
  let renderer;
  let render;
  let ref;
  let once;

  const modelStoreModule = initializeStores('appId');

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

    jest.spyOn(modelStoreModule, 'useModelStore').mockImplementation(useModelStoreMock);

    ref = React.createRef();
    render = async (hook, ...hookProps) => {
      await act(async () => {
        renderer = create(<TestHook ref={ref} hook={hook} hookProps={hookProps} />);
      });
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    jest.resetAllMocks();
    renderer.unmount();
  });

  test('providing a qId should give a model fetched from the app', async () => {
    await render(useExistingModel, { app, qId: 'generic-id' });
    expect(getMock).toHaveBeenCalledWith('generic-id');
    expect(setMock).toHaveBeenCalledWith('generic-id', { id: 'generic-id', once });
    expect(ref.current.result).toEqual({ id: 'generic-id', once });
  });

  test('providing sessionModel should simply use that model', async () => {
    await render(useExistingModel, { options: { sessionModel: { id: 'session-model' } } });
    expect(ref.current.result).toEqual({ id: 'session-model' });
  });
});
