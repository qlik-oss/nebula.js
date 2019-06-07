import React, {
  useMemo,
} from 'react';
import ReactDOM from 'react-dom';

import {
  createTheme,
  ThemeProvider,
  StylesProvider,
  createGenerateClassName,
} from '@nebula.js/ui/theme';

import LocaleContext from '../contexts/LocaleContext';

const THEME_PREFIX = (process.env.NEBULA_VERSION || '').replace(/[.-]/g, '_');

let counter = 0;

function NebulaApp({
  children,
  themeName,
  translator,
}) {
  const { theme, generator } = useMemo(() => ({
    theme: createTheme(themeName),
    generator: createGenerateClassName({
      productionPrefix: `${THEME_PREFIX}-`,
      disableGlobal: true,
      seed: `nebulajs-${counter++}`,
    }),
  }), [themeName]);

  return (
    <StylesProvider generateClassName={generator}>
      <ThemeProvider theme={theme}>
        <LocaleContext.Provider value={translator}>
          <>
            {children}
          </>
        </LocaleContext.Provider>
      </ThemeProvider>
    </StylesProvider>
  );
}

export default function boot({
  app,
  theme = 'light',
  translator,
}) {
  const element = document.createElement('div');
  element.style.display = 'none';
  element.setAttribute('data-nebulajs-version', process.env.NEBULA_VERSION || '');
  element.setAttribute('data-app-id', app.id);
  document.body.appendChild(element);
  const components = [];
  let themeName = theme;

  const update = () => {
    ReactDOM.render(
      <NebulaApp
        themeName={themeName}
        app={app}
        translator={translator}
      >
        {components}
      </NebulaApp>,
      element,
    );
  };

  // const unmount = () => {
  //   ReactDOM.unmountComponentAtNode(element);
  // };

  update();

  return {
    add(component) {
      components.push(component);
      update();
    },
    remove(component) {
      const idx = components.indexOf(component);
      if (idx !== -1) {
        components.splice(idx, 1);
      }
      update();
    },
    theme(name) {
      themeName = name;
      update();
    },
  };
}
