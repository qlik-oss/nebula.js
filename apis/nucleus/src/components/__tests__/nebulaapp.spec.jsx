import React from 'react';
import { create, act } from 'react-test-renderer';
import { StylesProvider, ThemeProvider, createTheme } from '@nebula.js/ui/theme';

const mockedReactDOM = { render: sinon.spy() };
const [{ default: boot, NebulaApp }] = aw.mock(
  [
    [require.resolve('react-dom'), () => mockedReactDOM],
    [require.resolve('../../hooks/useAppSelections'), () => () => [{}]],
  ],
  ['../NebulaApp']
);

const InstanceContext = React.createContext();

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
    expect(api.setMuiThemeName).to.be.a('function');
    expect(api.context).to.be.a('function');
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
  it('should set mui theme', async () => {
    const app = { id: 'foo' };
    const translator = {};
    const [api, appRef, rendered] = boot({ app, translator });
    appRef.current = {
      setMuiThemeName: sandbox.spy(),
    };

    await act(() => {
      mockedReactDOM.render.callArg(2);
      api.setMuiThemeName('wh0p');
      return rendered;
    });
    expect(appRef.current.setMuiThemeName.callCount).to.equal(1);
  });
  it('should set context', async () => {
    const app = { id: 'foo' };
    const translator = {};
    const [api, appRef, rendered] = boot({ app, translator });
    appRef.current = {
      setContext: sandbox.spy(),
    };

    await act(() => {
      mockedReactDOM.render.callArg(2);
      api.context('ctx');
      return rendered;
    });
    expect(appRef.current.setContext.callCount).to.equal(1);
  });
  it('should get app selections', async () => {
    const app = { id: 'foo' };
    const translator = {};
    const [api, appRef, rendered] = boot({ app, translator });
    appRef.current = {
      getAppSelections: sandbox.stub().returns('app-selections'),
    };

    await act(() => {
      mockedReactDOM.render.callArg(2);
      api.getAppSelections();
      return rendered;
    });
    expect(await appRef.current.getAppSelections()).to.equal('app-selections');
  });
});

describe('<NebulaApp />', () => {
  let sandbox;
  let renderer;
  let render;
  let ref;
  beforeEach(() => {
    ref = React.createRef();
    sandbox = sinon.createSandbox();
    render = async ({ initialContext, app, rendererOptions, theme = createTheme('dark') } = {}) => {
      await act(async () => {
        renderer = create(
          <StylesProvider>
            <ThemeProvider theme={theme}>
              <InstanceContext.Provider value={{ translator: { get: (s) => s, language: () => 'sv' } }}>
                <NebulaApp ref={ref} initialContext={initialContext} app={app} />
              </InstanceContext.Provider>
            </ThemeProvider>
          </StylesProvider>,
          rendererOptions || null
        );
      });
    };
  });
  afterEach(() => {
    sandbox.restore();
    renderer.unmount();
  });

  it('should add component', async () => {
    const Foo = () => 'foo';
    await render();
    act(() => ref.current.addComponent(<Foo key="1" />));
    renderer.root.findByType(Foo);
  });

  it('should remove component', async () => {
    const Foo = () => 'foo';
    const MyFoo = <Foo key="1" />;
    await render();
    act(() => ref.current.addComponent(MyFoo));
    renderer.root.findByType(Foo);
    act(() => ref.current.removeComponent(MyFoo));
    expect(() => renderer.root.findByType(MyFoo)).to.throw();
  });
});
