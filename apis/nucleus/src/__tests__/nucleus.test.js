import Nuked from '../index';
import { getOptions } from '../components/listbox/ListBoxPortal';
import * as appLocaleModule from '../locale/app-locale';
import * as NebulaAppModule from '../components/NebulaApp';
import * as AppSelectionsModule from '../components/selections/AppSelections';
import * as createSessionObjectModule from '../object/create-session-object';
import * as getObjectModule from '../object/get-object';
import * as typesModule from '../sn/types';
import * as flagsModule from '../flags/flags';
import * as appThemeModule from '../app-theme';
import * as deviceTypeModule from '../device-type';

jest.mock('@qlik/api/auth', () => ({
  getWebResourceAuthParams: async () => ({
    queryParams: {},
  }),
}));

describe('nucleus', () => {
  let createObjectMock;
  let getObjectMock;
  let appThemeFnMock;
  let setThemeMock;
  let deviceTypeFnMock;
  let rootAppMock;
  let translator;
  let translatorAddMock;
  let translatorLanguageMock;
  let typesFnMock;

  beforeEach(() => {
    createObjectMock = jest.fn().mockReturnValue('created object');
    getObjectMock = jest.fn().mockReturnValue('got object');
    setThemeMock = jest.fn();
    appThemeFnMock = jest.fn().mockReturnValue({ externalAPI: 'external', setTheme: setThemeMock });
    deviceTypeFnMock = jest.fn().mockReturnValue('desktop');
    rootAppMock = jest.fn().mockReturnValue([
      { context: () => {} },
      {
        modelStore: new Map(),
        rpcRequestModelStore: new Map(),
      },
    ]);
    translatorAddMock = jest.fn();
    translatorLanguageMock = jest.fn();
    translator = { add: translatorAddMock, language: translatorLanguageMock, hi: 'hi' };
    typesFnMock = jest.fn().mockReturnValue({ getList: jest.fn() });

    // TODO:
    // this is not being mocked for no reason that i'm awared of:
    jest.spyOn(appLocaleModule, 'default').mockImplementation(() => ({ translator }));
    jest.spyOn(NebulaAppModule, 'default').mockImplementation(rootAppMock);
    jest.spyOn(AppSelectionsModule, 'default').mockImplementation(() => ({}));
    jest.spyOn(createSessionObjectModule, 'default').mockImplementation(createObjectMock);
    jest.spyOn(getObjectModule, 'default').mockImplementation(getObjectMock);
    jest.spyOn(typesModule, 'create').mockImplementation(typesFnMock);
    jest.spyOn(flagsModule, 'default').mockImplementation(() => 'flags');
    jest.spyOn(appThemeModule, 'default').mockImplementation(appThemeFnMock);
    jest.spyOn(deviceTypeModule, 'default').mockImplementation(deviceTypeFnMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('should merge Listbox options as expected', () => {
    test('should give correct defaults', () => {
      const squashedOptions = getOptions();
      expect(squashedOptions).toEqual({
        fetchStart: undefined,
        showGray: true,
        update: undefined,
        focusSearch: false,
        selectDisabled: undefined,
        selectionsApi: undefined,
        sessionModel: undefined,
        calculatePagesHeight: false,
        postProcessPages: undefined,
      });
    });

    test('should override defaults', () => {
      const update = () => {};
      const fetchStart = (arg) => {
        arg();
      };

      const squashedOptions = getOptions({
        __DO_NOT_USE__: {
          fetchStart,
          showGray: undefined,
          update,
        },
      });
      expect(squashedOptions).toEqual({
        fetchStart,
        showGray: undefined,
        update,
        focusSearch: false,
        selectDisabled: undefined,
        selectionsApi: undefined,
        sessionModel: undefined,
        calculatePagesHeight: false,
        postProcessPages: undefined,
      });
    });

    test('should not allow sneaking in non-exposed options as normal options', () => {
      const squashedOptions = getOptions({
        showGray: false,
        fetchStart: 'hey hey',
        update: 'nope',
      });
      expect(squashedOptions).toEqual({
        fetchStart: undefined,
        showGray: true,
        update: undefined,
        focusSearch: false,
        selectDisabled: undefined,
        selectionsApi: undefined,
        sessionModel: undefined,
        calculatePagesHeight: false,
        postProcessPages: undefined,
      });
    });
  });

  test('should initiate types with a public galaxy interface', () => {
    Nuked('app', {
      hostConfig: 'HOST',
      anything: {
        some: 'thing',
      },
    });
    const { galaxy } = typesFnMock.mock.lastCall[0].halo.public;
    expect(galaxy).toEqual({
      anything: {
        some: 'thing',
      },
      flags: 'flags',
      theme: 'external',
      deviceType: 'desktop',
      hostConfig: 'HOST',
      translator,
    });
  });

  test('should wait for theme before rendering object', async () => {
    jest.useFakeTimers();
    let waited = false;
    const delay = 1000;
    appThemeFnMock.mockReturnValue({
      setTheme: () =>
        new Promise((resolve) => {
          setTimeout(() => {
            waited = true;
            resolve();
          }, delay);
        }),
    });

    const nuked = Nuked();
    const prom = nuked.render({});
    jest.advanceTimersByTime(delay + 100);
    const c = await prom;
    expect(waited).toBe(true);
    expect(c).toBe('created object');
  });

  test('should initite root app with context', () => {
    Nuked('app');
    expect(rootAppMock.mock.lastCall[0]).toMatchObject({
      app: 'app',
      context: {
        constraints: {},
        deviceType: 'auto',
        disableCellPadding: false,
        keyboardNavigation: false,
        language: 'en-US',
        theme: 'light',
        translator: {
          add: expect.any(Function),
          language: expect.any(Function),
        },
      },
    });
  });

  test('should only update context when property is known and changed', async () => {
    const rootContextMock = jest.fn();
    const root = { context: rootContextMock };
    const theme = { setTheme: setThemeMock };

    rootAppMock.mockReturnValue([root]);
    appThemeFnMock.mockReturnValue(theme);

    const nuked = Nuked('app');
    expect(rootContextMock).toHaveBeenCalledTimes(0);

    nuked.context({ foo: 'a' });
    expect(rootContextMock).toHaveBeenCalledTimes(0);

    nuked.context({ constraints: 'a' });
    expect(rootContextMock).toHaveBeenCalledTimes(1);

    nuked.context({ language: 'sv-SE' });
    expect(rootContextMock).toHaveBeenCalledTimes(2);
    // expect(translatorLanguageMock).toHaveBeenCalledWith('sv-SE');

    await nuked.context({ theme: 'sv-SE' });
    expect(rootContextMock).toHaveBeenCalledTimes(3);
    expect(setThemeMock).toHaveBeenCalledWith('sv-SE');
  });

  test('should avoid type duplication', () => {
    const nuked = Nuked.createConfiguration({ types: ['foo', 'bar', 'foo', 'foo', 'baz'] });
    expect(nuked.config.types).toEqual(['foo', 'bar', 'baz']);
  });

  test('should allow for default flags and overrides', () => {
    const defaultFlags = {
      KPI_REACTCOLORPICKER: true,
      CLIENT_IM_3365: true,
    };
    const nuked = Nuked.createConfiguration({ flags: { foo: true } });
    expect(nuked.config.flags).toEqual({
      foo: true,
      ...defaultFlags,
    });

    const nuked2 = Nuked.createConfiguration({
      flags: { foo: true, KPI_REACTCOLORPICKER: false },
    });
    expect(nuked2.config.flags).toEqual({
      foo: true,
      ...defaultFlags,
      KPI_REACTCOLORPICKER: false,
    });
  });

  describe('render', () => {
    test('should render using create-session-object when no id provided', async () => {
      const nuked = Nuked();
      const result = await nuked.render({ type: 'barchart' });
      expect(createObjectMock).toHaveBeenCalledTimes(1);
      expect(result).toBe('created object');
    });

    test('should await setup promise before rendering', async () => {
      jest.useFakeTimers();
      let setupResolved = false;
      appThemeFnMock.mockReturnValue({
        externalAPI: 'external',
        setTheme: () =>
          new Promise((resolve) => {
            setTimeout(() => {
              setupResolved = true;
              resolve();
            }, 500);
          }),
      });

      const nuked = Nuked();
      const renderPromise = nuked.render({ type: 'barchart' });

      // Advance timers so setup resolves
      jest.advanceTimersByTime(600);

      const result = await renderPromise;
      expect(setupResolved).toBe(true);
      expect(result).toBe('created object');

      jest.useRealTimers();
    });

    test('should add and remove abort listener when signal provided', async () => {
      const mockSignal = {
        throwIfAborted: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };

      const nuked = Nuked();
      await nuked.render({ type: 'barchart', signal: mockSignal });

      // Verify listener added with correct options
      expect(mockSignal.addEventListener).toHaveBeenCalledWith('abort', expect.any(Function), { once: true });

      // Verify same handler removed in finally after render completes
      expect(mockSignal.removeEventListener).toHaveBeenCalledTimes(2);
      const addedHandler = mockSignal.addEventListener.mock.calls[1][1];
      const removedHandler = mockSignal.removeEventListener.mock.calls[0][1];
      expect(addedHandler).toBe(removedHandler);
    });

    test('should call destroy on vizApi when abort signal fires during render', async () => {
      const vizApiMock = { destroy: jest.fn() };
      let resolveVizApi;
      const vizPromise = new Promise((resolve) => {
        resolveVizApi = () => resolve(vizApiMock);
      });
      createObjectMock.mockReturnValue(vizPromise);

      // Collect all abort handlers (render adds one, raceWithAbort adds another)
      const abortHandlers = [];
      const abortReason = new Error('Aborted');
      const mockSignal = {
        throwIfAborted: jest.fn(),
        addEventListener: jest.fn((_, handler) => {
          abortHandlers.push(handler);
        }),
        removeEventListener: jest.fn(),
        reason: abortReason,
      };

      const nuked = Nuked();

      // Start render but don't await - it will be pending
      const renderPromise = nuked.render({ type: 'barchart', signal: mockSignal });

      // Wait for setup promise and async work to complete so addEventListener is called
      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });

      // Both render() and raceWithAbort() should have registered handlers
      expect(abortHandlers).toHaveLength(2);

      // Simulate abort by calling all registered handlers
      abortHandlers.forEach((handler) => handler());

      // Now resolve the vizApi so destroy can be called
      resolveVizApi();

      // Verify render rejects with AbortError
      await expect(renderPromise).rejects.toThrow(abortReason);

      // Flush promise chain for destroy - the abort handler calls vizApiPromise.then()
      // which schedules a microtask after vizApiPromise resolves
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });

      expect(vizApiMock.destroy).toHaveBeenCalledTimes(1);
    });
  });
});
