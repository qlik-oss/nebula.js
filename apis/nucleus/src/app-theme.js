/* eslint no-underscore-dangle:0 */
import themeFn from '@nebula.js/theme';

const timed = (t, v) => new Promise(resolve => setTimeout(() => resolve(v), t));

const LOAD_THEME_TIMEOUT = 5000;

export default function appTheme({ themes = [], root } = {}) {
  const theme = themeFn();

  const setTheme = async themeName => {
    const found = themes.filter(t => t.key === themeName)[0];
    let muiTheme = themeName === 'dark' ? 'dark' : 'light';
    if (found && found.load) {
      try {
        const raw = await Promise.race([found.load(), timed(LOAD_THEME_TIMEOUT, { __timedOut: true })]);
        if (raw.__timedOut) {
          if (__NEBULA_DEV__) {
            console.warn(`Timeout when loading theme '${themeName}'`); // eslint-disable-line no-console
          }
        } else {
          muiTheme = raw.type === 'dark' ? 'dark' : 'light';
          theme.internalAPI.setTheme(raw, themeName);
          root.setMuiThemeName(muiTheme);
        }
      } catch (e) {
        if (__NEBULA_DEV__) {
          console.error(e); // eslint-disable-line no-console
        }
      }
    } else {
      theme.internalAPI.setTheme(
        {
          type: muiTheme,
        },
        themeName
      );
      root.setMuiThemeName(muiTheme);
    }
  };

  return {
    setTheme,
    externalAPI: theme.externalAPI,
  };
}
