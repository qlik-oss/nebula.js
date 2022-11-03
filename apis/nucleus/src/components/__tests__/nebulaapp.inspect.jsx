/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable no-import-assign */
import React from 'react';
import { create, act } from 'react-test-renderer';
import * as reactDomModule from 'react-dom';
import { ThemeProvider, StyledEngineProvider, createTheme } from '@nebula.js/ui/theme';
import * as InstanceContextModule from '../../contexts/InstanceContext';
import * as useAppSelectionsModule from '../../hooks/useAppSelections';

import boot, { NebulaApp } from '../NebulaApp';

jest.mock('react-dom', () => ({
  render: jest.fn(),
}));

describe('Boot NebulaApp', () => {
  let InstanceContext;
  let renderMock;

  beforeEach(() => {
    renderMock = jest.fn();

    InstanceContext = React.createContext();
    InstanceContextModule.default = InstanceContext;
    jest.spyOn(useAppSelectionsModule, 'default').mockImplementation(() => [{}]);
    jest.spyOn(reactDomModule, 'render').mockImplementation(renderMock);

    const mockedElement = {
      style: {},
      setAttribute: jest.fn(),
      appendChild: jest.fn(),
    };
    global.document = {
      createElement: jest.fn().mockReturnValue(mockedElement),
      body: mockedElement,
    };
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  test('should call ReactDOM render', () => {
    boot({ app: { id: 'foo' } });
    expect(renderMock).toHaveBeenCalledTimes(1);
  });
  test('should return api', () => {
    const [api] = boot({ app: { id: 'foo' } });
    expect(api.add instanceof Function).toBe(true);
    expect(api.remove instanceof Function).toBe(true);
    expect(api.setMuiThemeName instanceof Function).toBe(true);
    expect(api.context instanceof Function).toBe(true);
  });

  describe('test api methods', () => {
    let renderCallback;

    beforeEach(() => {
      jest.spyOn(reactDomModule, 'render').mockImplementation((el, container, callback) => {
        renderCallback = callback;
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
      jest.resetAllMocks();
    });

    test('should add component', async () => {
      const app = { id: 'foo' };
      const translator = {};
      const [api, appRef, rendered] = boot({ app, translator });
      appRef.current = {
        addComponent: jest.fn(),
      };

      await act(() => {
        renderCallback();
        api.add('foo');
        return rendered;
      });
      expect(appRef.current.addComponent).toHaveBeenCalledTimes(1);
    });
    test('should remove component', async () => {
      const app = { id: 'foo' };
      const translator = {};
      const [api, appRef, rendered] = boot({ app, translator });
      appRef.current = {
        removeComponent: jest.fn(),
      };

      await act(() => {
        renderCallback();
        api.remove('foo');
        return rendered;
      });
      expect(appRef.current.removeComponent).toHaveBeenCalledTimes(1);
    });
    test('should set mui theme', async () => {
      const app = { id: 'foo' };
      const translator = {};
      const [api, appRef, rendered] = boot({ app, translator });
      appRef.current = {
        setMuiThemeName: jest.fn(),
      };

      await act(() => {
        renderCallback();
        api.setMuiThemeName('wh0p');
        return rendered;
      });
      expect(appRef.current.setMuiThemeName).toHaveBeenCalledTimes(1);
    });
    test('should set context', async () => {
      const app = { id: 'foo' };
      const translator = {};
      const [api, appRef, rendered] = boot({ app, translator });
      appRef.current = {
        setContext: jest.fn(),
      };

      await act(() => {
        renderCallback();
        api.context('ctx');
        return rendered;
      });
      expect(appRef.current.setContext).toHaveBeenCalledTimes(1);
    });
    test('should get app selections', async () => {
      const app = { id: 'foo' };
      const translator = {};
      const [api, appRef, rendered] = boot({ app, translator });
      appRef.current = {
        getAppSelections: jest.fn().mockReturnValue('app-selections'),
      };

      await act(() => {
        renderCallback();
        api.getAppSelections();
        return rendered;
      });
      expect(await appRef.current.getAppSelections()).toBe('app-selections');
    });
  });
});

describe('<NebulaApp />', () => {
  let renderer;
  let render;
  let ref;
  let InstanceContext;
  beforeEach(() => {
    ref = React.createRef();
    jest.spyOn(useAppSelectionsModule, 'default').mockImplementation(() => [{}]);
    InstanceContext = React.createContext();
    InstanceContextModule.default = InstanceContext;

    render = async ({ initialContext, app, rendererOptions, theme = createTheme('dark') } = {}) => {
      await act(async () => {
        renderer = create(
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
              <InstanceContext.Provider value={{ translator: { get: (s) => s, language: () => 'sv' } }}>
                <NebulaApp ref={ref} initialContext={initialContext} app={app} />
              </InstanceContext.Provider>
            </ThemeProvider>
          </StyledEngineProvider>,
          rendererOptions || null
        );
      });
    };
  });
  afterEach(() => {
    renderer.unmount();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  test('should add component', async () => {
    const Foo = () => 'foo';
    await render();
    act(() => ref.current.addComponent(<Foo key="1" />));
    const res = renderer.root.findByType(Foo);
    expect(res).not.toBeNull();
  });

  test('should remove component', async () => {
    const Foo = () => 'foo';
    const MyFoo = <Foo key="1" />;
    await render();
    act(() => ref.current.addComponent(MyFoo));
    renderer.root.findByType(Foo);
    act(() => ref.current.removeComponent(MyFoo));
    expect(() => renderer.root.findByType(MyFoo)).toThrow();
  });
});
