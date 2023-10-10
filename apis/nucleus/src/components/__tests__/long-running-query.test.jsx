/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable no-import-assign */
import React from 'react';
import { create, act } from 'react-test-renderer';
import { Grid, Button } from '@mui/material';

import LongRunningQuery, { Cancel, Retry } from '../LongRunningQuery';
import * as ProgressModule from '../Progress';
import * as InstanceContextModule from '../../contexts/InstanceContext';

describe('<LongRunningQuery />', () => {
  let renderer;
  let render;
  let api;
  let Progress;
  let InstanceContext;

  beforeEach(() => {
    Progress = jest.fn().mockImplementation(() => 'progress');
    ProgressModule.default = Progress;
    InstanceContext = React.createContext();
    InstanceContextModule.default = InstanceContext;

    api = {
      cancel: jest.fn(),
      retry: jest.fn(),
    };
    render = async (canCancel, canRetry) => {
      await act(async () => {
        renderer = create(
          <InstanceContext.Provider value={{ translator: { get: (s) => s } }}>
            <LongRunningQuery canCancel={canCancel} canRetry={canRetry} api={api} />
          </InstanceContext.Provider>
        );
      });
    };
  });
  afterEach(() => {
    renderer.unmount();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  test('should render', async () => {
    await render();
    const types = renderer.root.findAllByType(Grid);
    expect(types).toHaveLength(1);
  });
  test('should handle cancel', async () => {
    const canCancel = true;
    await render(canCancel);
    const types = renderer.root.findAllByType(Cancel);
    expect(types).toHaveLength(1);
    const p = renderer.root.findAllByType(Progress);
    expect(p).toHaveLength(1);
    const cancelBtn = renderer.root.findByType(Button);

    cancelBtn.props.onClick();
    expect(api.cancel).toHaveBeenCalledTimes(1);
  });
  test('should handle retry', async () => {
    const canRetry = true;
    await render(undefined, canRetry);
    const types = renderer.root.findAllByType(Retry);
    expect(types).toHaveLength(1);
    const p = renderer.root.findAllByType(Progress);
    expect(p).toHaveLength(0);
    const retryBtn = renderer.root.findByType(Button);
    retryBtn.props.onClick();
    expect(api.retry).toHaveBeenCalledTimes(1);
  });
});
