/* eslint no-import-assign: 0 */
import React from 'react';
import useSessionModel from '../useSessionModel';
import render from './test-hook';

describe('useSessionModel', () => {
  let renderer;
  let doRender;
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
    doRender = async () => {
      renderer = await render(ref, useSessionModel, [{ id: 'inputID' }, app]);
    };
  });

  afterEach(() => {
    renderer.unmount();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('create session object', async () => {
    await doRender();
    const model = await ref.current.result[0];
    expect(app.createSessionObject).toHaveBeenCalledTimes(1);
    expect(model.id).toEqual('modelID');

    await ref.current.result2[0];
    expect(app.createSessionObject).toHaveBeenCalledTimes(1);
  });
});
