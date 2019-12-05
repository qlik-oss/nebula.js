import React from 'react';
import { create, act } from 'react-test-renderer';

const Progress = () => 'progress';
const [{ default: Loading }] = aw.mock([[require.resolve('../Progress'), () => Progress]], ['../Loading']);

describe('<Loading />', () => {
  let sandbox;
  let renderer;
  let render;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    render = async () => {
      await act(async () => {
        renderer = create(<Loading />);
      });
    };
  });
  afterEach(() => {
    sandbox.restore();
    renderer.unmount();
  });
  it('should render progress', () => {
    render();
    const types = renderer.root.findAllByType(Progress);
    expect(types).to.have.length(1);
  });
});
