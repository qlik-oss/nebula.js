import React, { forwardRef, useImperativeHandle } from 'react';
import { create, act } from 'react-test-renderer';
import useExistingModel from '../useExistingModel';
import * as modelStoreModule from '../../../../stores/model-store';

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

  beforeEach(async () => {
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
    jest.resetAllMocks();
    renderer.unmount();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('providing a qId should give a model fetched from the app', async () => {
    await render(useExistingModel, { app, qId: 'generic-id' });
    expect(getMock).toHaveBeenCalledWith('generic-id');
    expect(setMock).toHaveBeenCalledWith('generic-id', { id: 'generic-id', once });
    expect(ref.current.result).toEqual({ id: 'generic-id', once });
    expect(once).toHaveBeenCalled();
    expect(once.mock.calls[0][0]).toEqual('closed');
  });

  test('providing sessionModel should simply use that model', async () => {
    const sessionModel = { id: 'session-model', once };
    await render(useExistingModel, { options: { sessionModel } });
    expect(ref.current.result?.id).toEqual('session-model');
    expect(once).toHaveBeenCalled();
    expect(once.mock.calls[0][0]).toEqual('closed');
  });
});
