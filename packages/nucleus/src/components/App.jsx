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

const THEME_PREFIX = (process.env.NEBULA_VERSION || '').replace(/[.-]/g, '_');

let counter = 0;

function App({
  children,
}) {
  const { theme, generator } = useMemo(() => ({
    theme: createTheme(),
    generator: createGenerateClassName({
      productionPrefix: `${THEME_PREFIX}-`,
      disableGlobal: true,
      seed: `nebulajs-${counter++}`,
    }),
  }), []);

  return (
    <StylesProvider generateClassName={generator}>
      <ThemeProvider theme={theme}>
        <>
          {children}
        </>
      </ThemeProvider>
    </StylesProvider>
  );
}

export default function boot({
  app,
}) {
  const element = document.createElement('div');
  element.style.display = 'none';
  element.setAttribute('data-nebulajs-version', process.env.NEBULA_VERSION || '');
  element.setAttribute('data-app-id', app.id);
  document.body.appendChild(element);
  const components = [];

  const update = () => {
    ReactDOM.render(
      <App app={app}>{components}</App>,
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
    },
  };
}
