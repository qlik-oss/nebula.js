/* eslint-disable no-param-reassign */
import React from 'react';
import { create, act } from 'react-test-renderer';
import { createTheme, ThemeProvider } from '@nebula.js/ui/theme';

const Loading = () => 'loading';
const LongRunningQuery = () => 'long-running-query';
const CError = () => 'error';
const Supernova = () => 'supernova';
const Header = () => 'Header';
const InstanceContext = React.createContext();

const [{ default: Cell }] = aw.mock(
  [
    [require.resolve('../Loading'), () => Loading],
    [require.resolve('../LongRunningQuery'), () => LongRunningQuery],
    [require.resolve('../Error'), () => CError],
    [require.resolve('../Supernova'), () => Supernova],
    [require.resolve('../Header'), () => Header],
    [require.resolve('../../contexts/InstanceContext'), () => InstanceContext],
  ],
  ['../Cell']
);

describe('<Cell />', () => {
  let sandbox;
  let render;
  let renderer;
  let id = 0;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
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
    const appLayout = { foo: 'app-layout' };
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

  it('should render loading', async () => {
    sandbox.useFakeTimers();
    await render();
    sandbox.clock.tick(800);
    const types = renderer.root.findAllByType(Loading);
    expect(types).to.have.length(1);
  });

  it('should render long running', async () => {
    sandbox.useFakeTimers();
    await render();
    sandbox.clock.tick(2100);
    const types = renderer.root.findAllByType(LongRunningQuery);
    expect(types).to.have.length(1);
  });

  it('should render version error', async () => {
    const model = {
      getLayout: sandbox.stub().returns(Promise.resolve({ visualization: 'wh0p' })),
    };
    await render({ model });
    const types = renderer.root.findAllByType(CError);
    expect(types).to.have.length(1);
  });

  describe('sn', () => {
    it('should render', async () => {
      const model = {
        getLayout: sandbox.stub().returns(Promise.resolve({ visualization: 'sn' })),
      };
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
      await render({ model, nebbie });

      const types = renderer.root.findAllByType(Supernova);
      expect(types).to.have.length(1);
    });

    it('should render requirements', async () => {
      const model = {
        getLayout: sandbox.stub().returns(Promise.resolve({ visualization: 'sn' })),
      };
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
      await render({ model, nebbie });

      const types = renderer.root.findAllByType(CError);
      expect(types).to.have.length(1);
      expect(types[0].props.title).to.equal('Supernova.Incomplete');
    });

    it('should render hypercube error', async () => {
      const layout = { visualization: 'sn', foo: { qError: { qErrorCode: 1337 } } };
      const model = {
        getLayout: sandbox.stub().returns(Promise.resolve(layout)),
      };
      const sn = {
        generator: {
          qae: {
            data: {
              targets: [
                {
                  layoutPath: '/foo',
                  resolveLayout: () => layout.foo,
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
      await render({ model, nebbie });

      const types = renderer.root.findAllByType(CError);
      expect(types).to.have.length(1);
      expect(types[0].props.title).to.equal('Error');
      expect(types[0].props.data[0].path).to.equal('/foo');
      expect(types[0].props.data[0].error).to.deep.equal({ qErrorCode: 1337 });
    });

    it('should go modal (selections)', async () => {
      const layout = { visualization: 'sn', qSelectionInfo: { qInSelections: true }, foo: {} };
      const model = {
        id: 'sn-modal',
        getLayout: sandbox.stub().returns(Promise.resolve(layout)),
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
                  resolveLayout: () => layout.foo,
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
      const layout = { visualization: 'sn-no-modal', qSelectionInfo: { qInSelections: false }, foo: {} };
      const model = {
        id: 'sn-no-modal',
        getLayout: sandbox.stub().returns(Promise.resolve(layout)),
      };
      const noModal = sandbox.spy();
      const sn = {
        generator: {
          qae: {
            data: {
              targets: [
                {
                  layoutPath: '/foo',
                  resolveLayout: () => layout.foo,
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
      const model = {
        getLayout: sandbox.stub().returns(Promise.resolve({ visualization: 'sn' })),
      };
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
      const model = {
        getLayout: sandbox.stub().returns(Promise.resolve({ visualization: 'sn' })),
      };
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
        model,
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
      global.window.addEventListener.callArg(1);
      const snapshot = await cellRef.current.takeSnapshot();
      const { key } = snapshot;
      delete snapshot.key;
      expect(key).to.be.a('string');
      expect(snapshot).to.deep.equal({
        layout: {
          visualization: 'sn',
        },
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
      const model = {
        getLayout: sandbox.stub().returns(Promise.resolve({ visualization: 'sn' })),
      };
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
        model,
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
      global.window.addEventListener.callArg(1);
      const snapshot = await cellRef.current.takeSnapshot();
      expect(snapshot.layout).to.deep.equal({
        foo: 'bar',
      });
    });
  });
});
