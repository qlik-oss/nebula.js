/* eslint-disable no-param-reassign */
import React from 'react';
import { create, act } from 'react-test-renderer';
import { createTheme, ThemeProvider } from '@nebula.js/ui/theme';

describe('<Cell />', () => {
  let sandbox;
  let render;
  let renderer;
  let id = 0;
  let Loading;
  let LongRunningQuery;
  let CError;
  let Supernova;
  let Header;
  let InstanceContext;
  let useLayout;
  let layout;
  let layoutState;
  let longrunning;
  let appLayout = {};
  let Cell;

  before(() => {
    sandbox = sinon.createSandbox();
    Loading = () => 'loading';
    LongRunningQuery = () => 'long-running-query';
    CError = () => 'error';
    Supernova = () => 'supernova';
    Header = () => 'Header';
    InstanceContext = React.createContext();
    appLayout = { foo: 'app-layout' };
    layout = { qSelectionInfo: {} };
    layoutState = { validating: true, canCancel: false, canRetry: false };
    longrunning = { cancel: sandbox.spy(), retry: sandbox.spy() };
    useLayout = sandbox.stub().returns([layout, layoutState, longrunning]);
    [{ default: Cell }] = aw.mock(
      [
        [
          require.resolve('../../hooks/useLayout'),
          () => ({
            __esModule: true,
            default: useLayout,
            useAppLayout: () => [appLayout],
          }),
        ],
        [require.resolve('../Loading'), () => Loading],
        [require.resolve('../LongRunningQuery'), () => LongRunningQuery],
        [require.resolve('../Error'), () => CError],
        [require.resolve('../Supernova'), () => Supernova],
        [require.resolve('../Header'), () => Header],
        [require.resolve('../../contexts/InstanceContext'), () => InstanceContext],
      ],
      ['../Cell']
    );
  });

  beforeEach(() => {
    const addEventListener = sandbox.spy();
    const removeEventListener = sandbox.spy();
    global.window = {
      addEventListener,
      removeEventListener,
    };
    const defaultModel = {
      id: ++id,
      on: sandbox.stub(),
      removeListener: sandbox.stub(),
      getLayout: sandbox.stub().returns(
        new Promise(() => {
          // Do not resolve
        })
      ),
    };
    const defaultHalo = {
      app: {
        id: 'app-id',
        getAppLayout: () => Promise.resolve(appLayout),
      },
      public: {
        nebbie: {},
      },
      types: {
        getSupportedVersion: sandbox.stub(),
      },
    };
    render = async ({
      model = {},
      app = {},
      nebbie = {},
      types = defaultHalo.types,
      initialSnOptions = {},
      onMount = sandbox.spy(),
      theme = createTheme('dark'),
      cellRef,
      config = {},
      rendererOptions,
    } = {}) => {
      model = {
        ...defaultModel,
        ...model,
      };
      const halo = {
        ...defaultHalo,
        ...app,
        public: {
          nebbie,
        },
        config: {
          ...config,
        },
        types,
      };

      await act(async () => {
        renderer = create(
          <ThemeProvider theme={theme}>
            <InstanceContext.Provider value={{ translator: { get: (s) => s, language: () => 'sv' } }}>
              <Cell ref={cellRef} halo={halo} model={model} initialSnOptions={initialSnOptions} onMount={onMount} />
            </InstanceContext.Provider>
          </ThemeProvider>,
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

  it('should render version error', async () => {
    await render();
    const types = renderer.root.findAllByType(CError);
    expect(types).to.have.length(1);
  });

  describe('sn', () => {
    it('should render loading', async () => {
      sandbox.useFakeTimers();
      const types = {
        get: sandbox.stub().returns({
          supernova: () => new Promise(() => {}),
        }),
        getSupportedVersion: sandbox.stub().returns('1.0.0'),
      };
      await render({ types });
      sandbox.clock.tick(800);
      const ftypes = renderer.root.findAllByType(Loading);
      expect(ftypes).to.have.length(1);
      expect(() => renderer.root.findByType(LongRunningQuery)).to.throw();
    });

    it('should not render long running', async () => {
      sandbox.useFakeTimers();
      sandbox.stub(layoutState, 'validating').value(false);
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
        get: sandbox.stub().returns({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: sandbox.stub().returns('1.0.0'),
      };
      await render({ types });
      sandbox.clock.tick(2100);
      const ftypes = renderer.root.findAllByType(LongRunningQuery);
      expect(ftypes).to.have.length(0);
    });

    it('should render long running', async () => {
      sandbox.useFakeTimers();
      sandbox.stub(layoutState, 'validating').value(true);
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
        get: sandbox.stub().returns({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: sandbox.stub().returns('1.0.0'),
      };
      await render({ types });
      sandbox.clock.tick(2100);
      const ftypes = renderer.root.findAllByType(LongRunningQuery);
      expect(ftypes).to.have.length(1);
      expect(() => renderer.root.findByType(Loading)).to.throw();
    });

    it('should render', async () => {
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
        get: sandbox.stub().returns({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: sandbox.stub().returns('1.0.0'),
      };
      await render({ types });

      const ftypes = renderer.root.findAllByType(Supernova);
      expect(ftypes).to.have.length(1);
    });

    it('should render requirements', async () => {
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
        get: sandbox.stub().returns({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: sandbox.stub().returns('1.0.0'),
      };
      const model = {
        getProperties: async () => {},
      };
      await render({ types, model });

      const ftypes = renderer.root.findAllByType(CError);
      expect(ftypes).to.have.length(1);
      expect(ftypes[0].props.title).to.equal('Visualization.Incomplete');
    });

    it('should render hypercube error', async () => {
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
        get: sandbox.stub().returns({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: sandbox.stub().returns('1.0.0'),
      };
      await render({ types });

      const ftypes = renderer.root.findAllByType(CError);
      expect(ftypes).to.have.length(1);
      expect(ftypes[0].props.data[0].title).to.equal('/foo');
      expect(ftypes[0].props.data[0].descriptions[0].message).to.deep.equal({ qErrorCode: 1337 });
    });

    it('should go modal (selections)', async () => {
      sandbox.stub(layout, 'qSelectionInfo').value({ qInSelections: true });
      const model = {
        id: 'sn-modal',
      };
      const goModal = sandbox.spy();
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
            setLayout: sandbox.spy(),
            isModal: sandbox.stub().returns(false),
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
        get: sandbox.stub().returns({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: sandbox.stub().returns('1.0.0'),
      };
      await render({ model, types });
      expect(goModal.callCount).to.equal(1);
      expect(goModal).to.have.been.calledWithExactly('/qFoo');
    });

    it('should no modal (selections)', async () => {
      sandbox.stub(layout, 'qSelectionInfo').value({ qInSelections: false });
      const model = {
        id: 'sn-no-modal',
      };
      const noModal = sandbox.spy();
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
            setLayout: sandbox.spy(),
            isModal: sandbox.stub().returns(true),
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
        get: sandbox.stub().returns({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: sandbox.stub().returns('1.0.0'),
      };
      await render({ model, types });
      expect(noModal.callCount).to.equal(1);
    });
  });

  describe('cell ref', () => {
    it('should expose api', async () => {
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
        get: sandbox.stub().returns({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: sandbox.stub().returns('1.0.0'),
      };
      await render({ model, types, cellRef });

      expect(cellRef.current.setSnOptions).to.be.a('function');
      expect(cellRef.current.exportImage).to.be.a('function');
      expect(cellRef.current.takeSnapshot).to.be.a('function');
    });

    it('should take snapshot', async () => {
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
        get: sandbox.stub().returns({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: sandbox.stub().returns('1.0.0'),
      };
      await render({
        types,
        cellRef,
        rendererOptions: {
          createNodeMock: (/* e */) => {
            return {
              getBoundingClientRect: () => ({ left: 100, top: 200, width: 300, height: 400 }),
            };
          },
        },
      });
      await act(async () => {
        global.window.addEventListener.callArg(1);
      });
      const snapshot = await cellRef.current.takeSnapshot();
      const { key } = snapshot;
      delete snapshot.key;
      expect(key).to.be.a('string');
      expect(snapshot).to.deep.equal({
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

    it('should take snapshot and call setSnapshotData', async () => {
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
        get: sandbox.stub().returns({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: sandbox.stub().returns('1.0.0'),
      };
      await render({
        types,
        cellRef,
        rendererOptions: {
          createNodeMock: (/* e */) => {
            return {
              getBoundingClientRect: () => ({ left: 100, top: 200, width: 300, height: 400 }),
            };
          },
        },
      });
      await act(async () => {
        global.window.addEventListener.callArg(1);
      });
      const snapshot = await cellRef.current.takeSnapshot();
      expect(snapshot.layout).to.deep.equal({
        foo: 'bar',
      });
    });

    it('should not export image', async () => {
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
        get: sandbox.stub().returns({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: sandbox.stub().returns('1.0.0'),
      };
      await render({
        types,
        cellRef,
        config,
      });
      return expect(cellRef.current.exportImage()).to.eventually.be.rejectedWith(
        Error,
        'Stardust embed has not been configured with snapshot.capture callback'
      );
    });

    it('should export image', async () => {
      const config = {
        snapshot: {
          capture: sandbox.stub().returns('snapped'),
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
        get: sandbox.stub().returns({
          supernova: async () => ({ create: () => sn }),
        }),
        getSupportedVersion: sandbox.stub().returns('1.0.0'),
      };
      await render({
        types,
        cellRef,
        config,
      });
      sandbox.stub(cellRef.current, 'takeSnapshot').returns('snapshot');
      const res = await cellRef.current.exportImage();
      expect(config.snapshot.capture).to.have.been.calledWithExactly('snapshot');
      expect(res).to.equal('snapped');
    });
  });
});
