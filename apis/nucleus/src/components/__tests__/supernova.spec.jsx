import React from 'react';
import { create, act } from 'react-test-renderer';

const [{ default: Supernova }] = aw.mock([], ['../Supernova']);

describe('<Supernova />', () => {
  let sandbox;
  let renderer;
  let render;
  let initializedHalo;
  beforeEach(() => {
    initializedHalo = { public: { theme: { getStyle: () => {} }, nebbie: 'embedAPI' }, app: { session: {} } };
    sandbox = sinon.createSandbox();
    const addEventListener = sandbox.spy();
    const removeEventListener = sandbox.spy();
    global.window = {
      addEventListener,
      removeEventListener,
    };
    render = async ({
      sn = { component: {} },
      snOptions = {},
      snPlugins = [],
      layout = {},
      appLayout = {},
      halo = initializedHalo,
      rendererOptions,
    } = {}) => {
      await act(async () => {
        renderer = create(
          <Supernova
            sn={sn}
            snOptions={snOptions}
            snPlugins={snPlugins}
            layout={layout}
            appLayout={appLayout}
            halo={halo}
          />,
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
    await render({ halo: initializedHalo });
    expect(renderer.root.props).to.deep.equal({
      sn: {
        component: {},
      },
      snOptions: {},
      snPlugins: [],
      layout: {},
      appLayout: {},
      halo: initializedHalo,
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
    await render({
      sn: {
        logicalSize,
        component,
      },
      rendererOptions: {
        createNodeMock: () => ({
          style: {},
          getBoundingClientRect: () => ({ left: 100, top: 200, width: 300, height: 400 }),
        }),
      },
    });
    expect(component.created.callCount).to.equal(1);
    expect(component.mounted.callCount).to.equal(1);
  });
  it('should render', async () => {
    let initialRenderResolve;
    // eslint-disable-next-line no-new
    const initialRender = new Promise((resolve) => {
      initialRenderResolve = resolve;
    });
    const logicalSize = sandbox.stub().returns('logical');
    const component = {
      created: sandbox.spy(),
      mounted: sandbox.spy(),
      render: sandbox.spy(),
      willUnmount: sandbox.spy(),
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
      snPlugins: [],
      layout: 'layout',
      appLayout: { qLocaleInfo: 'loc' },
      rendererOptions: {
        createNodeMock: () => ({
          style: {},
          getBoundingClientRect: () => ({ left: 100, top: 200, width: 300, height: 400 }),
        }),
      },
    });
    await act(async () => {
      global.window.addEventListener.callArg(1);
    });
    expect(component.created.callCount).to.equal(1);
    expect(component.mounted.callCount).to.equal(1);
    expect(await initialRender).to.equal(true);
    expect(component.render.callCount).to.equal(1);
    expect(component.render.getCall(0).args[0]).to.eql({
      layout: 'layout',
      options: snOptions,
      plugins: [],
      embed: 'embedAPI',
      context: {
        constraints: {},
        appLayout: { qLocaleInfo: 'loc' },
        theme: initializedHalo.public.theme,
        permissions: ['passive', 'interact', 'select', 'fetch'],
        localeInfo: 'loc',
        logicalSize: 'logical',
      },
    });
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
    const getBoundingClientRect = sandbox.stub();
    getBoundingClientRect.returns({ left: 100, top: 200, width: 300, height: 400 });
    await render({
      sn: {
        logicalSize,
        component,
      },
      layout: {},
      rendererOptions: {
        createNodeMock: () => ({
          style: {},
          getBoundingClientRect,
        }),
      },
    });
    await act(async () => {
      global.window.addEventListener.callArg(1);
    });
    sandbox.clock.tick(200);
    getBoundingClientRect.returns({ left: 200, top: 300, width: 400, height: 500 });
    await act(async () => {
      global.window.addEventListener.callArg(1);
    });
    sandbox.clock.tick(200);
    expect(component.render.callCount).to.equal(2);
  });
});
