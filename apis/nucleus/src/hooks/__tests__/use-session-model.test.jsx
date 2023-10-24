/* eslint no-import-assign: 0 */
import React, { forwardRef, useImperativeHandle } from 'react';
import { create, act } from 'react-test-renderer';

import useSessionModel from '../useSessionModel';

const TestHook = forwardRef(({ hook, hookProps = [] }, ref) => {
  const result = hook(...hookProps);
  const result2 = hook(...hookProps);
  useImperativeHandle(ref, () => ({
    result,
    result2,
  }));
  return null;
});

describe('useSessionModel', () => {
  let renderer;
  let render;
  let ref;
  let app;

  beforeEach(() => {
    app = {
      id: 'appSel',
      session: {},
      createSessionObject: jest.fn().mockReturnValue(
        Promise.resolve({
          id: 'modelID',
          on: jest.fn(),
          once: jest.fn(),
        })
      ),
    };

    ref = React.createRef();
    render = async () => {
      await act(async () => {
        renderer = create(<TestHook ref={ref} hook={useSessionModel} hookProps={[{ id: 'inputID' }, app]} />);
      });
    };
  });

  afterEach(() => {
    renderer.unmount();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('create session object', async () => {
    await render();
    const model = await ref.current.result[0];
    expect(app.createSessionObject).toHaveBeenCalledTimes(1);
    expect(model.id).toEqual('modelID');

    await ref.current.result2[0];
    expect(app.createSessionObject).toHaveBeenCalledTimes(1);
  });
});
