import * as NebulaThemeModule from '@nebula.js/theme';
import appThemeFn from '../app-theme';

jest.mock('@nebula.js/theme');

describe('app-theme', () => {
  let internalAPI;
  let setThemeMock;
  let themeMock;

  beforeEach(() => {
    setThemeMock = jest.fn();
    internalAPI = { setTheme: setThemeMock };
    themeMock = () => ({
      externalAPI: 'external',
      internalAPI,
    });
    jest.spyOn(NebulaThemeModule, 'default').mockImplementation(themeMock);
  });
  afterEach(() => {
    global.__NEBULA_DEV__ = false; // eslint-disable-line no-underscore-dangle
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should return external API', () => {
    const at = appThemeFn({});
    expect(at.externalAPI).toBe('external');
  });

  describe('custom', () => {
    let setMuiThemeNameMock;
    let warnMock;

    beforeEach(() => {
      warnMock = jest.fn();
      setMuiThemeNameMock = jest.fn();
      jest.useFakeTimers();
      global.console = {
        ...global.console,
        warn: warnMock,
      };
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should load and apply custom theme', async () => {
      const root = { setMuiThemeName: setMuiThemeNameMock };
      const at = appThemeFn({
        root,
        themes: [
          {
            id: 'darkish',
            load: () =>
              Promise.resolve({
                type: 'dark',
                color: 'red',
              }),
          },
        ],
      });
      await at.setTheme('darkish');
      expect(setMuiThemeNameMock).toHaveBeenCalledWith('dark');
      expect(internalAPI.setTheme).toHaveBeenCalledWith(
        {
          type: 'dark',
          color: 'red',
        },
        'darkish'
      );
    });

    test('should timeout after 5sec', async () => {
      const root = { setMuiThemeName: setMuiThemeNameMock };
      const at = appThemeFn({
        root,
        themes: [
          {
            id: 'darkish',
            load: () =>
              new Promise((resolve) => {
                setTimeout(resolve, 6000);
              }),
          },
        ],
      });
      global.__NEBULA_DEV__ = true; // eslint-disable-line no-underscore-dangle
      const prom = at.setTheme('darkish');
      jest.advanceTimersByTime(5500);
      await prom;
      expect(warnMock).toHaveBeenCalledWith("Timeout when loading theme 'darkish'");
    });
  });

  describe('defaults', () => {
    let setMuiThemeNameMock;

    beforeEach(() => {
      setMuiThemeNameMock = jest.fn();
    });

    test('should apply light theme on React root when themeName is not found', () => {
      const root = { setMuiThemeName: setMuiThemeNameMock };
      const at = appThemeFn({ root });
      at.setTheme('foo');
      expect(setMuiThemeNameMock).toHaveBeenCalledWith('light');
    });

    test('should apply dark theme on React root when themename is "dark"', () => {
      const root = { setMuiThemeName: setMuiThemeNameMock };
      const at = appThemeFn({ root });
      at.setTheme('dark');
      expect(setMuiThemeNameMock).toHaveBeenCalledWith('dark');
    });

    test('should apply "light" as type on internal theme', () => {
      const root = { setMuiThemeName: setMuiThemeNameMock };
      const at = appThemeFn({ root });
      at.setTheme('light');
      expect(internalAPI.setTheme).toHaveBeenCalledWith({ type: 'light' }, 'light');
    });
  });
});
