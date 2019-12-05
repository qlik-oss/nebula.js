/* eslint-disable no-param-reassign */
import React from 'react';
import { create, act } from 'react-test-renderer';
import { createTheme, ThemeProvider } from '@nebula.js/ui/theme';

const Loading = () => 'loading';
const LongRunningQuery = () => 'long-running-query';
const CError = () => 'error';
const Supernova = () => 'supernova';
const Header = () => 'Header';
const LocaleContext = React.createContext();

const [{ default: Cell }] = aw.mock(
  [
    [require.resolve('../Loading'), () => Loading],
    [require.resolve('../LongRunningQuery'), () => LongRunningQuery],
    [require.resolve('../Error'), () => CError],
    [require.resolve('../Supernova'), () => Supernova],
    [require.resolve('../Header'), () => Header],
    [require.resolve('../../contexts/LocaleContext'), () => LocaleContext],
  ],
  ['../Cell']
);

describe('<Cell />', () => {
  let sandbox;
  let render;
  let renderer;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    const addEventListener = sandbox.spy();
    const removeEventListener = sandbox.spy();
    global.window = {
      addEventListener,
      removeEventListener,
    };
    const defaultModel = {
      on: sandbox.stub(),
      removeListener: sandbox.stub(),
      getLayout: sandbox.stub().returns(
        new Promise(() => {
          // Do not resolve
        })
      ),
    };
    const defaultNebulaContext = {
      app: {},
      nebbie: {
        types: {
          getSupportedVersion: sandbox.stub(),
        },
      },
    };
    render = async ({
      model = {},
      app = {},
      nebbie = {},
      initialSnContext = {},
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
      const nebulaContext = {
        ...defaultNebulaContext,
        ...app,
        ...(nebbie.types ? { nebbie } : {}),
      };

      await act(async () => {
        renderer = create(
          <ThemeProvider theme={theme}>
            <LocaleContext.Provider value={{ get: s => s }}>
              <Cell
                ref={cellRef}
                nebulaContext={nebulaContext}
                model={model}
                initialSnContext={initialSnContext}
                initialSnOptions={initialSnOptions}
                onMount={onMount}
              />
            </LocaleContext.Provider>
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
        id: 'sn',
        getLayout: sandbox.stub().returns(Promise.resolve(layout)),
      };
      const goModal = sandbox.spy();
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
            id: 'sn',
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
    });

    it('should no modal (selections)', async () => {
      const layout = { visualization: 'sn', qSelectionInfo: { qInSelections: false }, foo: {} };
      const model = {
        id: 'sn',
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
            id: 'sn',
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

      expect(cellRef.current.setSnContext).to.be.a('function');
      expect(cellRef.current.setSnOptions).to.be.a('function');
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
      expect(snapshot).to.deep.equal({
        visualization: 'sn',
        snapshotData: { object: { size: { w: 300, h: 400 } } },
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
      expect(snapshot).to.deep.equal({
        foo: 'bar',
      });
    });
  });
});
