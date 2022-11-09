import React from 'react';
import { create, act } from 'react-test-renderer';
import Supernova from '../Supernova';

describe('<Supernova />', () => {
  let renderer;
  let render;
  beforeEach(() => {
    const addEventListener = jest.fn();
    const removeEventListener = jest.fn();
    global.document = {
      addEventListener,
      removeEventListener,
    };
    render = async ({
      sn = { component: {} },
      snOptions = {},
      snPlugins = [],
      layout = {},
      appLayout = {},
      halo = {},
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
    renderer.unmount();
  });
  test('should render default', async () => {
    await render();
    expect(renderer.root.props).toEqual({
      sn: {
        component: {},
      },
      snOptions: {},
      snPlugins: [],
      layout: {},
      appLayout: {},
      halo: {},
    });
  });
  test('should mount', async () => {
    const logicalSize = jest.fn();
    const component = {
      created: jest.fn(),
      mounted: jest.fn(),
      render: jest.fn(),
      willUnmount: jest.fn(),
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
    expect(component.created).toHaveBeenCalledTimes(1);
    expect(component.mounted).toHaveBeenCalledTimes(1);
  });
  test('should render', async () => {
    let initialRenderResolve;
    // eslint-disable-next-line no-new
    const initialRender = new Promise((resolve) => {
      initialRenderResolve = resolve;
    });
    const logicalSize = jest.fn().mockReturnValue('logical');
    const component = {
      created: jest.fn(),
      mounted: jest.fn(),
      render: jest.fn(),
      willUnmount: jest.fn(),
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
      halo: { public: { theme: 'theme', nebbie: 'embedAPI' }, app: { session: {} } },
      rendererOptions: {
        createNodeMock: () => ({
          style: {},
          getBoundingClientRect: () => ({ left: 100, top: 200, width: 300, height: 400 }),
        }),
      },
    });
    expect(component.created).toHaveBeenCalledTimes(1);
    expect(component.mounted).toHaveBeenCalledTimes(1);
    expect(await initialRender).toBe(true);
    expect(component.render).toHaveBeenCalledTimes(1);
    expect(component.render.mock.calls[0][0]).toEqual({
      layout: 'layout',
      options: snOptions,
      plugins: [],
      embed: 'embedAPI',
      context: {
        constraints: {},
        appLayout: { qLocaleInfo: 'loc' },
        theme: 'theme',
        keyboardNavigation: undefined,
        permissions: ['passive', 'interact', 'select', 'fetch'],
        localeInfo: 'loc',
        logicalSize: 'logical',
      },
    });
  });
  test.skip('should re-render', async () => {
    jest.useFakeTimers();
    const logicalSize = jest.fn();
    const component = {
      created: jest.fn(),
      mounted: jest.fn(),
      render: jest.fn(),
      willUnmount: jest.fn(),
    };
    const getBoundingClientRect = jest.fn().mockReturnValue({ left: 100, top: 200, width: 300, height: 400 });
    await render({
      sn: {
        logicalSize,
        component,
      },
      layout: {},
      halo: { public: {} },
      rendererOptions: {
        createNodeMock: () => ({
          style: {},
          getBoundingClientRect,
        }),
      },
    });
    // TODO:
    // we cannot simulate .callArg in jest
    await act(async () => {
      global.window.addEventListener.callArg(1);
    });
    jest.advanceTimersByTime(200);
    getBoundingClientRect.mockReturnValue({ left: 200, top: 300, width: 400, height: 500 });
    // TODO:
    // we cannot simulate .callArg in jest
    await act(async () => {
      global.window.addEventListener.callArg(1);
    });
    jest.advanceTimersByTime(200);
    expect(component.render).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });
});
