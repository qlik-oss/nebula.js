/* eslint no-underscore-dangle:0 */
import themeFn from '@nebula.js/theme';

const timed = (t, v) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(v), t);
  });

const LOAD_THEME_TIMEOUT = 5000;

export default function appTheme({ themes = [], loadTheme, root } = {}) {
  const wrappedTheme = themeFn();

  const setTheme = async (themeId) => {
    let found = themes.filter((t) => t.id === themeId)[0];
    let muiTheme = themeId === 'dark' ? 'dark' : 'light';
    if (!found && loadTheme) {
      found = { load: loadTheme };
    }
    if (found && found.load) {
      try {
        const raw = await Promise.race([found.load(themeId), timed(LOAD_THEME_TIMEOUT, { __timedOut: true })]);
        if (raw.__timedOut) {
          if (__NEBULA_DEV__) {
            console.warn(`Timeout when loading theme '${themeId}'`); // eslint-disable-line no-console
          }
        } else {
          muiTheme = raw.type === 'dark' ? 'dark' : 'light';
          wrappedTheme.internalAPI.setTheme(raw, themeId);
          root.setMuiThemeName(muiTheme);
        }
      } catch (e) {
        if (__NEBULA_DEV__) {
          console.error(e); // eslint-disable-line no-console
        }
      }
    } else {
      wrappedTheme.internalAPI.setTheme(
        {
          type: muiTheme,
        },
        themeId
      );
      root.setMuiThemeName(muiTheme);
    }
  };

  return {
    setTheme,
    externalAPI: wrappedTheme.externalAPI,
  };
}
