import React from 'react';
import { create, act } from 'react-test-renderer';

const mockedReactDOM = { render: sinon.spy() };
const [{ default: boot, NebulaApp }] = aw.mock(
  [[require.resolve('react-dom'), () => mockedReactDOM]],
  ['../NebulaApp']
);

describe('Boot NebulaApp', () => {
  let sandbox;

  beforeEach(() => {
    mockedReactDOM.render.resetHistory();
    sandbox = sinon.createSandbox();
    const mockedElement = {
      style: {},
      setAttribute: sandbox.spy(),
      appendChild: sandbox.spy(),
    };
    global.document = {
      createElement: sandbox.stub().returns(mockedElement),
      body: mockedElement,
    };
  });
  afterEach(() => {
    sandbox.restore();
    delete global.document;
  });

  it('should call ReactDOM render', () => {
    boot({ app: { id: 'foo' } });
    expect(mockedReactDOM.render.callCount).to.equal(1);
  });
  it('should return api', () => {
    const [api] = boot({ app: { id: 'foo' } });
    expect(api.add).to.be.a('function');
    expect(api.remove).to.be.a('function');
    expect(api.theme).to.be.a('function');
    expect(api.direction).to.be.a('function');
  });
  it('should add component', async () => {
    const app = { id: 'foo' };
    const translator = {};
    const [api, appRef, rendered] = boot({ app, translator });
    appRef.current = {
      addComponent: sandbox.spy(),
    };

    await act(() => {
      mockedReactDOM.render.callArg(2);
      api.add('foo');
      return rendered;
    });
    expect(appRef.current.addComponent.callCount).to.equal(1);
  });
  it('should remove component', async () => {
    const app = { id: 'foo' };
    const translator = {};
    const [api, appRef, rendered] = boot({ app, translator });
    appRef.current = {
      removeComponent: sandbox.spy(),
    };

    await act(() => {
      mockedReactDOM.render.callArg(2);
      api.remove('foo');
      return rendered;
    });
    expect(appRef.current.removeComponent.callCount).to.equal(1);
  });
  it('should set theme', async () => {
    const app = { id: 'foo' };
    const translator = {};
    const [api, appRef, rendered] = boot({ app, translator });
    appRef.current = {
      setThemeName: sandbox.spy(),
    };

    await act(() => {
      mockedReactDOM.render.callArg(2);
      api.theme('wh0p');
      return rendered;
    });
    expect(appRef.current.setThemeName.callCount).to.equal(1);
  });
  it('should set direction', async () => {
    const app = { id: 'foo' };
    const translator = {};
    const [api, appRef, rendered] = boot({ app, translator });
    appRef.current = {
      setDirection: sandbox.spy(),
    };

    await act(() => {
      mockedReactDOM.render.callArg(2);
      api.direction('wingding');
      return rendered;
    });
    expect(appRef.current.setDirection.callCount).to.equal(1);
  });
});

describe.skip('<NebulaApp />', () => {
  let sandbox;
  let renderer;
  let render;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    render = async ({ translator, initialComponents, rendererOptions } = {}) => {
      await act(async () => {
        renderer = create(
          <NebulaApp translator={translator} initialComponents={initialComponents} />,
          rendererOptions || null
        );
      });
    };
  });
  afterEach(() => {
    sandbox.restore();
    renderer.unmount();
  });
  it('should render default', async () => {
    const foo = () => 'foo';
    const initialComponents = [foo];
    await render({
      initialComponents,
      rendererOptions: {
        createNodeMock: (/* e */) => {
          return {};
        },
      },
    });
    // console.log(renderer.props);
    // const t = renderer.root.findAllByType(foo);
    // console.log(t)
    // console.log(renderer.root.props.children);
  });
});
