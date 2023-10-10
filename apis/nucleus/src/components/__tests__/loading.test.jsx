/* eslint-disable no-import-assign */
import React from 'react';
import { create, act } from 'react-test-renderer';
import Loading from '../Loading';
import * as ProgressModule from '../Progress';

describe('<Loading />', () => {
  let renderer;
  let render;
  let Progress;

  beforeEach(() => {
    Progress = jest.fn().mockImplementation(() => 'progress');
    ProgressModule.default = Progress;

    render = async () => {
      await act(async () => {
        renderer = create(<Loading />);
      });
    };
  });
  afterEach(() => {
    renderer.unmount();
  });
  test('should render progress', async () => {
    await render();
    const types = renderer.root.findAllByType(Progress);
    expect(types).toHaveLength(1);
  });
});
