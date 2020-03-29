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
    const defaultCorona = {
      app: {
        id: 'app-id',
        getAppLayout: () => Promise.resolve(appLayout),
      },
      public: {
        nebbie: {
          types: {
            getSupportedVersion: sandbox.stub(),
          },
        },
      },
    };
    render = async ({
      model = {},
      app = {},
      nebbie = {},
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
      const corona = {
        ...defaultCorona,
        ...app,
        public: {
          nebbie: nebbie.types ? nebbie : { ...defaultCorona.public.nebbie },
        },
        config: {
          ...config,
        },
      };

      await act(async () => {
        renderer = create(
          <ThemeProvider theme={theme}>
            <InstanceContext.Provider value={{ translator: { get: s => s, language: () => 'sv' } }}>
              <Cell ref={cellRef} corona={corona} model={model} initialSnOptions={initialSnOptions} onMount={onMount} />
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
      const nebbie = {
        types: {
          get: sandbox.stub().returns({
            supernova: () => new Promise(() => {}),
          }),
          getSupportedVersion: sandbox.stub().returns('1.0.0'),
        },
      };
      await render({ nebbie });
      sandbox.clock.tick(800);
      const types = renderer.root.findAllByType(Loading);
      expect(types).to.have.length(1);
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
      const nebbie = {
        types: {
          get: sandbox.stub().returns({
            supernova: async () => ({ create: () => sn }),
          }),
          getSupportedVersion: sandbox.stub().returns('1.0.0'),
        },
      };
      await render({ nebbie });
      sandbox.clock.tick(2100);
      const types = renderer.root.findAllByType(LongRunningQuery);
      expect(types).to.have.length(0);
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
      const nebbie = {
        types: {
          get: sandbox.stub().returns({
            supernova: async () => ({ create: () => sn }),
          }),
          getSupportedVersion: sandbox.stub().returns('1.0.0'),
        },
      };
      await render({ nebbie });
      sandbox.clock.tick(2100);
      const types = renderer.root.findAllByType(LongRunningQuery);
      expect(types).to.have.length(1);
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
      const nebbie = {
        types: {
          get: sandbox.stub().returns({
            supernova: async () => ({ create: () => sn }),
          }),
          getSupportedVersion: sandbox.stub().returns('1.0.0'),
        },
      };
      await render({ nebbie });

      const types = renderer.root.findAllByType(Supernova);
      expect(types).to.have.length(1);
    });

    it('should render requirements', async () => {
      const sn = {
        generator: {
          qae: {
            data: {
              targets: [
                {
                  resolveLayout: () => '/foo',
                  dimensions: {
                    min: () => 1,
                    max: () => 1,
                  },
                  measures: {
                    min: () => 1,
                    max: () => 1,
                  },
                },
              ],
            },
          },
        },
      };
      const nebbie = {
        types: {
          get: sandbox.stub().returns({
            supernova: async () => ({ create: () => sn }),
          }),
          getSupportedVersion: sandbox.stub().returns('1.0.0'),
        },
      };
      await render({ nebbie });

      const types = renderer.root.findAllByType(CError);
      expect(types).to.have.length(1);
      expect(types[0].props.title).to.equal('Supernova.Incomplete');
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
      };
      const nebbie = {
        types: {
          get: sandbox.stub().returns({
            supernova: async () => ({ create: () => sn }),
          }),
          getSupportedVersion: sandbox.stub().returns('1.0.0'),
        },
      };
      await render({ nebbie });

      const types = renderer.root.findAllByType(CError);
      expect(types).to.have.length(1);
      expect(types[0].props.title).to.equal('Error');
      expect(types[0].props.data[0].path).to.equal('/foo');
      expect(types[0].props.data[0].error).to.deep.equal({ qErrorCode: 1337 });
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
      const nebbie = {
        types: {
          get: sandbox.stub().returns({
            supernova: async () => ({ create: () => sn }),
          }),
          getSupportedVersion: sandbox.stub().returns('1.0.0'),
        },
      };
      await render({ model, nebbie });
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
      const nebbie = {
        types: {
          get: sandbox.stub().returns({
            supernova: async () => ({ create: () => sn }),
          }),
          getSupportedVersion: sandbox.stub().returns('1.0.0'),
        },
      };
      await render({ model, nebbie });
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
      const nebbie = {
        types: {
          get: sandbox.stub().returns({
            supernova: async () => ({ create: () => sn }),
          }),
          getSupportedVersion: sandbox.stub().returns('1.0.0'),
        },
      };
      await render({ model, nebbie, cellRef });

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
      const nebbie = {
        types: {
          get: sandbox.stub().returns({
            supernova: async () => ({ create: () => sn }),
          }),
          getSupportedVersion: sandbox.stub().returns('1.0.0'),
        },
      };
      await render({
        nebbie,
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
      const nebbie = {
        types: {
          get: sandbox.stub().returns({
            supernova: async () => ({ create: () => sn }),
          }),
          getSupportedVersion: sandbox.stub().returns('1.0.0'),
        },
      };
      await render({
        nebbie,
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
      const nebbie = {
        types: {
          get: sandbox.stub().returns({
            supernova: async () => ({ create: () => sn }),
          }),
          getSupportedVersion: sandbox.stub().returns('1.0.0'),
        },
      };
      await render({
        nebbie,
        cellRef,
        config,
      });
      return expect(cellRef.current.exportImage()).to.eventually.be.rejectedWith(
        Error,
        'Nebula has not been configured with snapshot.capture callback'
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
      const nebbie = {
        types: {
          get: sandbox.stub().returns({
            supernova: async () => ({ create: () => sn }),
          }),
          getSupportedVersion: sandbox.stub().returns('1.0.0'),
        },
      };
      await render({
        nebbie,
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
