/* eslint-disable no-param-reassign */
/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable no-import-assign */
import React from 'react';
import { create, act } from 'react-test-renderer';
import { createTheme, ThemeProvider, StyledEngineProvider } from '@nebula.js/ui/theme';
import Cell from '../Cell';
import * as useLayoutModule from '../../hooks/useLayout';
import * as useRectModule from '../../hooks/useRect';
import * as LoadingModule from '../Loading';
import * as LongRunningQueryModule from '../LongRunningQuery';
import * as ErrorModule from '../Error';
import * as superNovaModule from '../Supernova';
import * as HeaderModule from '../Header';
import * as InstanceContextModule from '../../contexts/InstanceContext';

describe('<Cell />', () => {
  let render;
  let renderer;
  let id = 0;
  let Loading;
  let LongRunningQuery;
  let CError;
  let Supernova;
  let useRect;
  let Header;
  let InstanceContext;
  let useLayout;
  let layout;
  let layoutState;
  let longrunning;
  let appLayout = {};
  let fakeElement;
  let useObjectSelections;
  let defaultHalo;
  let defaultModel;

  beforeEach(() => {
    fakeElement = 'fakeElement';
    Loading = () => 'loading';
    LongRunningQuery = () => 'long-running-query';
    CError = () => 'error';
    Supernova = () => 'supernova';
    Header = () => 'Header';
    jest.useFakeTimers();
    Loading = jest.fn().mockImplementation(() => 'loading');
    LongRunningQuery = jest.fn().mockImplementation(() => 'long-running-query');
    CError = jest.fn().mockImplementation(() => 'error');
    Supernova = jest.fn().mockImplementation(() => 'supernova');
    Header = jest.fn().mockImplementation(() => 'Header');
    InstanceContext = React.createContext();
    appLayout = { foo: 'app-layout' };
    layout = { qSelectionInfo: {}, visualization: '' };
    layoutState = { validating: true, canCancel: false, canRetry: false };
    longrunning = { cancel: jest.fn(), retry: jest.fn() };
    useLayout = jest.fn().mockReturnValue([layout, layoutState, longrunning]);
    useRect = jest.fn().mockReturnValue([() => {}, { width: 300, height: 400 }]);
    useObjectSelections = jest.fn();

    jest.spyOn(useLayoutModule, 'default').mockImplementation(useLayout);
    jest.spyOn(useLayoutModule, 'useAppLayout').mockImplementation(() => [appLayout]);
    jest.spyOn(useRectModule, 'default').mockImplementation(useRect); // jest.spyOn does not working for these
    LoadingModule.default = Loading;
    LongRunningQueryModule.default = LongRunningQuery;
    ErrorModule.default = CError;
    superNovaModule.default = Supernova;
    HeaderModule.default = Header;
    InstanceContextModule.default = InstanceContext;

    useRect.mockReturnValue([() => {}, { width: 300, height: 400 }, fakeElement]);
    const selections = 'selections';
    useObjectSelections.mockReturnValue([selections]);
    const addEventListener = jest.fn();
    const removeEventListener = jest.fn();
    global.window = {
      addEventListener,
      removeEventListener,
    };
    defaultModel = {
      id: ++id,
      on: jest.fn(),
      removeListener: jest.fn(),
      getLayout: jest.fn().mockReturnValue(
        new Promise(() => {
          // Do not resolve
        })
      ),
    };
    defaultHalo = {
      app: {
        id: 'app-id',
        getAppLayout: () => Promise.resolve(appLayout),
      },
      public: {
        nebbie: {},
      },
      types: {
        getSupportedVersion: jest.fn(),
      },
    };
    render = async ({
      model = {},
      app = {},
      nebbie = {},
      types = defaultHalo.types,
      initialSnOptions = {},
      onMount = jest.fn(),
      theme = createTheme('dark'),
      cellRef,
      config = {},
      rendererOptions,
    } = {}) => {
      model = { ...defaultModel, ...model };
      const halo = {
        ...defaultHalo,
        ...app,
        public: { nebbie },
        config: { ...config },
        types,
      };

      await act(async () => {
        renderer = create(
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
              <InstanceContext.Provider value={{ translator: { get: (s) => s, language: () => 'sv' } }}>
                <Cell ref={cellRef} halo={halo} model={model} initialSnOptions={initialSnOptions} onMount={onMount} />
              </InstanceContext.Provider>
            </ThemeProvider>
          </StyledEngineProvider>,
          rendererOptions || null
        );
      });
    };

    defaultModel = {
      id: ++id,
      on: jest.fn(),
      removeListener: jest.fn(),
      getLayout: jest.fn().mockReturnValue(
        new Promise(() => {
          // Do not resolve
        })
      ),
    };
    defaultHalo = {
      app: {
        id: 'app-id',
        getAppLayout: () => Promise.resolve(appLayout),
      },
      public: {
        nebbie: {},
      },
      types: {
        getSupportedVersion: jest.fn(),
      },
    };
    render = async ({
      model = {},
      app = {},
      nebbie = {},
      types = defaultHalo.types,
      initialSnOptions = {},
      onMount = jest.fn(),
      theme = createTheme('dark'),
      cellRef,
      config = {},
      rendererOptions,
    } = {}) => {
      model = { ...defaultModel, ...model };
      const halo = {
        ...defaultHalo,
        ...app,
        public: { nebbie },
        config: { ...config },
        types,
      };

      await act(async () => {
        renderer = create(
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
              <InstanceContext.Provider value={{ translator: { get: (s) => s, language: () => 'sv' } }}>
                <Cell ref={cellRef} halo={halo} model={model} initialSnOptions={initialSnOptions} onMount={onMount} />
              </InstanceContext.Provider>
            </ThemeProvider>
          </StyledEngineProvider>,
          rendererOptions || null
        );
      });
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    renderer.unmount();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should render version error', async () => {
    await render();
    const types = renderer.root.findAllByType(CError);
    expect(types).toHaveLength(1);
  });

  test('should call useObjectSelection with expected args', async () => {
    await render();
    expect(useObjectSelections).calledTwice;
    const [, , clickOutElementsFirstRender] = useObjectSelections.args[0];
    const [app, model, clickOutElements] = useObjectSelections.args[1];
    expect(app).toEqual(defaultHalo.app);
    expect(model).toEqual(defaultModel);
    expect(clickOutElements).toEqual([{ current: 'fakeElement' }, '.njs-action-toolbar-popover']);
    expect(clickOutElementsFirstRender, 'because setClickOutElement has not yet been set').toEqual([
      { current: undefined },
      '.njs-action-toolbar-popover',
    ]);
  });

  describe('sn', () => {
    test('should render loading', async () => {
      const types = {
        get: jest.fn().mockReturnValue({
          supernova: () => new Promise(() => {}),
        }),
        getSupportedVersion: jest.fn().mockReturnValue('1.0.0'),
      };
      await render({ types });
      act(() => jest.advanceTimersByTime(800));
      const ftypes = renderer.root.findAllByType(Loading);
      expect(ftypes).toHaveLength(1);
      expect(() => renderer.root.findByType(LongRunningQuery)).toThrow();
    });

    test('should not render long running', async () => {
      layoutState.validating = false;
      const sn = {
        generator: {
          qae: {
            data: {
              targets: [],
            },
          },
        },
      };
      const types = {
        get: jest.fn().mockReturnValue({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: jest.fn().mockReturnValue('1.0.0'),
      };
      await render({ types });
      act(() => jest.advanceTimersByTime(2100));
      const ftypes = renderer.root.findAllByType(LongRunningQuery);
      expect(ftypes).toHaveLength(0);
    });

    test('should render long running', async () => {
      layoutState.validating = true;
      const sn = {
        generator: {
          qae: {
            data: {
              targets: [],
            },
          },
        },
      };
      const types = {
        get: jest.fn().mockReturnValue({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: jest.fn().mockReturnValue('1.0.0'),
      };
      await render({ types });
      act(() => jest.advanceTimersByTime(2100));
      const ftypes = renderer.root.findAllByType(LongRunningQuery);
      expect(ftypes).toHaveLength(1);
      expect(() => renderer.root.findByType(Loading)).toThrow();
    });

    test('should render', async () => {
      const sn = {
        generator: {
          qae: {
            data: {
              targets: [],
            },
          },
        },
      };
      const types = {
        get: jest.fn().mockReturnValue({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: jest.fn().mockReturnValue('1.0.0'),
      };
      await render({ types });

      const ftypes = renderer.root.findAllByType(Supernova);
      expect(ftypes).toHaveLength(1);
    });

    test('should render new type', async () => {
      const sn = {
        generator: {
          qae: {
            data: {
              targets: [],
            },
          },
        },
      };
      const sn1 = {
        generator: {
          qae: {
            data: {
              targets: [],
            },
          },
        },
      };
      const types = {
        get: jest.fn().mockImplementation(({ name }) => ({
          supernova: async () => ({ create: () => (name === 'sn1' ? sn1 : sn) }),
        })),
        getSupportedVersion: jest.fn().mockReturnValue('1.0.0'),
      };
      await render({ types });
      const renderedSn = renderer.root.findByType(Supernova);
      expect(renderedSn.props.sn).toEqual(sn);
      layout.visualization = 'sn1';
      await render({ types });
      const renderedSn1 = renderer.root.findByType(Supernova);
      expect(renderedSn1.props.sn).toEqual(sn1);
    });

    test('should render requirements', async () => {
      const localLayout = { visualization: 'sn', foo: { qDimensionInfo: [], qMeasureInfo: [] } };
      const sn = {
        generator: {
          qae: {
            data: {
              targets: [
                {
                  resolveLayout: () => localLayout.foo,
                  dimensions: {
                    min: () => 1,
                    max: () => 1,
                    description: (_properties, ix) =>
                      ix === 0
                        ? 'Column'
                        : 'Cells - dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd ',
                  },
                  measures: {
                    min: () => 1,
                    max: () => 1,
                    description: () => 'Size',
                  },
                },
              ],
            },
          },
        },
      };
      const types = {
        get: jest.fn().mockReturnValue({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: jest.fn().mockReturnValue('1.0.0'),
      };
      const model = {
        getProperties: async () => {},
      };
      await render({ types, model });

      const ftypes = renderer.root.findAllByType(CError);
      expect(ftypes).toHaveLength(1);
      expect(ftypes[0].props.title).toBe('Visualization.Incomplete');
    });

    test('should render requirements for multiple cubes', async () => {
      const localLayout = { visualization: 'sn', foo: { qDimensionInfo: [], qMeasureInfo: [] } };
      const sn = {
        generator: {
          qae: {
            data: {
              targets: [
                {
                  resolveLayout: () => localLayout.foo,
                  dimensions: {
                    min: () => 0,
                    max: () => 0,
                    description: (_properties, ix) =>
                      ix === 0
                        ? 'Column'
                        : 'Cells - dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd ',
                  },
                  measures: {
                    min: () => 0,
                    max: () => 0,
                    description: () => 'Size',
                  },
                },
                {
                  resolveLayout: () => localLayout.foo,
                  dimensions: {
                    min: () => 1,
                    max: () => 1,
                    description: (_properties, ix) =>
                      ix === 0
                        ? 'Column'
                        : 'Cells - dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd ',
                  },
                  measures: {
                    min: () => 1,
                    max: () => 1,
                    description: () => 'Size',
                  },
                },
              ],
            },
          },
        },
      };
      const types = {
        get: jest.fn().mockReturnValue({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: jest.fn().mockReturnValue('1.0.0'),
      };
      const model = {
        getProperties: async () => {},
      };
      await render({ types, model });

      const ftypes = renderer.root.findAllByType(CError);
      expect(ftypes).toHaveLength(1);
      expect(ftypes[0].props.title).toBe('Visualization.Incomplete');
    });

    test('should render hypercube error', async () => {
      const localLayout = { visualization: 'sn', foo: { qError: { qErrorCode: 1337 } } };
      const sn = {
        generator: {
          qae: {
            data: {
              targets: [
                {
                  layoutPath: '/foo',
                  resolveLayout: () => localLayout.foo,
                  dimensions: {
                    min: () => 0,
                    max: () => 0,
                    description: (_properties, ix) =>
                      ix === 0
                        ? 'Column'
                        : 'Cells - dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd ',
                  },
                  measures: {
                    min: () => 0,
                    max: () => 0,
                    description: () => 'Size',
                  },
                },
              ],
            },
          },
        },
      };
      const types = {
        get: jest.fn().mockReturnValue({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: jest.fn().mockReturnValue('1.0.0'),
      };
      await render({ types });

      const ftypes = renderer.root.findAllByType(CError);
      expect(ftypes).toHaveLength(1);
      expect(ftypes[0].props.data[0].title).toBe('Visualization.LayoutError');
    });

    test('should render hypercube unfulfilled calculation condition error', async () => {
      const localLayout = { visualization: 'sn', foo: { qError: { qErrorCode: 7005 } } };
      const sn = {
        generator: {
          qae: {
            data: {
              targets: [
                {
                  layoutPath: '/foo',
                  resolveLayout: () => localLayout.foo,
                  dimensions: {
                    min: () => 0,
                    max: () => 0,
                    description: (_properties, ix) =>
                      ix === 0
                        ? 'Column'
                        : 'Cells - dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd dkslfjd ',
                  },
                  measures: {
                    min: () => 0,
                    max: () => 0,
                    description: () => 'Size',
                  },
                },
              ],
            },
          },
        },
      };
      const types = {
        get: jest.fn().mockReturnValue({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: jest.fn().mockReturnValue('1.0.0'),
      };
      await render({ types });

      const ftypes = renderer.root.findAllByType(CError);
      expect(ftypes).toHaveLength(1);
      expect(ftypes[0].props.data[0].title).toBe('Visualization.UnfulfilledCalculationCondition');
    });

    test('should go modal (selections)', async () => {
      layout.qSelectionInfo = { qInSelections: true };
      const model = {
        id: 'sn-modal',
      };
      const goModal = jest.fn();
      const sn = {
        generator: {
          qae: {
            data: {
              targets: [
                {
                  propertyPath: '/qFoo',
                  layoutPath: '/foo',
                  resolveLayout: () => ({}),
                  dimensions: {
                    min: () => 0,
                    max: () => 0,
                  },
                  measures: {
                    min: () => 0,
                    max: () => 0,
                  },
                },
              ],
            },
          },
        },
        component: {
          selections: {
            id: 'sn-modal',
            setLayout: jest.fn(),
            isModal: jest.fn().mockReturnValue(false),
            goModal,
            canClear: () => false,
            canCancel: () => false,
            canConfirm: () => true,
          },
        },
        selectionToolbar: {
          items: [],
        },
      };
      const types = {
        get: jest.fn().mockReturnValue({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: jest.fn().mockReturnValue('1.0.0'),
      };
      await render({ model, types });
      expect(goModal).toHaveBeenCalledTimes(1);
      expect(goModal).toHaveBeenCalledWith('/qFoo');
    });

    test('should no modal (selections)', async () => {
      layout.qSelectionInfo = { qInSelections: false };
      const model = { id: 'sn-no-modal' };
      const noModal = jest.fn();
      const sn = {
        generator: {
          qae: {
            data: {
              targets: [
                {
                  layoutPath: '/foo',
                  resolveLayout: () => ({}),
                  dimensions: {
                    min: () => 0,
                    max: () => 0,
                  },
                  measures: {
                    min: () => 0,
                    max: () => 0,
                  },
                },
              ],
            },
          },
        },
        component: {
          selections: {
            id: 'sn-no-modal',
            setLayout: jest.fn(),
            isModal: jest.fn().mockReturnValue(true),
            noModal,
            canClear: () => false,
            canCancel: () => false,
            canConfirm: () => true,
          },
        },
        selectionToolbar: {
          items: [],
        },
      };
      const types = {
        get: jest.fn().mockReturnValue({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: jest.fn().mockReturnValue('1.0.0'),
      };
      await render({ model, types });
      expect(noModal).toHaveBeenCalledTimes(1);
    });
  });

  describe('cell ref', () => {
    test('should expose api', async () => {
      const cellRef = React.createRef();
      const model = {};
      const sn = {
        generator: {
          qae: {
            data: {
              targets: [],
            },
          },
        },
      };
      const types = {
        get: jest.fn().mockReturnValue({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: jest.fn().mockReturnValue('1.0.0'),
      };
      await render({ model, types, cellRef });

      expect(cellRef.current.setSnOptions instanceof Function).toBe(true);
      expect(cellRef.current.setSnPlugins instanceof Function).toBe(true);
      expect(cellRef.current.exportImage instanceof Function).toBe(true);
      expect(cellRef.current.takeSnapshot instanceof Function).toBe(true);
      expect(cellRef.current.getQae instanceof Function).toBe(true);
    });

    test('should take snapshot', async () => {
      const cellRef = React.createRef();
      const sn = {
        generator: {
          qae: {
            data: {
              targets: [],
            },
          },
        },
        component: {},
      };
      const types = {
        get: jest.fn().mockReturnValue({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: jest.fn().mockReturnValue('1.0.0'),
      };
      await render({
        types,
        cellRef,
        rendererOptions: {
          createNodeMock: (/* e */) => ({
            getBoundingClientRect: () => ({ left: 100, top: 200, width: 300, height: 400 }),
          }),
        },
      });
      /*
      await act(async () => {
        global.window.addEventListener.callArg(1);
      });
      */
      const snapshot = await cellRef.current.takeSnapshot();
      const { key } = snapshot;
      delete snapshot.key;
      expect(typeof key).toBe('string');
      expect(snapshot).toEqual({
        layout,
        meta: {
          appLayout: { foo: 'app-layout' },
          language: 'sv',
          theme: 'dark',
          size: {
            height: 400,
            width: 300,
          },
        },
      });
    });

    test('should take snapshot and call setSnapshotData', async () => {
      const cellRef = React.createRef();
      const sn = {
        generator: {
          qae: {
            data: {
              targets: [],
            },
          },
        },
        component: {
          setSnapshotData: () => ({
            foo: 'bar',
          }),
        },
      };
      const types = {
        get: jest.fn().mockReturnValue({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: jest.fn().mockReturnValue('1.0.0'),
      };
      await render({
        types,
        cellRef,
        rendererOptions: {
          createNodeMock: (/* e */) => ({
            getBoundingClientRect: () => ({ left: 100, top: 200, width: 300, height: 400 }),
          }),
        },
      });
      /*
      await act(async () => {
        global.window.addEventListener.callArg(1);
      });
      */
      const snapshot = await cellRef.current.takeSnapshot();
      expect(snapshot.layout).toEqual({ foo: 'bar' });
    });

    test('should not export image', async () => {
      const config = {
        snapshot: {
          capture: false,
        },
      };
      const cellRef = React.createRef();
      const sn = {
        generator: {
          qae: {
            data: {
              targets: [],
            },
          },
        },
        component: {},
      };
      const types = {
        get: jest.fn().mockReturnValue({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: jest.fn().mockReturnValue('1.0.0'),
      };
      await render({
        types,
        cellRef,
        config,
      });
      try {
        await cellRef.current.exportImage();
      } catch (error) {
        expect(error.message).toBe('Stardust embed has not been configured with snapshot.capture callback');
      }
    });

    test('should export image', async () => {
      const config = {
        snapshot: {
          capture: jest.fn().mockReturnValue('snapped'),
        },
      };
      const cellRef = React.createRef();
      const sn = {
        generator: {
          qae: {
            data: {
              targets: [],
            },
          },
        },
        component: {},
      };
      const types = {
        get: jest.fn().mockReturnValue({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: jest.fn().mockReturnValue('1.0.0'),
      };
      await render({
        types,
        cellRef,
        config,
      });
      jest.spyOn(cellRef.current, 'takeSnapshot').mockReturnValue('snapshot');
      const res = await cellRef.current.exportImage();
      expect(config.snapshot.capture).toHaveBeenCalledWith('snapshot');
      expect(res).toBe('snapped');
    });
  });
});
