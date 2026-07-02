import EnigmaMocker from '@nebula.js/enigma-mocker';
import { embed } from '@nebula.js/stardust';
import { getConnectionInfo } from '../connect';
import { getModule } from '../hot';
import renderFixture from '../render-fixture';

jest.mock('@nebula.js/enigma-mocker', () => ({
  __esModule: true,
  default: {
    fromGenericObjects: jest.fn(),
  },
}));

jest.mock('@nebula.js/stardust', () => ({
  embed: jest.fn(),
}));

jest.mock('../connect', () => ({
  getConnectionInfo: jest.fn(),
}));

jest.mock('../hot', () => ({
  getModule: jest.fn(),
}));

describe('render-fixture', () => {
  let chartContainer;
  let qId;
  let baseLayout;
  let getLayoutBase;
  let mockObject;
  let mockApp;
  let nebbie;

  beforeEach(() => {
    document.body.innerHTML = '<div id="chart-container"></div><div id="events"></div>';
    chartContainer = document.querySelector('#chart-container');

    qId = 'obj-1';
    baseLayout = {
      qInfo: { qId },
      visualization: 'my-viz',
    };

    getLayoutBase = jest.fn(async () => baseLayout);
    mockObject = {
      getLayout: getLayoutBase,
    };

    mockApp = {
      getObject: jest.fn(async () => mockObject),
    };

    window.serveFixtures = new Map([
      [
        'my.fix.js',
        () => ({
          type: 'my-viz',
          load: async () => ({}),
          genericObjects: [{ getLayout: baseLayout }],
          snConfig: {},
        }),
      ],
    ]);

    getConnectionInfo.mockResolvedValue({ types: [] });
    getModule.mockResolvedValue(() => ({}));
    EnigmaMocker.fromGenericObjects.mockResolvedValue(mockApp);

    nebbie = {
      render: jest.fn(async () => {
        const vizEl = document.createElement('div');
        vizEl.className = 'njs-viz';
        vizEl.setAttribute('data-render-count', '1');
        chartContainer.appendChild(vizEl);

        const obj = await mockApp.getObject(qId);
        let onChanged = null;
        if (obj.on) {
          onChanged = async () => {
            await obj.getLayout();
            const current = parseInt(vizEl.getAttribute('data-render-count'), 10);
            vizEl.setAttribute('data-render-count', String(current + 1));
          };
          obj.on('changed', onChanged);
        }

        return {
          addListener: jest.fn(),
          destroy: jest.fn(async () => {
            if (obj.removeListener && onChanged) {
              obj.removeListener('changed', onChanged);
            }
            vizEl.remove();
          }),
        };
      }),
    };

    embed.mockReturnValue(nebbie);

    jest.spyOn(global, 'requestAnimationFrame').mockImplementation((cb) => setTimeout(cb, 0));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  test('throws a useful error when fixture cannot be found', async () => {
    await expect(renderFixture({ fixture: 'missing.fix.js' })).rejects.toThrow('Unable to load fixture missing.fix.js');
  });

  test('falls back to default generic object when fixture has none', async () => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(12345);
    window.serveFixtures.set('no-generic.fix.js', () => ({
      type: 'my-viz',
      load: async () => ({}),
      snConfig: {},
    }));

    await renderFixture({ fixture: 'no-generic.fix.js' });

    expect(EnigmaMocker.fromGenericObjects).toHaveBeenCalledWith(
      [
        {
          getLayout: {
            qInfo: { qId: 12345 },
            visualization: 'my-viz',
          },
        },
      ],
      undefined
    );
    nowSpy.mockRestore();
  });

  test('maps URL params to embed context', async () => {
    await renderFixture({ fixture: 'my.fix.js', theme: 'dark', language: 'sv-SE', keyboardNavigation: 'true' });

    expect(embed).toHaveBeenCalledWith(
      mockApp,
      expect.objectContaining({
        context: expect.objectContaining({
          theme: 'dark',
          language: 'sv-SE',
          keyboardNavigation: 'true',
        }),
      })
    );
  });

  test('rerenders requested number of times and updates container render count', async () => {
    await renderFixture({ fixture: 'my.fix.js', rerenders: '3' });

    expect(nebbie.render).toHaveBeenCalledTimes(4); // initial render + 3 rerenders
    expect(chartContainer.getAttribute('data-render-count')).toBe('3');
  });

  test('simulatedMemLeakKB keeps leak store reachable and triggers getLayout on changed events', async () => {
    await renderFixture({ fixture: 'my.fix.js', rerenders: '2', simulatedMemLeakKB: '8' });

    expect(Array.isArray(chartContainer.leakStore)).toBe(true);
    expect(chartContainer.leakStore.length).toBeGreaterThan(0);
    expect(getLayoutBase).toHaveBeenCalled();
  });
});
