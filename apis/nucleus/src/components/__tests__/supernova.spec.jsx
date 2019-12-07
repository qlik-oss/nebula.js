import React from 'react';
import { create, act } from 'react-test-renderer';

const [{ default: Supernova }] = aw.mock([], ['../Supernova']);

describe('<Supernova />', () => {
  let sandbox;
  let renderer;
  let render;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    const addEventListener = sandbox.spy();
    const removeEventListener = sandbox.spy();
    global.window = {
      addEventListener,
      removeEventListener,
    };
    render = async ({ sn = { component: {} }, snOptions = {}, snContext = {}, layout = {}, rendererOptions } = {}) => {
      await act(async () => {
        renderer = create(
          <Supernova sn={sn} snOptions={snOptions} snContext={snContext} layout={layout} />,
          rendererOptions || null
        );
      });
    };
  });
  afterEach(() => {
    sandbox.restore();
    renderer.unmount();
    delete global.window;
  });
  it('should render default', async () => {
    await render();
    expect(renderer.root.props).to.deep.equal({
      sn: {
        component: {},
      },
      snOptions: {},
      snContext: {},
      layout: {},
    });
  });
  it('should mount', async () => {
    const logicalSize = sandbox.stub();
    const component = {
      created: sandbox.spy(),
      mounted: sandbox.spy(),
      render: sandbox.spy(),
      willUnmount: sandbox.spy(),
    };
    const theme = {
      on: sandbox.spy(),
      removeListener: sandbox.spy(),
    };
    await render({
      sn: {
        logicalSize,
        component,
      },
      snContext: {
        theme,
      },
      rendererOptions: {
        createNodeMock: () => {
          return {
            style: {},
            getBoundingClientRect: () => ({ left: 100, top: 200, width: 300, height: 400 }),
          };
        },
      },
    });
    expect(component.created.callCount).to.equal(1);
    expect(component.mounted.callCount).to.equal(1);
    expect(theme.on.callCount).to.equal(1);
  });
  it('should constrain element', async () => {
    const logicalSize = sandbox.stub().returns({ width: 1024, height: 768 });
    const component = {
      created: sandbox.spy(),
      mounted: sandbox.spy(),
      render: sandbox.spy(),
      willUnmount: sandbox.spy(),
    };
    const theme = {
      on: sandbox.spy(),
      removeListener: sandbox.spy(),
    };
    const style = {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    };
    await render({
      sn: {
        logicalSize,
        component,
      },
      snContext: {
        theme,
      },
      rendererOptions: {
        createNodeMock: () => {
          return {
            style,
            getBoundingClientRect: () => ({ left: 100, top: 200, width: 300, height: 400 }),
          };
        },
      },
    });
    expect(style).to.deep.equal({ left: '0px', top: '87.5px', width: '300px', height: '225px' });
  });
  it('should render', async () => {
    let initialRenderResolve;
    // eslint-disable-next-line no-new
    const initialRender = new Promise(resolve => {
      initialRenderResolve = resolve;
    });
    const logicalSize = sandbox.stub();
    const component = {
      created: sandbox.spy(),
      mounted: sandbox.spy(),
      render: sandbox.spy(),
      willUnmount: sandbox.spy(),
    };
    const theme = {
      on: sandbox.spy(),
      removeListener: sandbox.spy(),
    };
    const snOptions = {
      onInitialRender() {
        initialRenderResolve(true);
      },
    };
    await render({
      sn: {
        logicalSize,
        component,
      },
      snOptions,
      snContext: {
        theme,
      },
      layout: {},
      rendererOptions: {
        createNodeMock: () => {
          return {
            style: {},
            getBoundingClientRect: () => ({ left: 100, top: 200, width: 300, height: 400 }),
          };
        },
      },
    });
    global.window.addEventListener.callArg(1);
    expect(component.created.callCount).to.equal(1);
    expect(component.mounted.callCount).to.equal(1);
    expect(theme.on.callCount).to.equal(1);
    expect(await initialRender).to.equal(true);
    expect(component.render.callCount).to.equal(1);
  });
  it('should re-render', async () => {
    sandbox.useFakeTimers();
    const logicalSize = sandbox.stub();
    const component = {
      created: sandbox.spy(),
      mounted: sandbox.spy(),
      render: sandbox.spy(),
      willUnmount: sandbox.spy(),
    };
    const theme = {
      on: sandbox.spy(),
      removeListener: sandbox.spy(),
    };
    const getBoundingClientRect = sandbox.stub();
    getBoundingClientRect.returns({ left: 100, top: 200, width: 300, height: 400 });
    await render({
      sn: {
        logicalSize,
        component,
      },
      snContext: {
        theme,
      },
      layout: {},
      rendererOptions: {
        createNodeMock: () => {
          return {
            style: {},
            getBoundingClientRect,
          };
        },
      },
    });
    global.window.addEventListener.callArg(1);
    sandbox.clock.tick(200);
    getBoundingClientRect.returns({ left: 200, top: 300, width: 400, height: 500 });
    global.window.addEventListener.callArg(1);
    sandbox.clock.tick(200);
    expect(component.render.callCount).to.equal(2);
  });
});
