import React from 'react';
import { create, act } from 'react-test-renderer';
import { CircularProgress } from '@mui/material';

const [{ default: Progress }] = aw.mock([[require.resolve('@nebula.js/ui/theme'), () => ({})]], ['../Progress']);

describe('<Progress />', () => {
  let sandbox;
  let renderer;
  let render;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    render = async (size) => {
      await act(async () => {
        renderer = create(<Progress size={size} />);
      });
    };
  });
  afterEach(() => {
    sandbox.restore();
    renderer.unmount();
  });
  it('should render default', () => {
    render();
    const types = renderer.root.findAllByType(CircularProgress);
    expect(types).to.have.length(2);
    expect(types[0].props.size).to.equal(32);
    expect(types[1].props.size).to.equal(32);
  });
  it('should render small', () => {
    render('small');
    const types = renderer.root.findAllByType(CircularProgress);
    expect(types).to.have.length(2);
    expect(types[0].props.size).to.equal(16);
    expect(types[1].props.size).to.equal(16);
  });
  it('should render large', () => {
    render('large');
    const types = renderer.root.findAllByType(CircularProgress);
    expect(types).to.have.length(2);
    expect(types[0].props.size).to.equal(64);
    expect(types[1].props.size).to.equal(64);
  });
  it('should render xlarge', () => {
    render('xlarge');
    const types = renderer.root.findAllByType(CircularProgress);
    expect(types).to.have.length(2);
    expect(types[0].props.size).to.equal(128);
    expect(types[1].props.size).to.equal(128);
  });
});
